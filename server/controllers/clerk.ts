
import { Request, Response } from "express";
import { verifyWebhook } from '@clerk/express/webhooks'
import { prisma } from "../configs/prisma.js";
import * as Sentry from "@sentry/node"

const clerkWebhooks = async (req: Request, res: Response) => {
  try {
    const evt = await verifyWebhook(req, {
      signingSecret: process.env.CLERK_WEBHOOK_SECRET,
    });
    //getting data from request
    const { data, type } = evt;

    console.log("Webhook received:", evt.type);

    //switch cases for different events

    switch (type) {
      case "user.created": {
        await prisma.user.create({
          data: {
            id: data.id,
            email: data?.email_addresses[0]?.email_address,
            name: data?.first_name + " " + data?.last_name,
            image: data?.image_url,
          }
        })
        break;
      }

      case "user.updated": {
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
        await prisma.user.delete({
          where: {
            id: data.id
          }
        })
        break;
      }

      case "paymentAttempt.updated": {
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



