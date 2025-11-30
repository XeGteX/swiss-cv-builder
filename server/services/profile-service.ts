
import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class ProfileService {
    static async listProfiles(userId: string) {
        return prisma.profile.findMany({
            where: { userId },
            select: {
                id: true,
                title: true, // Was name
                updatedAt: true,
                isDemo: true,
                data: true, // Need data to get name/title if not in top level
            },
            orderBy: { updatedAt: 'desc' }
        });
    }

    static async getProfile(userId: string, profileId: string) {
        return prisma.profile.findFirst({
            where: { id: profileId, userId }
        });
    }

    static async createProfile(userId: string, data: any, title: string = 'My CV') {
        const profileData = JSON.stringify(data);
        return prisma.profile.create({
            data: {
                userId,
                title, // Was name
                data: profileData,
            }
        });
    }

    static async updateProfile(userId: string, profileId: string, data: any, title?: string) {
        const profileData = JSON.stringify(data);
        return prisma.profile.updateMany({
            where: { id: profileId, userId },
            data: {
                data: profileData,
                ...(title && { title }),
            }
        });
    }

    static async deleteProfile(userId: string, profileId: string) {
        return prisma.profile.deleteMany({
            where: { id: profileId, userId }
        });
    }
}
