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
app.use(cors());

app.post(
    "/api/clerk",
    express.raw({ type: "application/json" }),
    clerkWebhooks
);

app.use(express.json());
app.use(clerkMiddleware());


/* -------------------- Routes -------------------- */

app.get("/", (req: Request, res: Response) => {
    res.send("Server is Live!");
});

app.use("/api/user", userRouter);
app.use("/api/project", projectRouter);

/* -------------------- Debug -------------------- */

app.get("/debug-sentry", function mainHandler(req, res) {
    throw new Error("My first Sentry error!");
});

/* -------------------- Error Handler -------------------- */

Sentry.setupExpressErrorHandler(app);

/* -------------------- Server -------------------- */

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});