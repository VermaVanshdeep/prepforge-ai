import Groq from "groq-sdk";

// Groq client initialized from environment variable
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

// Helper to fetch file buffer from a URL
async function fetchFileBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch file from URL: ${url}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// PDF text extractor using pdf-parse v1 simple API
async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse");
  const data = await pdfParse(pdfBuffer);
  return (data?.text || "") as string;
}

// Groq chat completion helper
async function callGroq(prompt: string): Promise<string> {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });
  return response.choices[0]?.message?.content || "";
}

export interface ResumeStructure {
  rawText?: string;
  skills: string[];
  summary: string;
  experience: {
    company: string;
    role: string;
    duration: string;
    description: string;
  }[];
  education: {
    institution: string;
    degree: string;
    field: string;
    year: string;
  }[];
  projects: {
    name: string;
    technologies: string[];
    description: string;
  }[];
  certifications: string[];
}

export interface ATSAnalysisResult {
  score: number;
  missingSkills: string[];
  strengthAreas: string[];
  improvementAreas: string[];
  rawFeedback: string;
}

export interface AIQuestion {
  text: string;
  category?: string;
  type: "TEXT" | "CODING";
  codeTemplate?: string;
  codeLanguage?: string;
  testCases?: { input: string; output: string }[];
}

export interface AnswerEvaluation {
  technicalAccuracy: number;
  communication: number;
  problemSolving: number;
  confidence: number;
  completeness: number;
  relevance: number;
  overallScore: number;
  feedback: string;
  idealAnswer: string;
}

export interface OverallReport {
  overallScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  skillBreakdown: Record<string, number>;
}

/**
 * Extracts raw text from a resume PDF and performs structural analysis using Groq Llama 70B
 */
export async function analyzeResume(resumeUrl: string): Promise<{ rawText: string; analysis: ResumeStructure }> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured. Cannot analyze resume.");
  }

  const pdfBuffer = await fetchFileBuffer(resumeUrl);

  let rawText = "";
  try {
    rawText = await extractTextFromPDF(pdfBuffer);
  } catch (pdfErr) {
    console.error("PDF parsing failed:", pdfErr);
    throw new Error("Failed to extract text from PDF. Ensure it is a valid, non-scanned PDF.");
  }

  if (!rawText.trim()) {
    throw new Error("Extracted resume text is empty. The PDF may be image-based or corrupt.");
  }

  const prompt = `You are a professional technical recruiter and resume analyzer.
Analyze the following raw text extracted from a resume PDF and extract structured components.
Return a JSON object matching this structure EXACTLY (no markdown, just raw JSON):
{
  "skills": ["Skill1", "Skill2"],
  "summary": "Full professional summary",
  "experience": [
    { "company": "Name", "role": "Title", "duration": "Dates", "description": "Details" }
  ],
  "education": [
    { "institution": "University", "degree": "Degree", "field": "Major", "year": "Year" }
  ],
  "projects": [
    { "name": "Project", "technologies": ["Tech1"], "description": "Details" }
  ],
  "certifications": ["Cert1"]
}

RESUME TEXT:
${rawText}`;

  console.log("=== GROQ REQUEST (analyzeResume) ===");
  const text = await callGroq(prompt);
  console.log("=== GROQ RESPONSE (analyzeResume) ===", text.substring(0, 400));

  try {
    const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    const jsonStr = JSON.stringify(parsed);
    for (const forbidden of ["Project X", "Demo Corp", "Sample Project", "Placeholder"]) {
      if (jsonStr.includes(forbidden)) {
        throw new Error(`Hallucination detected: ${forbidden}`);
      }
    }

    return {
      rawText,
      analysis: {
        skills: parsed.skills || [],
        summary: parsed.summary || "",
        experience: parsed.experience || [],
        education: parsed.education || [],
        projects: parsed.projects || [],
        certifications: parsed.certifications || [],
      },
    };
  } catch {
    console.error("Groq response JSON parse failed. Raw:", text);
    throw new Error("Failed to parse resume into structured JSON format.");
  }
}

