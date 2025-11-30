
import prisma from '../prisma';

export class LetterService {
    static async listLetters(userId: string) {
        return prisma.letter.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' }
        });
    }

    static async getLetter(userId: string, letterId: string) {
        return prisma.letter.findFirst({
            where: { id: letterId, userId }
        });
    }

    static async createLetter(userId: string, data: any) {
        return prisma.letter.create({
            data: {
                userId,
                title: data.title,
                content: data.content,
                language: data.language || 'en',
                targetJob: data.targetJob,
                targetCompany: data.targetCompany,
            }
        });
    }

    static async updateLetter(userId: string, letterId: string, data: any) {
        return prisma.letter.updateMany({
            where: { id: letterId, userId },
            data: {
                title: data.title,
                content: data.content,
                language: data.language,
                targetJob: data.targetJob,
                targetCompany: data.targetCompany,
            }
        });
    }

    static async deleteLetter(userId: string, letterId: string) {
        return prisma.letter.deleteMany({
            where: { id: letterId, userId }
        });
    }
}
