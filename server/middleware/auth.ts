
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface UserPayload {
    id: string;
    role: string;
    email: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: UserPayload;
        }
    }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken || req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const payload = jwt.verify(token, env.JWT_SECRET) as UserPayload;
        req.user = payload;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Forbidden' });
    }
};
