import { ArrowRightIcon, PlayIcon, ZapIcon, CheckIcon } from "lucide-react";
import { PrimaryButton, GhostButton } from "./Buttons";
import { motion } from "framer-motion";

/**
 * Hero Component
 *
 * Landing section introducing UGC Flow.
 * Shows value proposition, social proof, CTA buttons,
 * and preview of generated AI advertisement content.
 */

export default function Hero() {

    const trustedUserImages = [
        "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=50",
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop",
    ];

    const mainImageUrl =
        "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1600&auto=format&fit=crop";

    const galleryStripImages = [
        "https://images.unsplash.com/photo-1556740749-887f6717d7e4?q=80&w=100",
        "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=100",
        "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=100",
    ];

    const trustedLogosText = [
        "Adobe",
        "Figma",
        "Canva",
        "Shopify",
        "Webflow",
    ];

    return (
        <>
            <section id="home" className="relative z-10">
                <div className="max-w-6xl mx-auto px-4 min-h-screen pt-32 md:pt-26 flex items-center justify-center">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

                        {/* LEFT CONTENT */}
                        <div className="text-left">

                            {/* Social proof */}
                            <motion.div
                                className="inline-flex items-center gap-3 pl-3 pr-4 py-1.5 rounded-full bg-white/10 mb-6"
                                initial={{ y: 60, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                            >
                                <div className="flex -space-x-2">
                                    {trustedUserImages.map((src, i) => (
                                        <img
                                            key={i}
                                            src={src}
                                            alt={`Creator ${i + 1}`}
                                            className="size-6 rounded-full border border-black/50"
                                        />
                                    ))}
                                </div>

                                <span className="text-xs text-gray-200">
                                    Trusted by <b> creators & marketers</b>
                                </span>
                            </motion.div>

                            {/* Headline */}
                            <motion.h1
                                className="text-4xl md:text-5xl font-bold leading-tight mb-6 max-w-xl"
                                initial={{ y: 60, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                            >
                                Turn your product photos into
                                <br />

                                <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-300 to-indigo-500">
                                    viral UGC ads in seconds
                                </span>
                            </motion.h1>

                            {/* Description */}
                            <motion.p
                                className="text-gray-300 max-w-lg mb-8"
                                initial={{ y: 60, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                            >
                                Upload a product image and a model photo — our AI automatically
                                generates realistic UGC-style advertisements and short-form
                                videos optimized for Instagram Reels, TikTok, and social media
                                marketing.
                            </motion.p>

                            {/* CTA buttons */}
                            <motion.div
                                className="flex flex-col sm:flex-row items-center gap-4 mb-8"
                                initial={{ y: 60, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                            >
                                <a href="/" className="w-full sm:w-auto">
                                    <PrimaryButton className="py-3 px-7 w-full sm:w-auto">
                                        Generate your first ad
                                        <ArrowRightIcon className="size-4" />
                                    </PrimaryButton>
                                </a>

                                <GhostButton className="py-3 px-5">
                                    <PlayIcon className="size-4" />
                                    Watch demo
                                </GhostButton>
                            </motion.div>

                            {/* Feature highlights */}
                            <motion.div
                                className="flex sm:inline-flex overflow-hidden text-sm text-gray-200 bg-white/10 rounded"
                                initial={{ y: 60, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                            >
                                <div className="flex items-center gap-2 p-3 px-6 hover:bg-white/5">
                                    <ZapIcon className="size-4 text-sky-400" />
                                    <div>
                                        <div>Instant generation</div>
                                        <div className="text-xs text-gray-400">
                                            AI images & videos in seconds
                                        </div>
                                    </div>
                                </div>

                                <div className="hidden sm:block h-6 w-px bg-white/10" />

                                <div className="flex items-center gap-2 p-3 px-6 hover:bg-white/5">
                                    <CheckIcon className="size-4 text-green-400" />
                                    <div>
                                        <div>Commercial license</div>
                                        <div className="text-xs text-gray-400">
                                            Use ads anywhere
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* RIGHT SIDE PREVIEW */}
                        <motion.div
                            className="mx-auto w-full max-w-lg"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                        >

                            <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black/40">
                                <div className="relative aspect-video bg-gray-900">
                                    <img
                                        src={mainImageUrl}
                                        alt="AI generated advertisement preview"
                                        className="w-full h-full object-cover"
                                    />

                                    <div className="absolute left-4 top-4 px-3 py-1 rounded-full bg-black/30 text-xs">
                                        AI Generated Ad • 9:16
                                    </div>

                                    <div className="absolute right-4 bottom-4">
                                        <button className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-white/10 hover:bg-white/20">
                                            <PlayIcon className="size-4" />
                                            <span className="text-xs">Preview video</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* thumbnails */}
                            <div className="mt-4 flex gap-3 items-center">
                                {galleryStripImages.map((src, i) => (
                                    <div
                                        key={i}
                                        className="w-14 h-10 rounded-lg overflow-hidden border border-white/10"
                                    >
                                        <img
                                            src={src}
                                            alt="Generated ad preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}

                                <div className="text-sm text-gray-400 ml-2 flex items-center gap-2">
                                    <div className="relative flex h-3 w-3 items-center justify-center">
                                        <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
                                        <span className="relative inline-flex size-2 rounded-full bg-green-500" />
                                    </div>

                                    +20 generated ads
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* LOGO MARQUEE */}
            <section className="border-y border-white/10 bg-white/5">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="w-full overflow-hidden py-6">
                        <div className="flex gap-14 items-center justify-center animate-marquee whitespace-nowrap">
                            {trustedLogosText.concat(trustedLogosText).map((logo, i) => (
                                <span
                                    key={i}
                                    className="mx-6 text-sm md:text-base font-semibold text-gray-400"
                                >
                                    {logo}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}