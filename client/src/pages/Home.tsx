import Hero from "../components/Hero";
import Features from "../components/Features";
import Pricing from "../components/Pricing";
import Faq from "../components/Faq";
import CTA from "../components/CTA";

/**
 * Landing Page (Home)
 * 
 * The main entry point for unauthenticated users.
 * Composes the landing page from multiple sections: Hero, Features, Pricing, Faq, and CTA.
 */
export default function Home() {

    return (
        <>
            <Hero />
            <Features />
            <Pricing />
            <Faq />
            <CTA />
        </>
    )
}