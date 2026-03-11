/**
 * Multer Configuration
 * 
 * Configures file upload handling using Multer.
 * This setup uses disk storage for temporary file handling before:
 * - Processing images for AI input
 * - Uploading assets to Cloudinary
 * 
 * The storage is configured to use default temporary directories.
 */
import multer from 'multer'

const storage = multer.diskStorage({})

/**
 * Multer middleware instance for handling multipart/form-data uploads.
 */
const upload = multer({ storage })

export default upload;