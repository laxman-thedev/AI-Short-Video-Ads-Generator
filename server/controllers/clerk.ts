
import { Request, Response } from "express";
import { verifyWebhook } from '@clerk/express/webhooks'
import { prisma } from "../configs/prisma.js";
import * as Sentry from "@sentry/node"

const clerkWebhooks = async (req: Request, res: Response) => {
  try {
    const evt: any = await verifyWebhook(req)
    //getting data from request
    const { data, type } = evt;

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

          const clerkUserId = data?.payer?.userId;

          const planId: keyof typeof credits =
            data?.subscription_items?.[0]?.plan?.slug;

          if (planId !== "pro" && planId !== "premium") {
            return res.status(400).json({ message: "Invalid plan" });
          }

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
      // case "paymentAttempt.updated": {
      //   if (
      //     (data.charge_type === "recurring" ||
      //       data.charge_type === "checkout") &&
      //     data.status === "paid"
      //   ) {
      //     const credits = {
      //       free_user: 20,
      //       pro: 80,
      //       premium: 240,
      //     };


      //     const clerkUserId = data?.payer?.userId;
      //     const planSlug = data?.subscription_items?.[0]?.plan?.slug;
      //     // ...

      //     if (!planSlug || !(planSlug in credits)) {
      //       return res.status(400).json({
      //         message: "Invalid plan",
      //         received: planSlug,
      //       });
      //     }

      //     await prisma.user.update({
      //       where: { id: clerkUserId },
      //       data: {
      //         credits: credits[planSlug as "free_user" | "pro" | "premium"],
      //       },
      //     });

      //     console.log("Credits Updated Successfully!");
      //   }

      //   break;
      // }

      // case "subscription.updated": {
      //   const credits = { free_user: 20, pro: 80, premium: 240 };

      //   // Log the full webhook data to understand structure
      //   console.log("[subscription.updated] ========== WEBHOOK DATA ==========");
      //   console.log("[subscription.updated] Full data:", JSON.stringify(data, null, 2));

      //   // Try multiple possible paths for user ID
      //   const clerkUserId = data?.payer?.user_id || data?.subscriber?.user_id || data?.user_id || data?.payer?.userId;
      //   console.log("[subscription.updated] User ID extracted:", clerkUserId);

      //   if (!clerkUserId) {
      //     console.log("[subscription.updated] ERROR: No user ID found in webhook data");
      //     console.log("[subscription.updated] Available keys:", Object.keys(data || {}));
      //     return res.status(400).json({ message: "No user ID in subscription data" });
      //   }

      //   // Try multiple paths for subscription items
      //   const items = data?.subscription_items || data?.items || data?.plan_items || [];
      //   console.log("[subscription.updated] Items found:", items.length);
      //   console.log("[subscription.updated] Items:", JSON.stringify(items, null, 2));

      //   let validItem = null;
      //   if (items.length > 0) {
      //     // First, try to find an ACTIVE item with a valid plan slug
      //     validItem = items.find((item: any) =>
      //       item.status === "active" &&
      //       item.plan?.slug &&
      //       ["pro", "premium", "premeium", "free_user", "free"].includes(item.plan.slug.toLowerCase())
      //     );

      //     // If no active item found, try any active item
      //     if (!validItem) {
      //       validItem = items.find((item: any) => item.status === "active");
      //     }

      //     // If still no active item, sort by updated_at (most recent first) and find non-abandoned/ended
      //     if (!validItem) {
      //       const sorted = [...items].sort((a: any, b: any) => (b.updated_at || 0) - (a.updated_at || 0));
      //       validItem = sorted.find((item: any) =>
      //         item.status !== "abandoned" &&
      //         item.status !== "ended" &&
      //         item.plan?.slug
      //       );
      //       // Last resort: most recently updated item
      //       if (!validItem) {
      //         validItem = sorted[0];
      //       }
      //     }
      //   }

      //   console.log("[subscription.updated] Valid item:", JSON.stringify(validItem, null, 2));
      //   console.log("[subscription.updated] Valid item status:", validItem?.status);

      //   // Try to get plan slug from multiple possible locations
      //   let planSlug = validItem?.plan?.slug?.toLowerCase()
      //     || data?.plan?.slug?.toLowerCase()
      //     || data?.current_plan?.slug?.toLowerCase();

      //   console.log("[subscription.updated] Initial plan slug:", planSlug);

      //   if (planSlug === "premeium") planSlug = "premium";
      //   if (planSlug === "free") planSlug = "free_user";

      //   // If planSlug is missing, try to use plan_id mapping
      //   const planId = validItem?.plan_id || validItem?.plan?.id || data?.plan?.id || data?.plan_id;
      //   console.log("[subscription.updated] Plan ID:", planId);

      //   if (!planSlug && planId) {
      //     const planIdMap: Record<string, string> = {
      //       "cplan_38qsGlMnS2YmUBcJu5vlCdAcoJf": "free_user",
      //       "cplan_38qyoXrvqKBeZlF50aXDLs2sNtO": "pro",
      //       "cplan_38qzPvaiUBFUdQZo902CDrd6HgQ": "premium",
      //     };
      //     planSlug = planIdMap[planId];
      //     console.log("[subscription.updated] Plan slug from ID map:", planSlug);
      //   }

      //   console.log("[subscription.updated] Final plan slug:", planSlug);

      //   if (!planSlug || !(planSlug in credits)) {
      //     console.log("[subscription.updated] WARNING: Invalid/unknown plan, defaulting to free_user");
      //     await prisma.user.update({
      //       where: { id: clerkUserId },
      //       data: { credits: credits["free_user"] },
      //     });
      //     break;
      //   }

      //   const newCredits = credits[planSlug as "free_user" | "pro" | "premium"];
      //   console.log("[subscription.updated] Updating user", clerkUserId, "to", newCredits, "credits");

      //   await prisma.user.update({
      //     where: { id: clerkUserId },
      //     data: { credits: newCredits },
      //   });
      //   console.log("[subscription.updated] SUCCESS: Credits set to", newCredits);
      //   break;
      // }

      // case "subscriptionItem.updated": {
      //   const credits = { free_user: 20, pro: 80, premium: 240 };
      //   // Try multiple possible paths for user ID
      //   const clerkUserId = data?.payer?.user_id || data?.subscriber?.user_id || data?.user_id;
      //   console.log("[subscriptionItem.updated] User ID:", clerkUserId);
      //   console.log("[subscriptionItem.updated] Plan data:", JSON.stringify(data?.plan, null, 2));

      //   if (!clerkUserId) {
      //     console.log("[subscriptionItem.updated] No user ID found in webhook data");
      //     return res.status(400).json({ message: "No user ID in subscription item data" });
      //   }

      //   let planSlug = data?.plan?.slug?.toLowerCase();
      //   if (planSlug === "premeium") planSlug = "premium";
      //   if (planSlug === "free") planSlug = "free_user";

      //   console.log("[subscriptionItem.updated] Plan slug:", planSlug);

      //   if (!planSlug || !(planSlug in credits)) {
      //     return res.status(400).json({ message: "Invalid plan", received: planSlug });
      //   }

      //   await prisma.user.update({
      //     where: { id: clerkUserId },
      //     data: { credits: credits[planSlug as "free_user" | "pro" | "premium"] },
      //   });
      //   console.log("[subscriptionItem.updated] Credits set to:", credits[planSlug as "free_user" | "pro" | "premium"]);
      // }

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



