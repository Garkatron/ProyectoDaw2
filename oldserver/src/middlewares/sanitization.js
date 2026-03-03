import { validationResult } from 'express-validator';


/**
 * Middleware that handles request validation errors using express-validator.
 *
 * - Collects validation results from the request.
 * - If validation errors exist, responds with HTTP 400 (Bad Request).
 * - Returns a standardized error response including:
 *   - success flag
 *   - general message
 *   - list of validation errors (field, message, and rejected value when applicable)
 * - If no validation errors are found, passes control to the next middleware.
 *
 * @param {Object} req - Express request object containing validation results.
 * @param {Object} res - Express response object used to send the error response.
 * @param {Function} next - Express next middleware function.
 */
export const handle_validation_errors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            message: 'Validation errors',
            errors: errors.array().map(err => ({
                field: err.type === 'field' ? err.path : undefined,
                message: err.msg,
                value: err.type === 'field' ? err.value : undefined
            }))
        });
        return;
    }

    next();
};
