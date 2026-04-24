const AppError = require('../utils/AppError');
const Logger = require('../utils/logger');

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
    if (err.code === 'P2002') {
        const fields = err.meta?.target ? err.meta.target.join(', ') : 'unknown field';
        const message = `Duplicate field value: ${fields}. Please use another value!`;
        return new AppError(message, 400);
    }
    return err;
};

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        // Programming or other unknown error: don't leak details
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!',
        });
    }
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log error for debugging (centralized logging)
    Logger.error('ERROR 💥:', err);

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else {
        // We want to preserve the original error object for the Prisma checks
        // because spread operation { ...err } strips the non-enumerable properties like .code
        let error = err;

        // Prisma specific error handling could be added here
        if (error.code === 'P2002') error = handleDuplicateFieldsDB(error);
        // Add more Prisma Error codes as needed

        sendErrorProd(error, res);
    }
};
