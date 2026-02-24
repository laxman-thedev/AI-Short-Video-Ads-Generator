# UGC Flow – AI Short Video Ads Generator

## Description

UGC Flow is an AI-powered web application that helps brands and creators generate **User-Generated Content (UGC) style product advertisements** automatically.
Users can upload a **model image** and a **product image**, and the system generates:

* A realistic marketing image (AI composited)
* A short promotional video
* Social-media ready content (Reels / Shorts format)

The platform uses modern generative AI and a credit-based usage system to make high-quality ad creation accessible without professional shoots.

---

## Features

### AI Content Generation

* Image composition using **Google Gemini**
* Video generation using AI video models
* Supports vertical formats (9:16) for social media

### User System

* Authentication using **Clerk**
* Automatic user creation via webhook
* Secure API access

### Credit Management

* Default credits for new users
* Daily free credits (20/day)
* Total purchased credits support
* Credit deduction per generation:

  * Image: 5 credits
  * Video: 10 credits

### Project Management

* Create and manage multiple projects
* View generated results
* Delete projects
* Publish projects to community

### Community

* Public gallery of published AI ads

### Media Handling

* Image & video storage via **Cloudinary**
* Temporary file handling for video processing

### Monitoring & Reliability

* Error tracking with **Sentry**
* Credit refund on failure
* Generation status tracking

---

## Project Structure

```
UGC-Flow/
│
├── client/                 # React Frontend (Vite + Tailwind)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── assets/
│   │   ├── configs/
│   │   └── types/
│   ├── index.html
│   └── package.json
│
├── server/                 # Node.js Backend (Express)
│   ├── controllers/
│   ├── routes/
│   ├── middlewares/
│   ├── configs/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── types/
│   ├── server.ts
│   └── package.json
│
├── README.md
└── LICENSE.md
```

---

## Technologies Used

### Frontend

* React (Vite)
* TypeScript
* Tailwind CSS
* React Router
* Clerk React
* Axios
* Framer Motion

### Backend

* Node.js
* Express
* TypeScript
* Prisma ORM
* PostgreSQL

### AI & Services

* Google Gemini (Image generation)
* AI Video Generation (Veo / GenAI)
* Cloudinary (Media storage)
* Clerk (Authentication & Payments)
* Sentry (Error monitoring)

---

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/laxman-thedev/AI-Short-Video-Ads-Generator.git
cd AI-Short-Video-Ads-Generator
```

---

### 2. Setup Backend

```
cd server
npm install
```

Create `.env` based on `.env.example`:

```
DATABASE_URL=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
GOOGLE_CLOUD_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SENTRY_DSN=
```

Run migrations:

```
npx prisma migrate deploy
npm run server
```

---

### 3. Setup Frontend

```
cd client
npm install
```

Create `.env`:

```
VITE_BASEURL=http://localhost:5000
VITE_CLERK_PUBLISHABLE_KEY=
```

Run frontend:

```
npm run dev
```

---

## Demo

Live Application:
`https://flowugc.vercel.app`

Example Generated Content:

* AI Product Image
* AI UGC Video
* Community Gallery

---

## License

This project is licensed under the terms described in `LICENSE.md`.

---

## Contributing

Please read `CONTRIBUTING.md` for:

* Branch naming
* Pull request guidelines
* Code standards

---

## Credits System (Important)

| Action           | Cost           |
| ---------------- | -------------- |
| Image Generation | 5 credits      |
| Video Generation | 10 credits     |
| Daily Free Limit | 20 credits/day |

Daily credits reset automatically via middleware.

---
