import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { env } from '../config/env';
import { AppError } from '../middleware/error';
export class AuthService {
    static async register(email, password) {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new AppError('User already exists', 400);
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                role: 'USER',
                subscriptionStatus: 'FREE',
            },
        });
        return user;
    }
    static async login(email, password) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new AppError('Invalid credentials', 401);
        }
        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            throw new AppError('Invalid credentials', 401);
        }
        return user;
    }
    static generateTokens(user) {
        const accessToken = jwt.sign({ id: user.id, role: user.role, email: user.email }, env.JWT_SECRET, {
            expiresIn: '15m',
        });
        const refreshToken = jwt.sign({ id: user.id, role: user.role, email: user.email }, env.REFRESH_TOKEN_SECRET, {
            expiresIn: '7d',
        });
        return { accessToken, refreshToken };
    }
    static verifyRefreshToken(token) {
        return jwt.verify(token, env.REFRESH_TOKEN_SECRET);
    }
    static async getUserById(id) {
        return prisma.user.findUnique({
            where: { id },
            select: { id: true, email: true, role: true, subscriptionStatus: true },
        });
    }
}
