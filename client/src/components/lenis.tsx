'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * LenisScroll Component
 * 
 * Initializes Lenis for smooth momentum scrolling across the application.
 * This is a 'headless' component that manages the scrolling lifecycle.
 */
export default function LenisScroll() {

    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            smoothWheel: true,
            anchors: {
                offset: -100,
            },
        });

        const raf = (time: number) => {
            lenis.raf(time);
            requestAnimationFrame(raf);
        };

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
        };
    }, []);

    return null;
}