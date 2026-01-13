import admin from '../configs/firebase_config.js';
import axios from 'axios';
import { getAuthUrl, newGoogleOauth2, requiredEnv } from '../utils/utils.js';
import { ERROR_CODES, SUCCESS_MESSAGES, USER_ERRORS } from '../constants.js';
import { withdb } from '../databases/mysql.js';
import { q_addUser, q_userExists } from '../databases/queries.js';

const allowedRoles = ["client", "provider"];

export async function registerController(req, res) {
    let createdUser = null;

    try {
        const { name, email, password, role = "client" } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                errors: [USER_ERRORS.EMAIL_PASSWORD_USERNAME_NEEDED]
            });
        }

        if (!allowedRoles.includes(role)) {
            return res.status(403).json({
                success: false,
                errors: ["Invalid role."]
            });
        }

        // FIREBASE
        const user = await admin.auth().createUser({
            email,
            password,
        });

        createdUser = user;

        await admin.auth().setCustomUserClaims(user.uid, { role });

        const _ = await withdb(conn =>
            q_addUser(conn, user.uid, name, role)
        );

        res.status(201).json({
            success: true,
            data: {
                uid: user.uid,
                email: user.email,
                role: role
            },
            details: [SUCCESS_MESSAGES.USER_REGISTERED]
        });

    } catch (error) {
        console.error('Error en registro:', error);

        if (createdUser?.uid) {
            try {
                await admin.auth().deleteUser(createdUser.uid);
                console.log('Usuario eliminado de Firebase tras error en DB');
            } catch (deleteError) {
                console.error('Error al eliminar usuario:', deleteError);
            }
        }

        let errorObj = "";
        switch (error.code) {
            case "auth/email-already-in-use":
                errorObj = USER_ERRORS.EMAIL_ALREADY_USED;
                break;
            case "auth/invalid-email":
                errorObj = USER_ERRORS.INVALID_EMAIL;
                break;
            case "auth/weak-password":
                errorObj = USER_ERRORS.WEAK_PASSWORD;
                break;
            default:
                errorObj = error.message;
        }

        res.status(400).json({
            success: false,
            errors: [errorObj]
        });
    }
}

export async function loginController(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                errors: [
                    USER_ERRORS.EMAIL_AND_PASSWORD_NEEDED
                ]
            });
        }

        const response = await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${requiredEnv("FIREBASE_API_KEY")}`,
            {
                email,
                password,
                returnSecureToken: true,
            }
        );

        const { localId: uid } = response.data;

        const sessionToken = await admin.auth().createCustomToken(uid);


        const tokenResponse = await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${requiredEnv("FIREBASE_API_KEY")}`,
            { token: sessionToken, returnSecureToken: true }
        );


        const idToken = tokenResponse.data.idToken;
        const refreshToken = tokenResponse.data.refreshToken;

        // TOOD: HTTPS Secure cookie
        res.cookie('session', idToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 60 * 60 * 1000,
        });

        req.user = { uid, email };

        res.status(200).json({
            success: true,
            data: {
                uid,
                email,
            },
            details: [SUCCESS_MESSAGES.USER_LOGGED_IN]
        });

    } catch (err) {
        let errorObj;

        const firebaseCode = err.response?.data?.error?.message;

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
                break;
        }

        res.status(400).json({
            success: false,
            errors: [errorObj]
        });
    }
}

// Todo: Check logic
export async function logoutController(req, res) {
    const uid = req.user.uid;
    try {
        await admin.auth().revokeRefreshTokens(uid);
        res.status(200).json({
            success: true,
            details: SUCCESS_MESSAGES.LOGOUT_SUCCESS
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            errors: [ERROR_CODES.INTERNAL_ERROR]
        });
    }
}


export async function registerAdmin(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            errors: [
                ERROR_CODES.BAD_REQUEST
            ]
        });
    }

    try {
        const user = await admin.auth().createUser({ email, password });
        await admin.auth().setCustomUserClaims(user.uid, { role: "admin" });

        res.status(201).json({
            success: true,
            data: {
                uid: user.uid,
                email: user.email,
                role: "admin",
            },
            details: [SUCCESS_MESSAGES.USER_REGISTERED]
        });
    } catch (error) {
        let errorObj;

        if (error.code === "auth/email-already-exists") {
            errorObj = USER_ERRORS.EMAIL_ALREADY_USED;
        } else if (error.code === "auth/invalid-password") {
            errorObj = USER_ERRORS.WEAK_PASSWORD;
        } else {
            errorObj = ERROR_CODES.INTERNAL_ERROR;
        }

        res.status(400).json({ success: false, errors: [errorObj] });
    }
}

// https://console.cloud.google.com/auth/clients/create?previousPage=%2Fapis%2Fcredentials%3Freferrer%3Dsearch%26hl%3Des%26project%3Dlimpora-484214&hl=es&project=limpora-484214
export async function googleUrl(req, res) {
    const url = getAuthUrl();
    res.redirect(url);
}

export async function googleCallback(req, res) {
    let createdUser = null;
    let isNewUser = false;

    const { code } = req.query;

    if (!code) {
        return res.redirect(`${requiredEnv("FRONTEND_URL")}/login`);
    }

    const oAuth2Client = newGoogleOauth2();

    try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);

        const oauth2 = google.oauth2({
            auth: oAuth2Client,
            version: 'v2'
        });

        const { data } = await oauth2.userinfo.get();
        const { email, name, id: googleId } = data;

        let user;
        try {
            user = await admin.auth().getUserByEmail(email);
        } catch {
            user = await admin.auth().createUser({
                email,
                displayName: name,
            });
            let isNewUser = true;

        }
        createdUser = user;

        await admin.auth().setCustomUserClaims(user.uid, { role: 'client' });

        const customToken = await admin.auth().createCustomToken(user.uid);

        const tokenRes = await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.FIREBASE_API_KEY}`,
            {
                token: customToken,
                returnSecureToken: true,
            }
        );

        const result = await withdb(conn =>
            q_userExists(conn, user.uid, name, "client")
        );
        if (!result) {
            const _ = await withdb(conn =>
                q_addUser(conn, user.uid, name, "client")
            );
        }

        const idToken = tokenRes.data.idToken;

        res.cookie('session', idToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 60 * 60 * 1000,
        });

        res.redirect(`${requiredEnv("FRONTEND_URL")}/me`);

    } catch (err) {
        if (isNewUser && createdUser?.uid) {
            try {
                await admin.auth().deleteUser(createdUser.uid);
                console.log('Usuario eliminado de Firebase tras error en DB');
            } catch (deleteError) {
                console.error('Error al eliminar usuario:', deleteError);
            }
        }
        console.error(err);
        res.redirect(`${requiredEnv("FRONTEND_URL")}/login`);
    }
}