import admin from "../configs/firebase_config.js";
/**
 * Middleware to authenticate the requester using their session token.
 * If valid, attaches the user object to `req.user`.
 */
export async function mw_session(req, res, next) {
    try {
        const token = req.cookies.session || req.headers["authorization"]?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ success: false, message: "Token expected" });
        }

        const claims = await admin.auth().verifyIdToken(token);
        req.user = {
            uid: claims.uid,
            email: claims.email,
            permissions: claims.permissions || []
        };
        next();
    } catch (err) {
        console.error("Auth middleware error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}


/**
 * Middleware to check if the authenticated user has the required permissions.
 * Returns 403 if the user lacks any of the specified permissions.
 */
export function mw_permissions(requiredPermissions = []) {
    return (req, res, next) => {
        const userPermissions = new Set(req.user?.permissions || []);

        const hasAllPermissions = requiredPermissions.every(p => userPermissions.has(p));

        if (!hasAllPermissions) {
            return res.status(403).json({
                success: false,
                message: "Forbidden",
                errors: ["You don't have the required permissions"],
            });
        }

        next();
    };
}

/**
 * Middleware to check if the authenticated user has the required roles.
 * Returns 403 if the user lacks any of the specified roles.
 */
export function mw_role(requiredRoles = []) {
    return (req, res, next) => {
        const userRole = req.user?.role;
        console.log("User role:", req.user);

        if (!requiredRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: insufficient role",
            });
        }

        next();
    };
}
