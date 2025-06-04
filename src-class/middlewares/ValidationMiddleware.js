import { validationResult } from 'express-validator';

export class ValidationMiddleware {
    static handleValidationErrors(req, res, next) {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        next();
    }
}