/**
 * Compares resume data against a job description for ATS Analysis
 */
export async function analyzeATS(resumeData: ResumeStructure, jobDescription: string): Promise<ATSAnalysisResult> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured. Cannot perform ATS analysis.");
  }

  const prompt = `You are an ATS (Applicant Tracking System) matching engine.
Compare the candidate resume data with the target job description.

RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

JOB DESCRIPTION:
${jobDescription}

Return a JSON object of this structure:
{
  "score": 85,
  "missingSkills": ["skill1", "skill2"],
  "strengthAreas": ["area1", "area2"],
  "improvementAreas": ["area1", "area2"],
  "rawFeedback": "Detailed paragraph of feedback"
}`;

  const text = await callGroq(prompt);

  try {
    const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned) as ATSAnalysisResult;
  } catch {
    console.error("ATS JSON parse error. Raw:", text);
    throw new Error("Failed to parse ATS analysis into structured JSON format.");
  }
}

/**
 * Generates dynamic, personalized interview questions using Groq Llama 70B
 */
export async function generateQuestions(
  resumeData: ResumeStructure,
  jobDescription: string,
  type: string,
  difficulty: string,
  count: number
): Promise<AIQuestion[]> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured. Cannot generate interview questions.");
  }

  const rawText = resumeData.rawText || "";
  const analysisStr = JSON.stringify(resumeData, null, 2);

  const prompt = `You are an elite software engineering interviewer at a top-tier tech company.
Generate exactly ${count} personalized mock interview questions.

INPUT DATA:
--- RESUME TEXT ---
${rawText.substring(0, 3000)}
--- RESUME ANALYSIS ---
${analysisStr.substring(0, 2000)}
--- JOB DESCRIPTION ---
${jobDescription.substring(0, 2000)}
--- CONFIGURATION ---
Round Type: ${type}
Difficulty: ${difficulty}
Total Questions: ${count}

CRITICAL RULES:
- Use ONLY data from the resume and job description above
- NEVER invent companies, projects, or technologies not in the resume
- Blacklisted terms (never use): "Project X", "Demo Corp", "Sample Project", "Placeholder", "ABC Company", "XYZ Corp"

QUESTION DISTRIBUTION:
- Technical/Frontend/Backend: 40% JD-based, 30% Resume Projects, 20% CS Fundamentals, 10% Behavioral
- ML: 40% JD ML Topics, 30% Resume Projects, 20% Fundamentals, 10% Behavioral
- HR/Behavioral: Behavioral, Leadership, Conflict, Career Goals, Strengths/Weaknesses

OUTPUT: Return ONLY valid JSON, no markdown, no explanation:
{
  "questions": [
    {
      "question": "...",
      "category": "Resume|JD|DSA|DBMS|OS|CN|System Design|Behavioral|HR",
      "difficulty": "${difficulty}",
      "type": "TEXT|CODING",
      "codeTemplate": "function solve() { }",
      "codeLanguage": "javascript",
      "testCases": [{ "input": "...", "output": "..." }]
    }
  ]
}`;

  const blacklist = ["Project X", "Demo Corp", "Sample Project", "Placeholder", "ABC Company", "XYZ Corp"];
  const contextString = (rawText + " " + analysisStr + " " + jobDescription).toLowerCase();

  for (let attempt = 1; attempt <= 3; attempt++) {
    console.log(`=== GROQ REQUEST (generateQuestions) attempt ${attempt} ===`);
    try {
      const text = await callGroq(prompt);

      console.log("=== GROQ RAW RESPONSE ===");
      console.log(text.substring(0, 800));

      const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").replace(/`/g, "").trim();
      const parsed = JSON.parse(cleaned);

      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error("Invalid response: 'questions' array missing.");
      }

      const aiQuestions: AIQuestion[] = parsed.questions.map((q: {
        question?: string;
        text?: string;
        category?: string;
        type?: string;
        codeTemplate?: string;
        codeLanguage?: string;
        testCases?: { input: string; output: string }[];
      }) => {
        // Groq sometimes uses "question" key instead of "text"
        const questionText = q.text || q.question || "";
        const lowerText = questionText.toLowerCase();

        for (const word of blacklist) {
          if (lowerText.includes(word.toLowerCase())) {
            throw new Error(`Hallucination detected: ${word}`);
          }
        }

        // Contextual entity validation (non-blocking)
        const matches = questionText.match(/([A-Z][a-z0-9]+(?:\s+[A-Z][a-z0-9]+)*)/g) || [];
        const commonWords = ["How", "What", "Explain", "Describe", "Tell", "Can", "Why", "If", "When"];
        for (const entity of matches) {
          if (commonWords.includes(entity) || entity.length < 3) continue;
          if (!contextString.includes(entity.toLowerCase())) {
            console.warn(`Potential hallucination - entity '${entity}' not in context.`);
          }
        }

        return {
          text: questionText,
          category: q.category,
          type: q.type === "CODING" ? "CODING" : "TEXT",
          codeTemplate: q.codeTemplate,
          codeLanguage: q.codeLanguage,
          testCases: q.testCases,
        };
      });

      return aiQuestions;
    } catch (err) {
      console.error(`generateQuestions attempt ${attempt} failed:`, err);
      if (attempt >= 3) throw new Error("Failed to generate valid questions after 3 attempts.");
    }
  }

  throw new Error("Failed to generate valid JSON questions.");
}

