import admin from '../configs/firebase_config.js';
import axios from 'axios';
import { requiredEnv, newGoogleOauth2, getAuthUrl } from '../utils/utils.js';
import { ERROR_CODES, ROLES, SUCCESS_MESSAGES, USER_ERRORS } from '../constants.js';
import { withdb } from '../databases/mysql.js';
import { q_addEmailVerificationCode, q_addUser, q_deleteUserByUid, q_getUserById, q_getUserByUid, q_isEmailVerified, q_userExists, q_verifyEmailCode } from '../databases/queries.js';
import { google } from 'googleapis';
import sendEmail, { generateVerificationCode } from "../helpers/email_verification.js";
import { asyncHandler } from '../helpers/utils.js';

const allowedRoles = ["client", "provider", "admin"];
const DISABLE_EMAIL_VERIFICATION = true;
export async function emailVerificationController(req, res) {
    const { code } = req.body;
    console.log(req.body);

    try {
        const userId = await withdb(conn => q_verifyEmailCode(conn, code));

        if (!userId) {
            return res.status(400).json({
                success: false,
                errors: ["Código inválido o expirado"]
            });
        }

        res.status(201).json({
            success: true,
            data: { userId },
            details: [SUCCESS_MESSAGES.EMAIL_CONFMIRMED]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, errors: [err.message] });
    }
}


async function sendVerifycationCode(userId, email) {
    try {
        const verificationToken = await generateVerificationCode();

        await withdb(conn =>
            q_addEmailVerificationCode(conn, userId, verificationToken.hashedCode)
        );


        const emailData = await sendEmail(email, verificationToken.code);


        return { success: true };
    } catch (error) {
        console.error('[sendVerificationEmail] Error:', error);
        throw error;
    }
}

export async function sendVerificationEmailController(req, res) {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({
            success: false,
            errors: [{ code: "MISSING_ID", message: "ID es requerido" }]
        });
    }

    try {
        const user = await withdb(conn => q_getUserById(conn, id));

        if (!user) {
            return res.status(404).json({
                success: false,
                errors: [USER_ERRORS.USER_NOT_FOUND]
            });
        }

        await sendVerifycationCode(id, user.email);

        res.status(200).json({
            success: true,
            message: "Email de verificación enviado"
        });
    } catch (error) {
        console.error('[sendVerificationEmailController] Error:', error);
        res.status(500).json({
            success: false,
            errors: [{ code: "INTERNAL_ERROR", message: "Error al enviar email" }]
        });
    }
}




// =========================
// REGISTER
// =========================
export async function registerController(req, res) {
    const { name, email, password, role = "client" } = req.body;


    if (!name || !email || !password) {
        return res.status(400).json({ success: false, errors: [USER_ERRORS.EMAIL_PASSWORD_USERNAME_NEEDED] });
    }
    if (!allowedRoles.includes(role)) {
        return res.status(403).json({ success: false, errors: ["Invalid role."] });
    }

    try {
        const firebaseUser = await admin.auth().createUser({ email, password, displayName: name });
        await admin.auth().setCustomUserClaims(firebaseUser.uid, { role });

        await withdb(conn => q_addUser(conn, firebaseUser.uid, name, role, DISABLE_EMAIL_VERIFICATION));

        let userRecord = await withdb(conn => q_getUserByUid(conn, firebaseUser.uid));
        if (!userRecord) {
            const role = firebaseUser.customClaims?.role || "client";
            const name = firebaseUser.displayName || "Unknown";
            userRecord = { id: userRecord.id, uid: firebaseUser.uid, name, role };
        }

        await sendVerifycationCode(userRecord.id, firebaseUser.email);


        res.status(201).json({
            success: true,
            data: { id: userRecord.id, uid: firebaseUser.uid, email: firebaseUser.email, role },
            details: [SUCCESS_MESSAGES.USER_REGISTERED]
        });
    } catch (err) {
        let errorObj;
        switch (err.code) {
            case "auth/email-already-exists": errorObj = USER_ERRORS.EMAIL_ALREADY_USED; break;
            case "auth/email-already-in-use": errorObj = USER_ERRORS.EMAIL_ALREADY_USED; break;
            case "auth/invalid-email": errorObj = USER_ERRORS.INVALID_EMAIL; break;
            case "auth/weak-password": errorObj = USER_ERRORS.WEAK_PASSWORD; break;
            default: errorObj = ERROR_CODES.INTERNAL_ERROR; console.log(err); break
        }
        res.status(400).json({ success: false, errors: [errorObj] });
    }
}

