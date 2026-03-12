/**
 * API Configuration
 * 
 * Creates and configures a global Axios instance for making API requests
 * to the backend server. The base URL is derived from environment variables
 * with a local fallback for development.
 */

import axios from 'axios'

const api = axios.create({
   // Base URL for all backend API calls
   baseURL: import.meta.env.VITE_BASEURL || 'http://localhost:5000'
})

export default api