import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth-service';
import { env } from '../config/env';
import { LoggerService } from '../services/logger-service';
import { eventBus, EVENTS } from '../services/event-bus';

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export class AuthController {
    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = registerSchema.parse(req.body);
            const user = await AuthService.register(email, password);
            const { accessToken, refreshToken } = AuthService.generateTokens(user);

            AuthController.setCookies(res, accessToken, refreshToken);

            LoggerService.info('User registered', { userId: user.id, email: user.email });
            eventBus.emit(EVENTS.USER.REGISTERED, { userId: user.id, email: user.email, timestamp: new Date() });

            res.status(201).json({
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    subscriptionStatus: user.subscriptionStatus,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = loginSchema.parse(req.body);
            const user = await AuthService.login(email, password);
            const { accessToken, refreshToken } = AuthService.generateTokens(user);

            AuthController.setCookies(res, accessToken, refreshToken);

            res.json({
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    subscriptionStatus: user.subscriptionStatus,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    static async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({ error: 'Refresh token required' });
            }

            const payload = AuthService.verifyRefreshToken(refreshToken);
            const user = await AuthService.getUserById(payload.id);

            if (!user) {
                return res.status(401).json({ error: 'User not found' });
            }

            const tokens = AuthService.generateTokens(user as any);
            AuthController.setCookies(res, tokens.accessToken, tokens.refreshToken);

            res.json({ message: 'Token refreshed' });
        } catch (error) {
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            return res.status(401).json({ error: 'Invalid refresh token' });
        }
    }

    static logout(req: Request, res: Response) {
        LoggerService.info('User logged out');
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.json({ message: 'Logged out' });
    }

    static async me(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user?.id) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const user = await AuthService.getUserById(req.user.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json({ user });
        } catch (error) {
            next(error);
        }
    }

    private static setCookies(res: Response, accessToken: string, refreshToken: string) {
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
    }
}
