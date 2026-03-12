/**
 * User Routes
 * 
 * Defines endpoints for user profile and personal project management.
 * Most routes in this file are protected and require a valid Clerk session.
 * 
 * Endpoints:
 * - GET /credits: Fetch user's remaining AI credits.
 * - GET /projects: List all projects owned by the user.
 * - GET /projects/:projectId: Retrieve details for a specific user project.
 * - GET /publish/:projectId: Toggle the visibility of a user project.
 */
import express from 'express'
import { getAllProjects, getProjectById, getUserCredits, toggleProjectPublic } from "../controllers/userController.js";
import { protect } from '../middlewares/auth.js';

const userRouter = express.Router();

/**
 * @route   GET /api/user/credits
 * @desc    Get current user's credit balance
 * @access  Private
 */
userRouter.get('/credits', protect, getUserCredits)

/**
 * @route   GET /api/user/projects
 * @desc    Get all projects for the authenticated user
 * @access  Private
 */
userRouter.get('/projects', protect, getAllProjects)

/**
 * @route   GET /api/user/projects/:projectId
 * @desc    Get a single project by ID
 * @access  Private
 */
userRouter.get('/projects/:projectId', protect, getProjectById)

/**
 * @route   GET /api/user/publish/:projectId
 * @desc    Toggle project public visibility
 * @access  Private
 */
userRouter.get('/publish/:projectId', protect, toggleProjectPublic)

export default userRouter;
