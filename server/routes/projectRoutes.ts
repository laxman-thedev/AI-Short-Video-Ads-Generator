/**
 * Project Routes
 * 
 * Defines endpoints for AI generation workflows and community content.
 * Handles multipart file uploads for image generation.
 * 
 * Endpoints:
 * - POST /create: Trigger new project and image generation (Requires 2 images).
 * - POST /video: Trigger video generation for an existing project.
 * - GET /published: Fetch all public projects for the gallery.
 * - DELETE /:projectId: Delete a project.
 */
import express from 'express'
import { protect } from '../middlewares/auth.js'
import { createProject, createVideo, deleteProject, getAllPublishedProjects } from '../controllers/projectController.js'
import upload from '../configs/multer.js'

const projectRouter = express.Router()

/**
 * @route   POST /api/project/create
 * @desc    Create project and generate AI image from uploaded samples
 * @access  Private (Cost: 5 credits)
 */
projectRouter.post('/create', upload.array('images', 2), protect, createProject)

/**
 * @route   POST /api/project/video
 * @desc    Generate AI video from a projects generated image
 * @access  Private (Cost: 10 credits)
 */
projectRouter.post('/video', protect, createVideo)

/**
 * @route   GET /api/project/published
 * @desc    Get all projects marked as public for the community feed
 * @access  Public
 */
projectRouter.get('/published', getAllPublishedProjects)

/**
 * @route   DELETE /api/project/:projectId
 * @desc    Delete a project
 * @access  Private
 */
projectRouter.delete('/:projectId', protect, deleteProject)

export default projectRouter