import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class ProfileService {
    static async listProfiles(userId: string) {
        return prisma.profile.findMany({
            where: { userId },
            select: {
                id: true,
                name: true,
                updatedAt: true,
                isDemo: true,
                firstName: true,
                lastName: true,
                jobTitle: true,
            },
            orderBy: { updatedAt: 'desc' }
        });
    }

    static async getProfile(userId: string, profileId: string) {
        return prisma.profile.findFirst({
            where: { id: profileId, userId }
        });
    }

    static async createProfile(userId: string, data: any, name: string = 'My CV') {
        const profileData = JSON.stringify(data);
        return prisma.profile.create({
            data: {
                userId,
                name,
                data: profileData,
                firstName: data.personal?.firstName,
                lastName: data.personal?.lastName,
                jobTitle: data.personal?.title, // Map CV title to jobTitle
                summary: data.summary,
            }
        });
    }

    static async updateProfile(userId: string, profileId: string, data: any, name?: string) {
        const profileData = JSON.stringify(data);
        return prisma.profile.updateMany({
            where: { id: profileId, userId },
            data: {
                data: profileData,
                firstName: data.personal?.firstName,
                lastName: data.personal?.lastName,
                jobTitle: data.personal?.title,
                summary: data.summary,
                ...(name && { name }),
            }
        });
    }

    static async deleteProfile(userId: string, profileId: string) {
        return prisma.profile.deleteMany({
            where: { id: profileId, userId }
        });
    }
}
