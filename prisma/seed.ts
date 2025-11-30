
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seeding...');

    // 1. Create Admin User
    const adminEmail = 'admin@swisscv.ch';
    const adminPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            passwordHash: adminPassword,
            role: 'ADMIN',
            subscriptionStatus: 'PRO',
            subscription: {
                create: {
                    plan: 'PRO',
                    status: 'active',
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
                },
            },
        },
    });

    console.log(`✅ Admin user created: ${admin.email}`);

    // 2. Create Test User (Free)
    const testEmail = 'user@test.com';
    const testPassword = await bcrypt.hash('user123', 10);

    const user = await prisma.user.upsert({
        where: { email: testEmail },
        update: {},
        create: {
            email: testEmail,
            passwordHash: testPassword,
            role: 'USER',
            subscriptionStatus: 'FREE',
        },
    });

    console.log(`✅ Test user created: ${user.email}`);

    console.log('🌱 Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
