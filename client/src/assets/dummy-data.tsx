import { UploadIcon, VideoIcon, ZapIcon } from 'lucide-react';

export const featuresData = [
    {
        icon: <UploadIcon className="w-6 h-6" />,
        title: 'smart Upload',
        desc: 'Drag & drop your assets. we auto-optimize formates and sizes .'
    },
    {
        icon: <ZapIcon className="w-6 h-6" />,
        title: 'Instant Generation',
        desc: 'Optimized models deliver output in seconds with great fidelity.'
    },
    {
        icon: <VideoIcon className="w-6 h-6" />,
        title: 'Video Synthesis',
        desc: 'Bring product shots to life with short-form, social-ready videos.'
    }
];

export const plansData = [
    {
        id: 'free',
        name: 'Free',
        price: '$0',
        desc: 'Always free plan to get started.',
        credits: 20,
        features: [
            '25 Free Credits',
            'Standard quality',
            'No watermark',
            'Slower generation speed',
            'Email support'
        ]
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '$9',
        desc: 'Best for creators and small teams.',
        credits: 80,
        features: [
            '80 Monthly Credits',
            'HD quality',
            'No watermark',
            'Video generation',
            'Priority support'
        ],
        popular: true
    },
    {
        id: 'premium',
        name: 'Premium',
        price: '$29',
        desc: 'For professionals and growing businesses.',
        credits: 240,
        features: [
            '240 Monthly Credits',
            'FHD quality',
            'No watermark',
            'Fast generation speed',
            'Chat + Email support'
        ]
    }
];

export const faqData = [
    {
        question: 'How does the AI generation work?',
        answer: 'We leverage state-of-the-art diffusion models trained on millions of product images to blend your product into realistic scenes while preserving details,lighting and reflections .'
    },
    {
        question: 'Do I own the generated images?',
        answer: 'Yes-you receive full commercial rights to any images and videos generated on the platfor. use them for ads,ecommerce,social media and more.'
    },
    {
        question: 'Can i cancel anytime?',
        answer: 'Yes-you can cancel from your dashboard. you will retain access through the end of your billing period .'
    },
    {
        question: 'What input formats do you support?',
        answer: 'We accept JPG,PNG and WEBP.Outputs are high-resolution PNGs and MP4s optimized for social platforms.'
    }
];

export const footerLinks = [
    {
        title: "Quick Links",
        links: [
            { name: "Home", url: "#" },
            { name: "Features", url: "#" },
            { name: "Pricing", url: "#" },
            { name: "FAQ", url: "#" }
        ]
    },
    {
        title: "Legal",
        links: [
            { name: "Privacy Policy", url: "#" },
            { name: "Terms of Service", url: "#" }
        ]
    },
    {
        title: "Connect",
        links: [
            { name: "Twitter", url: "#" },
            { name: "LinkedIn", url: "#" },
            { name: "GitHub", url: "#" }
        ]
    }
];