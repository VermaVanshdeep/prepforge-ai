# PrepForge Rebrand & Redesign Plan

This plan outlines the steps to transform the generic "InterviewAI" platform into a premium, AI-native product called **PrepForge**. The design aesthetic will heavily borrow from modern, minimal SaaS tools like Linear, Vercel, and Stripe, utilizing Framer Motion for micro-interactions and a glassmorphism aesthetic over dark themes.

## User Review Required

> [!WARNING]
> This redesign replaces the core branding, color palettes, and global layouts. Please review the color tokens and component replacements below to ensure they align with your vision.

## Open Questions

> [!IMPORTANT]
> 1. Should the new Logo SVG replace `public/favicon.ico` or just be used inline?
> 2. Are there specific fonts you prefer? (Defaulting to Inter/Outfit for a modern look).
> 3. Does the "Skill Radar Chart" need to read live AI Analysis data immediately, or should it start with mocked/structured placeholders mapped to actual data schema?

## Proposed Changes

---

### 1. Global Brand & Styling
Upgrade the Tailwind and global CSS infrastructure to support the new tokens and animations.

#### [MODIFY] `tailwind.config.ts`
- Add primary (`#8B5CF6`, `#A855F7`, `#C084FC`), background (`#09090B`), card (`#111118`), and border (`#27272A`) colors.
- Add animation keyframes for gradient shifts and floating cards.

#### [MODIFY] `app/layout.tsx`
- Update the global title to `PrepForge - AI Mock Interview Platform`.
- Ensure standard dark mode implementation over `bg-[#09090B]`.

#### [MODIFY] `app/globals.css`
- Apply core background and text colors to `body`.
- Ensure base generic typography styling maps correctly.

---

### 2. Branding & Logo Components
Remove all references to `InterviewAI` and replace with `PrepForge` along with new SVG graphics.

#### [NEW] `components/ui/Logo.tsx`
- Create a modern, SVG-based minimal forge + spark logo.
- Support `compact` (icon only) and `full` (icon + text) modes.

#### [MODIFY] `components/Navbar.tsx` & `components/Footer.tsx`
- Swap out legacy text branding for the new `Logo` component.

#### [MODIFY] `app/auth/login/page.tsx` & `app/auth/register/page.tsx`
- Update page titles and hero text to reflect the PrepForge identity.

---

### 3. Landing Page Redesign
Implement a highly premium intro mimicking modern developer tools.

#### [MODIFY] `app/page.tsx`
- **Hero Section:** "Forge Your Next Offer." with animated gradient text.
- **Visuals:** Add floating glassmorphism interview cards and AI spark visuals using `framer-motion`.
- **Micro-animations:** Fade-ins, stagger lists, hover scaling.

---

### 4. Dashboard Redesign
Completely overhaul the main user portal.

#### [MODIFY] `app/dashboard/page.tsx`
- Restructure to feed structured readiness metrics to child views.

#### [MODIFY] `components/dashboard/AnalyticsView.tsx` (and `AnalyticsViewWrapper.tsx`)
- **Top Metrics Row:** Create glass-card metrics with hover glow for Interview Streak, Readiness Score, Best Score, and Weekly Growth.
- **Main Analytics:** 
  - Left: Large animated circular progress (Readiness Score).
  - Right: Skill Radar Chart (using Recharts `RadarChart` for Communication, Problem Solving, DSA, etc.).
- **AI Coach Section:** Replace standard tables with an "🤖 AI Coach" card showing strengths, weaknesses, and a dynamic "+12% Expected Gain".
- **Recent Interviews:** Replace the basic list with vertical timeline cards featuring status badges and timestamps.

#### [MODIFY] `components/layout/Sidebar.tsx`
- Rebuild using Lucide React icons.
- Add active glow effects on current routes.
- Implement a collapsible mode (icon only vs full text) with smooth transitions.

---

### 5. Interview Screen Redesign
Elevate the core experience.

#### [MODIFY] `app/interview/[id]/page.tsx`
- Change header layout: Display "PrepForge" badge alongside "SDE Intern Mock Interview".
- Inject persistent Timer, Progress Indicator, and Score Estimate in the top bar.

#### [MODIFY] `components/interview/InterviewSession.tsx`
- **Question Card:** Upgrade to a glassmorphism aesthetic. Clearly denote Question Type, Number, Difficulty, and Estimated Time.
- **Answer Area:** Upgrade text editor to feature markdown support, char count, and a modern focus state.
- **Coding Questions:** Enhance the Monaco wrapper. Add dark theme optimizations, test case panel, and mock execution status displays.

---

## Verification Plan

### Automated Tests
- Run `npm run build` after changes to verify `framer-motion` and `recharts` client boundary interactions are valid.

### Manual Verification
- Visual inspection of the Landing Page for proper Framer Motion execution.
- Validate Mobile responsiveness for the new Radar Chart and Circular Progress.
- Verify the Sidebar toggle transitions smoothly without layout shift.
- Ensure Monaco editor renders correctly inside the new glassmorphism layout during a coding question.
