# Deployment Checklist

Follow this checklist to deploy PrepForge AI successfully to a production Vercel environment.

## 1. Database Provisioning
- [ ] Create a PostgreSQL database instance (e.g., Supabase, Neon, or Railway).
- [ ] Obtain the production `DATABASE_URL`. Ensure you append `?pgbouncer=true&connection_limit=1` if using a pooled connection like Supabase, or standard parameters for direct connections.

## 2. Environment Variables Configuration
Prepare the following variables for Vercel:
- [ ] `DATABASE_URL` (Production database connection string)
- [ ] `AUTH_SECRET` (Generate using `openssl rand -base64 32` or `npx auth secret`)
- [ ] `AUTH_GOOGLE_ID` (From Google Cloud Console - ensure the production Vercel URL is added to the authorized redirect URIs)
- [ ] `AUTH_GOOGLE_SECRET`
- [ ] `UPLOADTHING_SECRET`
- [ ] `UPLOADTHING_APP_ID`
- [ ] `GEMINI_API_KEY`
- [ ] `GROQ_API_KEY` (if using Groq for AI models)

*Note: `NEXTAUTH_URL` is not strictly required on Vercel as Auth.js automatically detects the canonical URL.*

## 3. Database Schema Push
- [ ] Before the first Vercel deployment, push the Prisma schema to your production database. You can do this from your local machine:
  ```bash
  DATABASE_URL="your-production-db-url" npx prisma db push
  ```

## 4. Deploy on Vercel
- [ ] Import the GitHub repository into Vercel.
- [ ] Navigate to **Environment Variables** in Vercel settings and paste the keys prepared in step 2.
- [ ] Ensure the framework preset is "Next.js".
- [ ] Click **Deploy**. Vercel will run `npm run build` which safely executes `next build` and validates TypeScript.

## 5. Verify Authentication
- [ ] Visit your production URL.
- [ ] Click **Sign In**.
- [ ] Verify the Google OAuth flow redirects back to the dashboard securely.
- [ ] Verify that a User record is created in the production database.

## 6. Verify Dashboard
- [ ] Navigate to the Dashboard.
- [ ] Ensure the empty state ("State 0") renders correctly.
- [ ] Verify there are no runtime hydration errors or blank screens.

## 7. Verify Resume Upload & Interview Generation
- [ ] Navigate to the Resumes section.
- [ ] Upload a test PDF.
- [ ] Verify UploadThing processes the file and the server extracts skills correctly.
- [ ] Navigate to the Setup Interview page.
- [ ] Generate a mock interview based on the uploaded resume.
- [ ] Verify the Gemini API generates questions without timing out (Next.js server actions max out at 15s-60s on Vercel Hobby tier, which is usually sufficient).

## 8. Verify Interview Reports
- [ ] Complete a mock interview.
- [ ] Submit the interview and await the AI evaluation.
- [ ] Verify the system successfully writes the `InterviewReport` JSON to the database.
- [ ] Return to the Dashboard and verify the "State 1" (Single Interview Coach View) unlocks properly.
- [ ] Check the Reports page to ensure the detailed question-by-question breakdown is accessible.

## Known Deployment Risks
- **Timeout Limits**: Vercel's free Hobby tier restricts Server Action and API Route execution times (usually 10s-15s). If the Gemini API takes longer than this to evaluate an interview, the request will drop. If this occurs, consider upgrading to Vercel Pro (60s limit) or offloading evaluations to a background queue.
- **Prisma Connection Exhaustion**: If traffic spikes, Prisma might exhaust database connections. Ensure `DATABASE_URL` is using a connection pooler if using Supabase.
