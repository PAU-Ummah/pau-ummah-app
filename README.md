# Pan Atlantic University Mosque Platform

A modern Next.js application for the Pan Atlantic University Mosque featuring an enhanced homepage experience, an immersive short-form media feed, and Google Drive powered media management.

## Features

- **Next.js App Router** with TypeScript, Tailwind CSS, and shadcn/ui component primitives.
- **Hero-driven homepage** highlighting prayer times, programmes, events, and community calls to action with smooth animations and parallax effects.
- **Prayer timing experience** with a live countdown timer, visual progress, and highlighted current/next salah information.
- **Event discovery** including filterable upcoming events, animated past event galleries, and skeleton loaders for seamless transitions.
- **Vertical media feed** inspired by TikTok/Reels with auto-playing videos, swipe/pinch interactions, floating engagement controls, and a comments sidebar.
- **Google Drive integration** via API routes for fetching paginated media assets (service account credentials required).
- **Floating utilities** including WhatsApp contact shortcut, back-to-top button, and a global scroll progress indicator.

## Getting Started

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to explore the application.

## Environment Variables

Create a `.env.local` file and populate the following values:

```bash

# Application URL (REQUIRED - use your production domain)
NEXT_PUBLIC_API_URL=https://your-production-domain.com

# Google Service Account (for Drive integration)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=your_drive_folder_id_here

# Optional: Redis URL for caching
REDIS_URL=redis://localhost:6379

# Environment
NODE_ENV=production
```

The Google service account must have access to the Drive folder specified by `GOOGLE_DRIVE_FOLDER_ID`.

## Project Structure

```
app/
  page.tsx              # Homepage
  feed/page.tsx         # Media feed page
  api/media/            # Google Drive media API routes
components/
  mosque/               # Homepage sections and utilities
  feed/                 # Media feed components
  ui/                   # shadcn-style primitives
lib/
  hooks/                # Shared React hooks
  google-drive.ts       # Google Drive service wrapper
  constants.ts          # Static data for the UI
```

## Design System

- Brand colours: `#34495e`, `#58a44d`, `#001f3f`
- Font: Montserrat (loaded via `next/font`)
- Animation utilities and gradients defined in `app/globals.css`

## Deployment

The application is ready for deployment on [Vercel](https://vercel.com/). Ensure the environment variables above are configured in the hosting environment.
