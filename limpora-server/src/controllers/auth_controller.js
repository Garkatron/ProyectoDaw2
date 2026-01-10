import admin from '../configs/firebase_config.js';
import axios from 'axios';
import { requiredEnv } from '../utils/utils.js';
import { ERROR_CODES, SUCCESS_MESSAGES, USER_ERRORS } from '../constants.js';
import { withdb } from '../databases/mysql.js';
import { q_addUser } from '../databases/queries.js';

const allowedRoles = ["client", "provider"];


export async function registerController(req, res) {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                errors: [
                    USER_ERRORS.EMAIL_PASSWORD_USERNAME_NEEDED
                ]
            });
        }

        // FIREBASE
        const user = await admin.auth().createUser({
            email,
            password,
        });

        if (!allowedRoles.includes(role))
            return res.status(403).json({ message: "Invalid role." });


        await admin.auth().setCustomUserClaims(user.uid, { role });

        // DATABASE
        const _ = await withdb(conn =>
            q_addUser(conn, user.uid, name, user.role)
        );
        //

        res.status(201).json({
            success: true,
            data: {
                uid: user.uid,
                email: user.email,
            },
            details: [SUCCESS_MESSAGES.USER_REGISTERED]
        });
    } catch (error) {
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

        req.user = { uid, email };

        res.status(200).json({
            success: true,
            data: {
                uid,
                email,
                sessionToken,
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
    const { uid } = req.body;


    if (!uid) {
        return res.status(400).json({
            success: false,
            errors: [
                {
                    code: USER_ERRORS.BAD_REQUEST.code,
                    message: "User ID is required"
                }
            ]
        });
    }

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
