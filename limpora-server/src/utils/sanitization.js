import { validationResult } from 'express-validator'


export function handleValidationErrors (req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            message: 'Validation errors',
            errors: errors.array().map((err) => ({
                field: err.type === 'field' ? err.path : undefined,
                message: err.msg,
                value: err.type === 'field' ? err.value : undefined
            }))
        })
        return;
    }

    next()
}