// =========================
// LOGIN
// =========================
export async function loginController(req, res) {
    const { email, password } = req.body;

    console.log('[loginController] Request body:', {
        email,
        password: password ? '***' : undefined,
        hasEmail: !!email,
        hasPassword: !!password
    });

    if (!email || !password) {
        console.log('[loginController] Missing credentials');
        return res.status(400).json({
            success: false,
            errors: [USER_ERRORS.EMAIL_AND_PASSWORD_NEEDED]
        });
    }

    try {
        console.log('[loginController] Calling Firebase auth...');

        const response = await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${requiredEnv("FIREBASE_API_KEY")}`,
            { email, password, returnSecureToken: true }
        );

        console.log('[loginController] Firebase auth successful, uid:', response.data.localId);

        const { localId: uid, idToken } = response.data;

        const userRecord = await withdb(conn =>
            q_getUserByUid(conn, uid)
        );

        if (!userRecord) {
            console.log('[loginController] User not found in DB, uid:', uid, '— creating from Firebase record...');
            const firebaseUser = await admin.auth().getUser(uid);
            await withdb(conn => q_addUser(conn, 
                uid,
                firebaseUser.displayName || firebaseUser.email.split('@')[0],
                firebaseUser.email,
                ROLES.CLIENT,
                !DISABLE_EMAIL_VERIFICATION && firebaseUser.emailVerified,
            ));
            userRecord = await withdb(conn => q_getUserByUid(conn, uid));
            if (!userRecord) {
                console.log('[loginController] Failed to create user in DB, uid:', uid);
                return res.status(500).json({ success: false, errors: ['Error al crear el usuario en la base de datos'] });
            }
            console.log('[loginController] User created in DB:', { uid, email });
        }

        if (!DISABLE_EMAIL_VERIFICATION && !userRecord.email_verified) {
            console.log('[loginController] Email not verified:', email);
            await sendEmail(userRecord.id, email);

            return res.status(403).json({
                success: false,
                errors: [USER_ERRORS.EMAIL_NOT_VERIFIED],
                details: ["Te hemos enviado un correo de verificación"]
            });
        }

        const expiresIn = 60 * 60 * 24 * 5 * 1000;
        const sessionCookie = await admin.auth()
            .createSessionCookie(idToken, { expiresIn });

        res.cookie('session', sessionCookie, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: expiresIn
        });

        console.log('[loginController] Login successful:', { uid, email });

        res.status(200).json({
            success: true,
            data: {
                uid,
                email,
                name: userRecord.name,
                role: userRecord.role,
                id: userRecord.id
            },
            details: [SUCCESS_MESSAGES.USER_LOGGED_IN]
        });

    } catch (err) {
        console.error('[loginController] Error caught:', {
            message: err.message,
            firebaseError: err.response?.data,
            stack: err.stack
        });

        const firebaseCode = err.response?.data?.error?.message;
        console.log('[loginController] Firebase error code:', firebaseCode);

        let errorObj;
        switch (firebaseCode) {
            case "EMAIL_NOT_FOUND":
                errorObj = USER_ERRORS.USER_NOT_FOUND;
                break;
            case "INVALID_PASSWORD":
                errorObj = USER_ERRORS.INCORRECT_PASSWORD;
                break;
            case "USER_DISABLED":
                errorObj = USER_ERRORS.ACCOUNT_LOCKED;
                break;
            case "INVALID_LOGIN_CREDENTIALS":
                errorObj = USER_ERRORS.INVALID_CREDENTIALS || {
                    code: "INVALID_CREDENTIALS",
                    message: "Email o contraseña incorrectos"
                };
                break;
            default:
                errorObj = {
                    code: "INTERNAL_ERROR",
                    message: "Error interno del servidor",
                    details: firebaseCode || err.message
                };
                console.error('[loginController] Unhandled error code:', firebaseCode);
        }

        console.log('[loginController] Returning error:', errorObj);

        res.status(400).json({
            success: false,
            errors: [errorObj]
        });
    }
}

// =========================
// GOOGLE OAUTH
// =========================
export async function googleUrl(req, res) {
    const url = getAuthUrl();
    res.redirect(url);
}

export async function googleCallback(req, res) {
    const { code } = req.query;
    if (!code) return res.redirect(`${requiredEnv("FRONTEND_URL")}/login`);

    const oAuth2Client = newGoogleOauth2();

    try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);

        const oauth2 = google.oauth2({ auth: oAuth2Client, version: 'v2' });
        const { data } = await oauth2.userinfo.get();
        const { email, name } = data;

        // Revisar si el usuario existe en Firebase
        let firebaseUser;
        try {
            firebaseUser = await admin.auth().getUserByEmail(email);
        } catch {
            firebaseUser = await admin.auth().createUser({ email, displayName: name });
            await admin.auth().setCustomUserClaims(firebaseUser.uid, { role: 'client' });
        }

        // Revisar o crear en SQL
        const exists = await withdb(conn => q_userExists(conn, firebaseUser.uid));
        if (!exists) await withdb(conn => q_addUser(conn, firebaseUser.uid, name, 'client', DISABLE_EMAIL_VERIFICATION));

        const userRecord = await withdb(conn => q_getUserByUid(conn, firebaseUser.uid));
        const role = userRecord?.role || firebaseUser.customClaims?.role || "client";

        // Crear custom token y SESSION COOKIE
        const customToken = await admin.auth().createCustomToken(firebaseUser.uid, { role });
        const tokenRes = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${requiredEnv("FIREBASE_API_KEY")}`, {
            token: customToken,
            returnSecureToken: true
        });

        const sessionCookie = await admin.auth().createSessionCookie(tokenRes.data.idToken, { expiresIn: 60 * 60 * 24 * 5 * 1000 });

        res.cookie('session', sessionCookie, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 60 * 60 * 24 * 5 * 1000
        });

        res.redirect(`${requiredEnv("FRONTEND_URL")}/me`);
    } catch (err) {
        console.error(err);
        res.redirect(`${requiredEnv("FRONTEND_URL")}/login`);
    }
}


