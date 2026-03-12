/**
 * Clerk Webhook Controller
 * 
 * Handles incoming webhooks from Clerk authentication service.
 * Responsibilities:
 * - Syncing user profiles (create, update, delete) with the application database.
 * - Handling payment success events to credit user accounts.
 * - Verifying webhook signatures for security.
 */
import { Request, Response } from "express";
import { verifyWebhook } from '@clerk/express/webhooks'
import { prisma } from "../configs/prisma.js";
import * as Sentry from "@sentry/node"

/**
 * Main Clerk webhook handler.
 * Verifies authenticity and routes events to the appropriate synchronization logic.
 * 
 * Event Flow:
 * 1. verifyWebhook: Check signature using CLERK_WEBHOOK_SECRET.
 * 2. user.created: Upsert new user into DB with 20 base credits.
 * 3. user.updated: Update user details (name, email, image).
 * 4. user.deleted: Remove user from local database.
 * 5. paymentAttempt.updated: Increment user credits upon successful status.
 */
const clerkWebhooks = async (req: Request, res: Response) => {
  try {
    const evt = await verifyWebhook(req, {
      signingSecret: process.env.CLERK_WEBHOOK_SECRET,
    });
    // Extract event data and type
    const { data, type } = evt;

    console.log("Webhook received:", evt.type);

    switch (type) {
      case "user.created": {
        console.log("User created event received:", data.id);

        const email =
          data.email_addresses?.[0]?.email_address ||
          data.external_accounts?.[0]?.email_address ||
          "";

        try {
          // Store user in database when they sign up
          await prisma.user.upsert({
            where: { id: data.id },
            update: {},
            create: {
              id: data.id,
              email,
              name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
              image: data.image_url || null,
              credits: 20, // Initial free credits
              dailyCredits: 20,
              lastCreditReset: new Date(),
            },
          });

          console.log("User saved to DB:", data.id);
        } catch (err) {
          console.error("DB save failed:", err);
        }

        break;
      }

      case "user.updated": {
        // Update local user profile when changed in Clerk
        await prisma.user.update({
          where: {
            id: data.id
          },

          data: {
            email: data?.email_addresses[0]?.email_address,
            name: data?.first_name + " " + data?.last_name,
            image: data?.image_url,
          }
        })
        break;
      }

      case "user.deleted": {
        // Cleanup local user data
        await prisma.user.delete({
          where: {
            id: data.id
          }
        })
        break;
      }

      case "paymentAttempt.updated": {
        // Handle credit purchases
        if (
          (data.charge_type === "recurring" ||
            data.charge_type === "checkout") &&
          data.status === "paid"
        ) {
          const credits = {
            pro: 80,
            premium: 240,
          };

          const clerkUserId = data?.payer?.user_id;
          const planSlug = data?.subscription_items?.[0]?.plan?.slug;

          if (!planSlug || !(planSlug in credits)) {
            return res.status(400).json({ message: "Invalid plan" });
          }

          const planId = planSlug as keyof typeof credits;

          console.log("Plan Selected:", planId);

          // Top up user credits upon successful payment
          await prisma.user.update({
            where: {
              id: clerkUserId,
            },
            data: {
              credits: {
                increment: credits[planId],
              },
            },
          });

          console.log("Credits Updated Successfully!");
        }

        break;
      }

      default:
        break;
    }
    res.json({ message: "Webhook Received : " + type })

  } catch (error: any) {
    Sentry.captureException(error)
    res.status(500).json({ message: error.message });
  }
}

export default clerkWebhooks



