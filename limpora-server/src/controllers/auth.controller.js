import admin from '../configs/firebase_config.js';
import axios from 'axios';
import { requiredEnv, newGoogleOauth2, getAuthUrl } from '../utils/utils.js';
import { ERROR_CODES, SUCCESS_MESSAGES, USER_ERRORS } from '../constants.js';
import { withdb } from '../databases/mysql.js';
import { q_addEmailVerificationCode, q_addUser, q_deleteUserByUid, q_getUserByUid, q_isEmailVerified, q_userExists, q_verifyEmailCode } from '../databases/queries.js';
import { google } from 'googleapis';
import sendVerificationEmail, { generateVerificationCode } from "../helpers/email_verification.js";

const allowedRoles = ["client", "provider", "admin"];


export async function emailVerificationController(req, res) {
    const { code } = req.body;

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


export async function sendVerificationEmailController(req, res) {
    const { id, email } = req.body;

    try {
        const { code, hashedCode } = await generateVerificationCode();

        const result = await withdb(conn =>
            q_addEmailVerificationCode(conn, id, hashedCode)
        );

        const emailData = await sendVerificationEmail(email, code);

        res.status(201).json({
            success: true,
            data: { emailId: emailData },
            details: ["Email enviado con éxito"]
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, errors: [err.message] });
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

        await withdb(conn => q_addUser(conn, firebaseUser.uid, name, role));

        let userRecord = await withdb(conn => q_getUserByUid(conn, firebaseUser.uid));
        if (!userRecord) {
            const role = firebaseUser.customClaims?.role || "client";
            const name = firebaseUser.displayName || "Unknown";
            userRecord = { id: userRecord.id, uid: firebaseUser.uid, name, role };
        }

        res.status(201).json({
            success: true,
            data: { id: userRecord.id, uid: firebaseUser.uid, email: firebaseUser.email, role },
            details: [SUCCESS_MESSAGES.USER_REGISTERED]
        });
    } catch (err) {
        let errorObj;
        switch (err.code) {
            case "auth/email-already-in-use": errorObj = USER_ERRORS.EMAIL_ALREADY_USED; break;
            case "auth/invalid-email": errorObj = USER_ERRORS.INVALID_EMAIL; break;
            case "auth/weak-password": errorObj = USER_ERRORS.WEAK_PASSWORD; break;
            default: errorObj = ERROR_CODES.INTERNAL_ERROR; break;
        }
        res.status(400).json({ success: false, errors: [errorObj] });
    }
}

// =========================
// LOGIN
// =========================
export async function loginController(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            errors: [USER_ERRORS.EMAIL_AND_PASSWORD_NEEDED]
        });
    }

    try {
        const response = await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${requiredEnv("FIREBASE_API_KEY")}`,
            { email, password, returnSecureToken: true }
        );

        const { localId: uid, idToken } = response.data;

        const userRecord = await withdb(conn =>
            q_getUserByUid(conn, uid)
        );

        if (!userRecord) {
            return res.status(403).json({
                success: false,
                errors: [USER_ERRORS.USER_NOT_REGISTERED]
            });
        }

        if (!userRecord.email_verified) {
            await sendVerificationEmailController(userRecord.id, email);

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
        const firebaseCode = err.response?.data?.error?.message;

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
            default:
                errorObj = USER_ERRORS.INTERNAL_ERROR;
        }

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
        if (!exists) await withdb(conn => q_addUser(conn, firebaseUser.uid, name, 'client'));

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
        await withdb(conn => q_addUser(conn, firebaseUser.uid, name, "admin"));

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