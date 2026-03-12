/**
 * UGC Flow Backend Server
 * 
 * Entry point for the AI Short Video Ads Generator backend.
 * Responsible for:
 * - Bootstrapping the Express application.
 * - Configuring global middlewares (CORS, JSON parsing).
 * - Integrating Clerk for authentication.
 * - Registering API routes for users and generation projects.
 * - Initializing Sentry for error tracking and performance monitoring.
 * 
 * Port: Defaults to 5000 or process.env.PORT.
 */
import "./configs/instrument.mjs";

import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";

import { clerkMiddleware } from "@clerk/express";
import clerkWebhooks from "./controllers/clerk.js";
import * as Sentry from "@sentry/node";

import userRouter from "./routes/userRoutes.js";
import projectRouter from "./routes/projectRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

/* -------------------- Core Middlewares -------------------- */

// Enable Cross-Origin Resource Sharing for frontend communication
app.use(cors());

/**
 * Clerk Webhook Endpoint
 * 
 * Note: Must be registered BEFORE express.json() because it requires 
 * raw request bodies for signature verification.
 */
app.post(
    "/api/clerk",
    express.raw({ type: "application/json" }),
    clerkWebhooks
);

// Standard JSON body parsing for all other routes
app.use(express.json());

// Initialize Clerk middleware for extracting auth state from requests
app.use(clerkMiddleware());


/* -------------------- Routes -------------------- */

// Health check endpoint
app.get("/", (req: Request, res: Response) => {
    res.send("Server is Live!");
});

// Domain-specific route registration
app.use("/api/user", userRouter);
app.use("/api/project", projectRouter);

/* -------------------- Debug -------------------- */

// Endpoint to verify Sentry integration
app.get("/debug-sentry", function mainHandler(req, res) {
    throw new Error("My first Sentry error!");
});

/* -------------------- Error Handler -------------------- */

/**
 * Sentry Error Handler
 * 
 * Automatically captures and logs unhandled exceptions to the Sentry dashboard.
 * Should be registered after all other routes.
 */
Sentry.setupExpressErrorHandler(app);

/* -------------------- Server -------------------- */

// Start the HTTP server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});