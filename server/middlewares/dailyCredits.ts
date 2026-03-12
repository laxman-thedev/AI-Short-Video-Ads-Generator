/**
 * Daily Credit Management
 * 
 * Handles the logic for limiting and resetting user AI generation credits.
 * Ensures users have a capped amount of generations per day.
 * Synchronizes credit state with the database.
 */
import { prisma } from "../configs/prisma.js";

/**
 * The maximum number of credits a user can have per day.
 * Default is 20.
 */
export const DAILY_LIMIT = 20;

/**
 * Validates and resets user credits based on the current date.
 * 
 * Process:
 * 1. Fetch user data from database.
 * 2. Compare current date with the last credit reset timestamp.
 * 3. If it's a new day, reset dailyCredits to the limit and update lastCreditReset.
 * 4. Return the updated user or the current user state.
 * 
 * Credit logic:
 * - Credits are reset to 20 every 24 hours (calendar day).
 */
export const checkAndResetDailyCredits = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) return null;

    const now = new Date();
    const lastReset = new Date(user.lastCreditReset);

    // Check if the current time is on the same calendar day as the last reset
    const isSameDay =
        now.getFullYear() === lastReset.getFullYear() &&
        now.getMonth() === lastReset.getMonth() &&
        now.getDate() === lastReset.getDate();

    if (!isSameDay) {
        // Reset credits for the new day
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