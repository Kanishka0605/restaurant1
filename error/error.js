import e from "express";

class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

export const errorMiddleware = (err, req, res, next) => {
    // Normalize
    const statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    let errors = undefined;

    // If the message contains a JSON array (our validation details), parse it and attach as `errors`.
    try {
        const parsed = JSON.parse(message);
        if (Array.isArray(parsed)) {
            errors = parsed;
            // Keep a readable summary message as well
            message = parsed.map(p => p.message).join(' , ');
        }
    } catch (parseErr) {
        // not JSON — ignore
    }

    const payload = {
        success: false,
        message,
    };
    if (errors) payload.errors = errors;

    return res.status(statusCode).json(payload);
}
export default ErrorHandler;