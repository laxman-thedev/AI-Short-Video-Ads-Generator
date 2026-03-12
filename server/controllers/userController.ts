/**
 * User Controller
 * 
 * Handles user-related data operations including:
 * - Fetching user credit balance
 * - Retrieving user generation projects
 * - Managing project visibility (public/private)
 * 
 * Interacts with the Prisma database to manage user and project state.
 */
import { Request, Response } from "express"
import * as Sentry from "@sentry/node"
import { prisma } from "../configs/prisma.js";

/**
 * Retrieve the current credit balance for the authenticated user.
 * 
 * Request flow:
 * 1. Extract userId from session.
 * 2. Query database for user profile.
 * 3. Return user's available credits.
 */
export const getUserCredits = async (req: Request, res: Response) => {
    try {
        const { userId } = req.auth();
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        let user = await prisma.user.findUnique({
            where: { id: userId }
        });

        res.json({ credits: user?.credits });

    } catch (error: any) {
        Sentry.captureException(error);
        res.status(500).json({ message: error.code || error.message });
    }
}

/**
 * Fetch all AI generation projects created by the authenticated user.
 * Returns projects sorted by creation date (descending).
 */
export const getAllProjects = async (req: Request, res: Response) => {
    try {
        const { userId } = req.auth();
        const projects = await prisma.project.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        })

        res.json({ projects })
    } catch (error: any) {
        Sentry.captureException(error);
        res.status(500).json({ message: error.code || error.message })
    }
}

/**
 * Retrieve details of a specific project by its ID.
 * Ensures the project belongs to the requesting user.
 */
export const getProjectById = async (req: Request, res: Response) => {
    try {
        const { userId } = req.auth();
        const projectId = req.params.projectId as string;

        const project = await prisma.project.findUnique({
            where: {
                id: projectId,
                userId
            }
        });

        if (!project) {
            return res.status(404).json({ message: 'project not found' });
        }

        res.json({ project });
    } catch (error: any) {
        Sentry.captureException(error);
        res.status(500).json({ message: error.code || error.message });
    }
};

/**
 * Toggle the public visibility status of a project.
 * 
 * Constraints:
 * - Project must belong to the user.
 * - Project must have at least a generated image or video to be published.
 */
export const toggleProjectPublic = async (req: Request, res: Response) => {
    try {
        const { userId } = req.auth();
        const projectId = req.params.projectId as string;

        const project = await prisma.project.findUnique({
            where: { id: projectId, userId }
        })

        if (!project) { return res.status(404).json({ message: 'project not found' }) }
        if (!project?.generatedImage && !project?.generatedVideo) {
            return res.status(404).json({ message: "image or video not generated" })
        }

        await prisma.project.update({
            where: { id: projectId },
            data: { isPublished: !project.isPublished }
        })
        res.json({ isPublished: !project.isPublished })

    } catch (error: any) {
        Sentry.captureException(error);
        res.status(500).json({ message: error.code || error.message })
    }
}