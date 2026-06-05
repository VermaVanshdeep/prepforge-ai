# PrepForge AI

Forge interview-ready skills with AI-powered mock interviews. PrepForge is a premium, AI-native SaaS platform designed to act as your personal interview coach. It dynamically analyzes your resume, generates tailored mock interviews, assesses your technical and communication skills using Google Gemini AI, and progressively unlocks deep analytics to map your direct path to getting hired.

---

## Features

- **Authentication**: Secure OAuth authentication via NextAuth v5 (Google).
- **Interview Generation**: Dynamically creates tailored mock interviews based on target roles, difficulty levels, and the user's personal resume.
- **Interview Evaluation**: AI evaluation engine grades each response for technical accuracy, communication structure, problem-solving, and confidence.
- **AI Coach**: A progressive, actionable AI Coach dashboard that shifts from basic insights (1 session) to trend comparisons (2 sessions) to deep advanced analytics (3+ sessions).
- **Analytics Dashboard**: Dense, production-grade metrics including skill radars, heatmap breakdowns, historical score velocity, and a mathematically estimated "Path to 90+".
- **Resume Analysis**: Extracts skills from uploaded resumes and cross-references them with industry-standard ATS matching criteria to highlight missing gaps.

---

## Tech Stack

**Frontend:**
- [Next.js 15 (App Router)](https://nextjs.org/)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Recharts](https://recharts.org/)

**Backend:**
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Prisma ORM](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)

**Authentication:**
- [NextAuth v5 (Auth.js)](https://authjs.dev/)

**AI & File Storage:**
- [Google Gemini API](https://aistudio.google.com/)
- [UploadThing](https://uploadthing.com/)

**Deployment:**
- [Vercel](https://vercel.com/)

---

## Screenshots

*(Placeholder: Add application screenshots here)*
- Dashboard Overview
- Interview Session View
- Performance Report Details
- Resume ATS Match

---

## Local Setup

Please see the [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) file for complete, step-by-step instructions on running the project locally.

1. Clone the repository.
2. Install dependencies via `npm install`.
3. Set up a PostgreSQL database and configure `.env.local`.
4. Run `npx prisma db push` and `npx prisma generate`.
5. Launch the dev server via `npm run dev`.

---

## Environment Variables

The application requires the following environment variables. A template is provided in `.env.example`.

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string. |
| `AUTH_SECRET` | 32-character base64 secret for NextAuth. |
| `NEXTAUTH_URL` | The application URL (only needed for local dev). |
| `AUTH_GOOGLE_ID` | Google OAuth Client ID. |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret. |
| `UPLOADTHING_SECRET` | UploadThing server secret for resume uploads. |
| `UPLOADTHING_APP_ID` | UploadThing application ID. |
| `GEMINI_API_KEY` | Google Gemini API key for AI generation. |

---

## Architecture Overview

PrepForge relies on a modern serverless architecture optimized for Vercel:
1. **Routing & APIs**: Entirely handled by the Next.js App Router. Background AI tasks are executed securely via Server Actions to keep the frontend payload light.
2. **State Management**: Zustand and React Context are avoided in favor of pure server-side data fetching passed directly into isolated Client Components (like `AnalyticsView` and `InterviewSession`).
3. **Database**: Prisma acts as the data access layer, connecting to a remote PostgreSQL instance. Strict schema validation ensures AI JSON payloads map perfectly to Prisma models without runtime crashes.

---

## Future Enhancements

- **Voice Interviews**: Integrating WebRTC and Speech-to-Text APIs to allow verbal mock interviews.
- **ATS Analysis Engine Upgrade**: Expanding the resume parser to score resumes against specific, user-provided job descriptions.
- **Job Matching**: AI-driven curation of active job postings that align with the user's established skill strengths.
- **AI Study Plans**: Auto-generating daily curriculum timelines based on the "Path to 90+" goals.

---

## Author

Vanshdeep Verma
