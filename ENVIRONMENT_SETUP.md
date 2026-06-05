# Environment Setup Guide

This guide covers setting up **PrepForge AI** for local development and deploying to a production environment.

## 1. Local Development Setup

### Prerequisites
- Node.js 18+ (20+ recommended)
- PostgreSQL Database (local or cloud like Supabase/Neon)

### Installation
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd prepforge-ai
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment variables template:
   ```bash
   cp .env.example .env.local
   ```
4. Fill in the required variables in `.env.local` (see sections below).

## 2. Database Setup

We use **Prisma ORM** with **PostgreSQL**.

1. Create a PostgreSQL database (e.g. using Docker locally or Neon/Supabase in the cloud).
2. Set the `DATABASE_URL` in `.env.local`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/prepforge"
   ```
3. Push the Prisma schema to the database:
   ```bash
   npx prisma db push
   ```
4. Generate the Prisma Client:
   ```bash
   npx prisma generate
   ```

## 3. Authentication (Google OAuth)

We use **NextAuth.js v5** (Auth.js) for authentication.

1. Generate a secure `AUTH_SECRET`:
   ```bash
   npx auth secret
   ```
   Paste the output into `AUTH_SECRET` in `.env.local`.
2. Go to the [Google Cloud Console](https://console.cloud.google.com/).
3. Create a new project or select an existing one.
4. Navigate to **APIs & Services** > **Credentials**.
5. Click **Create Credentials** > **OAuth client ID**.
6. Select **Web application** as the application type.
7. Add the following to **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google` (for local development)
   - `https://your-production-url.vercel.app/api/auth/callback/google` (for production)
8. Copy the **Client ID** and **Client Secret** into `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` in `.env.local`.

## 4. Vercel Deployment Setup

PrepForge AI is fully optimized for Vercel deployment.

1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com/) and create a new project.
3. Import your GitHub repository.
4. Add all environment variables from `.env.local` into the Vercel Environment Variables section.
   - **Note:** You do not need to set `NEXTAUTH_URL` on Vercel; Auth.js detects it automatically.
5. In the Build & Development Settings, Vercel will automatically detect Next.js.
6. The default build command (`npm run build`) runs `next build`, which compiles the project perfectly. Prisma generates automatically during the build via the `postinstall` script (if configured) or the Vercel Prisma integration.
7. Click **Deploy**.

## 5. Additional Services

### UploadThing (Resume Parsing)
1. Create an account at [UploadThing](https://uploadthing.com/).
2. Create a new App.
3. Copy the Secret and App ID to your environment variables.

### Google Gemini AI
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Generate an API Key.
3. Set `GEMINI_API_KEY` in your environment variables.
