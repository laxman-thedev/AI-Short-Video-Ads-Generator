/**
 * Authentication Middleware
 * 
 * Provides protection for private routes using Clerk authentication.
 * Verifies the presence of a valid session/userId in the request.
 * Integrates with Sentry for error tracking during the auth flow.
 */
import { Request, Response, NextFunction } from "express"
import * as Sentry from "@sentry/node"

/**
 * Protects routes by verifying the user's authentication status.
 * 
 * Request flow:
 * 1. Extract userId from the Clerk auth object.
 * 2. If no userId exists, return 401 Unauthorized.
 * 3. If authenticated, proceed to the next middleware or controller.
 * 4. Log any errors to Sentry.
 */
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.auth()
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }
    next()
  } catch (error: any) {
    Sentry.captureException(error)
    return res.status(401).json({ message: "error.code || error.message" })
  }
}