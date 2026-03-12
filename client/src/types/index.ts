/**
 * Shared Type Definitions
 * 
 * Contains interfaces for component props and data models (User, Project)
 * used throughout the application to ensure type safety.
 */

import type React from "react";

/**
 * Props for the UploadZone component.
 */
export interface UploadZoneProps {
    label: string;       // Title for the upload area
    file: File | null;   // The selected file object
    onClear: () => void; // Function to reset the selection
    onChange: (e:React.ChangeEvent<HTMLInputElement>) => void; // Triggered on file selection
}

/**
 * Basic User profile information.
 */
export interface User{
    id?:string;
    name?:string;
    email?:string;
}

/**
 * Core Project data model representing an AI generation.
 */
export interface Project{
    id:string;
    name?:string;
    userId?:string;
    user?:User;
    productName:string;        // Name of the product to be advertised
    productDescription?:string; // Optional details for AI context
    userPrompt?:string;         // Specific instructions for image generation
    aspectRatio:string;         // Output dimension ratio (e.g., '9:16')
    targetLength?:number;
    generatedImage?:string;     // Cloudinary URL for the generated image
    generatedVideo?:string;     // Cloudinary URL for the generated video (if created)
    isGenerating:boolean;       // Indicates if an AI operation is in progress
    isPublished:boolean;        // Whether the project is visible in the community gallery
    error?:string;
    createdAt:Date|string;
    updatedAt?:Date| string;
    uploadedImages:string[];    // URLs of original model and product images
}