// =========================
// ME CONTROLLER
// =========================
export async function meController(req, res) {
    try {
        const sessionCookie = req.cookies.session;
        if (!sessionCookie) return res.status(401).json({ success: false, message: 'Not authenticated' });

        const decodedToken = await admin.auth().verifySessionCookie(sessionCookie, true);
        const uid = decodedToken.uid;

        const userRecord = await withdb(conn => q_getUserByUid(conn, uid));
        if (!userRecord) return res.status(404).json({ success: false, message: 'User not found' });

        res.json({ success: true, data: userRecord });
    } catch (err) {
        res.status(401).json({ success: false, message: 'Invalid session', error: err.message });
    }
}


// =========================
// LOGOUT
// =========================
export async function logoutController(req, res) {
    try {
        const sessionCookie = req.cookies.session;
        if (!sessionCookie) return res.status(401).json({ success: false, errors: ['Not authenticated'] });

        const decodedToken = await admin.auth().verifySessionCookie(sessionCookie, true);
        const uid = decodedToken.uid;

        await admin.auth().revokeRefreshTokens(uid);

        res.clearCookie('session', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        });

        res.status(200).json({ success: true, details: SUCCESS_MESSAGES.LOGOUT_SUCCESS });
    } catch (err) {
        res.status(500).json({ success: false, errors: [ERROR_CODES.INTERNAL_ERROR] });
    }
}

// =========================
// DELETE USER
// =========================
export async function deleteUserController(req, res) {
    const { uid } = req.params;
    if (!uid) return res.status(400).json({ success: false, errors: [USER_ERRORS.USER_NOT_FOUND] });

    try {
        const userRecord = await withdb(conn => q_getUserByUid(conn, uid));
        if (!userRecord) return res.status(404).json({ success: false, errors: [USER_ERRORS.USER_NOT_FOUND] });

        await admin.auth().deleteUser(uid);

        await withdb(conn => q_deleteUserByUid(conn, uid));

        res.status(200).json({ success: true, details: ['Deleted user.'] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, errors: [ERROR_CODES.INTERNAL_ERROR] });
    }
}

export async function registerAdmin(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, errors: [ERROR_CODES.BAD_REQUEST] });
    }

    try {
        // Crear usuario en Firebase
        const firebaseUser = await admin.auth().createUser({ email, password, displayName: name });
        await admin.auth().setCustomUserClaims(firebaseUser.uid, { role: "admin" });

        // Guardar en SQL solo datos extendidos
        await withdb(conn => q_addUser(conn, firebaseUser.uid, name, "admin", DISABLE_EMAIL_VERIFICATION));

        res.status(201).json({
            success: true,
            data: { uid: firebaseUser.uid, email: firebaseUser.email, role: "admin" },
            details: [SUCCESS_MESSAGES.USER_REGISTERED]
        });
    } catch (err) {
        let errorObj;
        switch (err.code) {
            case "auth/email-already-exists": errorObj = USER_ERRORS.EMAIL_ALREADY_USED; break;
            case "auth/invalid-password": errorObj = USER_ERRORS.WEAK_PASSWORD; break;
            default: errorObj = ERROR_CODES.INTERNAL_ERROR; break;
        }
        res.status(400).json({ success: false, errors: [errorObj] });
    }
}