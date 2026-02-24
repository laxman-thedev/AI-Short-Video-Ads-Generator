import { prisma } from "../configs/prisma.js";

export const DAILY_LIMIT = 20;

export const checkAndResetDailyCredits = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) return null;

    const now = new Date();
    const lastReset = new Date(user.lastCreditReset);

    const isSameDay =
        now.getFullYear() === lastReset.getFullYear() &&
        now.getMonth() === lastReset.getMonth() &&
        now.getDate() === lastReset.getDate();

    if (!isSameDay) {
        const updated = await prisma.user.update({
            where: { id: userId },
            data: {
                dailyCredits: DAILY_LIMIT,
                lastCreditReset: now
            }
        });
        return updated;
    }

    return user;
};