/**
 * Evaluates a single question answer using Groq Llama 70B
 */
export async function evaluateAnswer(
  questionText: string,
  questionType: string,
  userAnswer: string,
  codeAnswer?: string
): Promise<AnswerEvaluation> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured. Cannot evaluate answer.");
  }

  const prompt = `You are a technical examiner evaluating a mock interview answer.

QUESTION: ${questionText}
Type: ${questionType}

USER ANSWER (TEXT):
${userAnswer}

${questionType === "CODING" ? `USER CODE SUBMISSION:\n${codeAnswer}` : ""}

Evaluate on 6 aspects (0-100 each) and return a JSON object:
{
  "technicalAccuracy": 85,
  "communication": 80,
  "problemSolving": 90,
  "confidence": 75,
  "completeness": 80,
  "relevance": 85,
  "overallScore": 82,
  "feedback": "Actionable constructive feedback",
  "idealAnswer": "Exemplary answer explanation"
}`;

  const text = await callGroq(prompt);

  try {
    const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned) as AnswerEvaluation;
  } catch {
    console.error("Answer evaluation parse error. Raw:", text);
    throw new Error("Failed to parse evaluation response into JSON.");
  }
}

/**
 * Generates an overall interview report using Groq Llama 70B
 */
export async function generateOverallReport(
  jobTitle: string,
  interviewType: string,
  qas: { question: string; answer: string; codeAnswer?: string; eval: AnswerEvaluation }[]
): Promise<OverallReport> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured. Cannot generate interview report.");
  }

  const transcript = qas
    .map(
      (qa, idx) =>
        `Q${idx + 1}: ${qa.question}\nA${idx + 1}: ${qa.answer}${qa.codeAnswer ? `\nCode: ${qa.codeAnswer}` : ""}\nScore: ${qa.eval.overallScore}\nFeedback: ${qa.eval.feedback}`
    )
    .join("\n\n");

  const prompt = `You are a principal engineering director compiling a final mock interview review.

JOB TITLE: ${jobTitle}
TYPE: ${interviewType}

TRANSCRIPT:
${transcript}

Compute the overall average score, compile strengths, weaknesses, recommendations, and a skill breakdown. Return a JSON object:
{
  "overallScore": 83,
  "summary": "Detailed performance wrap-up",
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "skillBreakdown": {
    "Communication": 85,
    "Problem Solving": 88,
    "Technical Knowledge": 79,
    "Completeness": 80
  }
}`;

  const text = await callGroq(prompt);

  try {
    const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned) as OverallReport;
  } catch {
    console.error("Overall report parse error. Raw:", text);
    throw new Error("Failed to parse overall report response into JSON.");
  }
}
