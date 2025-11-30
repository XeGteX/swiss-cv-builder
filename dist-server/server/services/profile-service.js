
import prisma from '../prisma';
export class ProfileService {
    static async listProfiles(userId) {
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
    static async getProfile(userId, profileId) {
        return prisma.profile.findFirst({
            where: { id: profileId, userId }
        });
    }
    static async createProfile(userId, data, title = 'My CV') {
        const profileData = JSON.stringify(data);
        return prisma.profile.create({
            data: {
                userId,
                title, // Was name
                data: profileData,
            }
        });
    }
    static async updateProfile(userId, profileId, data, title) {
        const profileData = JSON.stringify(data);
        return prisma.profile.updateMany({
            where: { id: profileId, userId },
            data: {
                data: profileData,
                ...(title && { title }),
            }
        });
    }
    static async deleteProfile(userId, profileId) {
        return prisma.profile.deleteMany({
            where: { id: profileId, userId }
        });
    }
}
