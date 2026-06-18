# Environment Variables Documentation

This document explains the environment variables required to run **InterviewAI** locally or in production.

Copy the `.env.example` file to `.env` before starting the application:
```bash
cp .env.example .env
```

---

## 1. Database Configuration

### `DATABASE_URL`
- **Description:** The connection string for your PostgreSQL database. Prisma uses this to connect to the database, run migrations, and execute queries.
- **Format:** `postgresql://[user]:[password]@[host]:[port]/[database]?schema=[schema]`
- **Local Example:** `postgresql://postgres:postgres@localhost:5432/interview_ai?schema=public`

---

## 2. Authentication Configuration (NextAuth v5)

### `AUTH_SECRET` (or `NEXTAUTH_SECRET`)
- **Description:** A random secret string used by NextAuth (Auth.js) to encrypt session cookies, sign JWT tokens, and hash state hashes.
- **Requirement:** Must be a cryptographically secure string of at least 32 characters.
- **How to generate:**
  You can generate one using `openssl` in your terminal:
  ```bash
  openssl rand -base64 33
  ```
  Or via Node.js in your terminal:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```

### `NEXTAUTH_URL`
- **Description:** The canonical URL of your application. NextAuth uses this to construct redirects and OAuth callback URLs.
- **Local Default:** `http://localhost:3000`
- **Production Example:** `https://interviewai.com`
- *Note:* In Vercel deployments, this is automatically set and does not need to be explicitly configured.

---

## 3. Google OAuth Integration

To configure Google Sign-In, you need to obtain credentials from the **Google Cloud Console**:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project.
3. Go to **APIs & Services** > **OAuth consent screen**:
   - Set the User Type to **External**.
   - Fill in the application information (App name, support email, developer contact).
   - Under Scopes, add `/auth/userinfo.profile` and `/auth/userinfo.email`.
4. Go to **APIs & Services** > **Credentials**:
   - Click **+ Create Credentials** > **OAuth client ID**.
   - Set the Application Type to **Web application**.
   - Under **Authorized JavaScript origins**, add:
     - `http://localhost:3000`
   - Under **Authorized redirect URIs**, add:
     - `http://localhost:3000/api/auth/callback/google`
5. Copy the Client ID and Client Secret generated.

### `GOOGLE_CLIENT_ID` (or `AUTH_GOOGLE_ID`)
- **Description:** Google OAuth Client ID obtained from the Credentials dashboard.
- **Example:** `1234567890-a1b2c3d4e5f6g7h8.apps.googleusercontent.com`

### `GOOGLE_CLIENT_SECRET` (or `AUTH_GOOGLE_SECRET`)
- **Description:** Google OAuth Client Secret corresponding to the Client ID above.
- **Example:** `GOCSPX-abc123xyz456_example_secret`

---

## 4. UploadThing Configuration

### `UPLOADTHING_TOKEN`
- **Description:** Token obtained from UploadThing for handling resume PDF uploads and storage.

---

## 5. AI Service Configuration

### `GEMINI_API_KEY`
- **Description:** Google Gemini AI API key used for resume analysis, mock interview generation, and evaluation.
- **How to obtain:** Generate an API Key in the [Google AI Studio](https://aistudio.google.com/).

### `GROQ_API_KEY`
- **Description:** Groq API key used as an alternative LLM provider.
- **How to obtain:** Generate an API Key in the [Groq Console](https://console.groq.com/).
