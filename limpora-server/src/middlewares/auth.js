import jwt from "jsonwebtoken";

/**
 * Middleware to authenticate the requester using their session token.
 * If valid, attaches the user object to `req.user`.
 */
export function middleware_authenticate_token(req, res, next) {
    const header = req.headers["authorization"];
    const token = header?.split(" ")[1];

    if (!token) {
        res.status(401).json({ success: false, message: "Without token" });
        return;
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            res.status(403).json({ success: false, message: "Invalid Token" });
            return;
        }

        req.user = user;
        next();
    });
}

/**
 * Middleware to check if the authenticated user has the required permissions.
 * Returns 403 if the user lacks any of the specified permissions.
 */
export function authorize_permissions(requiredPermissions) {
    return (req, res, next) => {
        const userPermissions = (req.user && req.user.permissions) || {};

        const hasPermission = requiredPermissions.every(
            p => userPermissions[p] === true
        );

        if (!hasPermission) {
            res.status(403).json({
                success: false,
                message: "Forbidden",
                errors: ["You don't have the required permissions"],
            });
            return;
        }

        next();
    };
}
