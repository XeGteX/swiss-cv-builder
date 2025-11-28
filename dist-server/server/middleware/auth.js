import jwt from 'jsonwebtoken';
import { env } from '../config/env';
export const authenticateToken = (req, res, next) => {
    const token = req.cookies.accessToken || req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const payload = jwt.verify(token, env.JWT_SECRET);
        req.user = payload;
        next();
    }
    catch (error) {
        return res.status(403).json({ error: 'Forbidden' });
    }
};
