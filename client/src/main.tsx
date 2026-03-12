/**
 * Entry point for the UGC Flow frontend.
 * 
 * This file initializes the React application, sets up Clerk authentication,
 * configures the routing context, and renders the root component.
 */

import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';

// Clerk Publishable Key for authentication
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
    throw new Error('Add your Clerk Publishable Key to the .env file')
}

/**
 * Renders the application root.
 * Wraps the App with ClerkProvider for auth and BrowserRouter for navigation.
 */
createRoot(document.getElementById('root')! as HTMLElement).render(
    <ClerkProvider 
        publishableKey={PUBLISHABLE_KEY}
        appearance={{
            theme: dark,
            variables: {
                colorPrimary: '#4f39f6',
                colorTextOnPrimaryBackground: '#ffffff',
            }
        }}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </ClerkProvider>
)