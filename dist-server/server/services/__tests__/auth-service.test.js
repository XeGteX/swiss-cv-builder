
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../auth-service';
import prisma from '../../prisma';
import bcrypt from 'bcrypt';
// Mock Prisma and Bcrypt
vi.mock('../../prisma', () => ({
    default: {
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
        },
    },
}));
vi.mock('bcrypt', () => ({
    default: {
        hash: vi.fn().mockResolvedValue('hashed_password'),
        compare: vi.fn(),
    },
}));
describe('AuthService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it('should register a new user', async () => {
        // Setup mocks
        prisma.user.findUnique.mockResolvedValue(null);
        prisma.user.create.mockResolvedValue({
            id: '123',
            email: 'test@example.com',
            role: 'USER',
            subscriptionStatus: 'FREE',
        });
        const user = await AuthService.register('test@example.com', 'password123');
        expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
        expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
        expect(prisma.user.create).toHaveBeenCalled();
        expect(user.email).toBe('test@example.com');
    });
    it('should throw error if user already exists', async () => {
        prisma.user.findUnique.mockResolvedValue({ id: '123', email: 'test@example.com' });
        await expect(AuthService.register('test@example.com', 'password123'))
            .rejects
            .toThrow('User already exists');
    });
});
