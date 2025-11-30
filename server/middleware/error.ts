
import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
    statusCode: number;
    code?: string;

    constructor(message: string, statusCode: number, code?: string) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
}

import { MonitorService } from '../services/monitor-service';

export const errorHandler = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Record error for monitoring
    MonitorService.recordError();

    console.error(`[Error] ${req.method} ${req.path}:`, err);

    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
