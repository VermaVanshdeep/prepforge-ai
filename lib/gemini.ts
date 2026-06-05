import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure the GoogleGenerativeAI instance is initialized with the API key from environment variables
const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenerativeAI(apiKey);

// Helper to fetch file buffer from a URL
async function fetchFileBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch file from URL: ${url}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
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
 * Extracts raw text and structured data from a resume PDF using Gemini 1.5/2.5 Flash
 */
export async function analyzeResume(resumeUrl: string): Promise<{ rawText: string; analysis: ResumeStructure }> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured. Cannot analyze resume.");
  }

  const pdfBuffer = await fetchFileBuffer(resumeUrl);

  const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are a professional technical recruiter and resume analyzer.
Analyze the attached resume PDF and extract the structural components strictly in JSON format.
You must return a JSON object that matches the following structure exactly (no markdown, just JSON):
{
  "rawText": "The complete, verbatim text extracted from the entire PDF.",
  "skills": ["Skill1", "Skill2"],
  "summary": "Full professional summary",
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "duration": "Dates or Duration",
      "description": "Responsibilities and achievements"
    }
  ],
  "education": [
    {
      "institution": "University/School",
      "degree": "Degree",
      "field": "Major/Field of Study",
      "year": "Graduation year"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "technologies": ["Tech1", "Tech2"],
      "description": "Details of the project"
    }
  ],
  "certifications": ["Cert1", "Cert2"]
}
`;

  console.log("=== GEMINI REQUEST (analyzeResume) ===");
  console.log("Resume URL:", resumeUrl);

  const result = await model.generateContent([
    {
      inlineData: {
        data: pdfBuffer.toString("base64"),
        mimeType: "application/pdf",
      },
    },
    prompt,
  ]);

  let text = result.response.text();

  console.log("=== GEMINI RESPONSE (analyzeResume) ===");
  console.log("Raw response snippet:", text.substring(0, 400));

  try {
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(text);
    
    if (!parsed.rawText || parsed.rawText.trim() === "") {
      throw new Error("Resume extraction failed");
    }

    const jsonStringified = JSON.stringify(parsed);
    const forbidden = ["Project X", "Demo Corp", "Sample Project", "Placeholder"];
    for (const word of forbidden) {
      if (jsonStringified.includes(word)) {
        throw new Error(`Hallucination detected in resume analysis: ${word}`);
      }
    }

    return {
      rawText: parsed.rawText,
      analysis: {
        skills: parsed.skills || [],
        summary: parsed.summary || "",
        experience: parsed.experience || [],
        education: parsed.education || [],
        projects: parsed.projects || [],
        certifications: parsed.certifications || [],
      }
    };
  } catch (error) {
    console.error("Gemini failed to generate valid JSON. Raw response:", text);
    throw new Error("Failed to parse resume into structured JSON format.");
  }
}

/**
 * Compares resume text/data against a job description for ATS Analysis
 */
export async function analyzeATS(resumeData: ResumeStructure, jobDescription: string): Promise<ATSAnalysisResult> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured. Cannot perform ATS analysis.");
  }

  const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are an ATS (Applicant Tracking System) matching engine.
Compare the following candidate resume data with the target job description.

RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

JOB DESCRIPTION:
${jobDescription}

Perform a strict ATS match analysis and return a JSON object of this structure:
{
  "score": 85, // An integer match score from 0 to 100
  "missingSkills": ["List of critical skills or keywords in the job description that are missing from the resume"],
  "strengthAreas": ["List of areas where the candidate's resume matches or exceeds the requirements"],
  "improvementAreas": ["List of actionable areas where the resume could be improved to better fit this job"],
  "rawFeedback": "A detailed written paragraph of constructive feedback regarding the fit"
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    const jsonString = text.replace(/```json/i, "").replace(/```/g, "").trim();
    return JSON.parse(jsonString) as ATSAnalysisResult;
  } catch (error) {
    console.error("ATS JSON parsing error. Raw response:", text);
    throw new Error("Failed to parse ATS analysis into structured JSON format.");
  }
}

/**
 * Generates dynamic, highly personalized interview questions
 */
export async function generateQuestions(
  resumeData: ResumeStructure,
  jobDescription: string,
  type: string, // TECHNICAL, BEHAVIORAL, HR, SYSTEM_DESIGN, MACHINE_LEARNING, FRONTEND, BACKEND
  difficulty: string, // EASY, MEDIUM, HARD
  count: number
): Promise<AIQuestion[]> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured. Cannot generate real personalized interview questions.");
  }

  const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

  const rawText = resumeData.rawText || "";
  const analysisStr = JSON.stringify(resumeData, null, 2);

  const prompt = `You are an elite, highly adaptive software engineering interviewer at a top-tier tech company.
Your task is to generate exactly ${count} personalized mock interview questions.

INPUT DATA:
--- RESUME TEXT ---
${rawText}
--- RESUME ANALYSIS ---
${analysisStr}
--- JOB DESCRIPTION ---
${jobDescription}
--- CONFIGURATION ---
Round Type: ${type}
Difficulty: ${difficulty}
Total Questions: ${count}

CRITICAL INSTRUCTIONS:
1. Use BOTH the uploaded resume and the JD.
2. No fake companies, fake projects, fake experience, or placeholder content may ever appear.
3. No hardcoded mock questions. DO NOT generate generic questions. DO NOT generate fake questions.
4. Everything must originate from the Resume Raw Text, Resume Analysis, or Job Description.
5. NEVER invent companies, years of experience, project names, technologies, achievements, or job titles.

QUESTION DISTRIBUTION STRATEGY:
If Technical Round: 40% JD-based, 30% Resume Project based, 20% CS Fundamentals, 10% Behavioral
If Frontend: 40% React/Next.js/JD, 30% Resume Projects, 20% JS/CSS/Web Concepts, 10% Behavioral
If Backend: 40% APIs/JD, 30% Resume Projects, 20% DBMS/OS/System Design, 10% Behavioral
If ML: 40% JD ML Topics, 30% Resume Projects, 20% Fundamentals, 10% Behavioral
If HR/Behavioral: Behavioral, Leadership, Conflict, Ownership, Career Goals, Strengths, Weaknesses

ANTI-HALLUCINATION RULES:
- Blacklist: "Project X", "Demo Corp", "Sample Project", "Placeholder", "ABC Company", "XYZ Corp". Never use them.
- If you mention a project or company, it MUST exist in the provided resume.

OUTPUT FORMAT ENFORCEMENT:
Return ONLY valid JSON.
Do not use markdown.
Do not wrap in \`\`\`json.
Do not write explanations.
Output must begin with { and end with }

Expected format:
{
  "questions": [
    {
      "question": "...",
      "category": "Resume" or "JD" or "DSA" or "DBMS" or "OS" or "CN" or "System Design" or "Behavioral" or "HR",
      "difficulty": "${difficulty}",
      "type": "TEXT" or "CODING",
      "codeTemplate": "function solve() { ... }", 
      "codeLanguage": "javascript",
      "testCases": [ { "input": "...", "output": "..." } ]
    }
  ]
}
`;

  console.log("-----------------");
  console.log("RESUME TEXT");
  console.log("-----------------");
  console.log(rawText.substring(0, 1500) + (rawText.length > 1500 ? "...\n[TRUNCATED]" : ""));
  
  console.log("-----------------");
  console.log("RESUME ANALYSIS");
  console.log("-----------------");
  console.log(analysisStr.substring(0, 1500) + (analysisStr.length > 1500 ? "...\n[TRUNCATED]" : ""));

  console.log("-----------------");
  console.log("JOB DESCRIPTION");
  console.log("-----------------");
  console.log(jobDescription.substring(0, 1500) + (jobDescription.length > 1500 ? "...\n[TRUNCATED]" : ""));

  console.log("-----------------");
  console.log("PROMPT SENT TO GEMINI");
  console.log("-----------------");
  console.log(prompt.substring(0, 1500) + (prompt.length > 1500 ? "...\n[TRUNCATED]" : ""));

  let attempts = 0;
  const maxAttempts = 3;
  const blacklist = ["Project X", "Demo Corp", "Sample Project", "Placeholder", "ABC Company", "XYZ Corp"];
  const contextString = (rawText + " " + analysisStr + " " + jobDescription).toLowerCase();

  while (attempts < maxAttempts) {
    attempts++;
    console.log(`=== GEMINI REQUEST Attempt ${attempts} ===`);

    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text();
      
      console.log("-----------------");
      console.log("RAW GEMINI RESPONSE");
      console.log("-----------------");
      console.log(text);

      // JSON SANITIZATION
      const jsonString = text
        .replace(/\`\`\`json/gi, "")
        .replace(/\`\`\`/g, "")
        .replace(/\`/g, "")
        .trim();
        
      const parsed = JSON.parse(jsonString);
      
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error("Invalid output format: 'questions' array missing.");
      }

      const aiQuestions: AIQuestion[] = parsed.questions.map((q: { text: string; category?: string; type?: string; codeTemplate?: string; codeLanguage?: string; testCases?: string[] }) => {
        const questionText = (q.text || "").toLowerCase();
        const originalText = q.text || "";
        
        // Final Anti-Hallucination Guardrail
        for (const word of blacklist) {
          if (questionText.includes(word.toLowerCase())) {
            throw new Error(`Hallucination detected in generated question: ${word}`);
          }
        }

        // Contextual Entity Validation
        // Extract capitalized words as potential entities (e.g. React, Next.js, CompanyName)
        const entityRegex = /([A-Z][a-z0-9]+(?:\s+[A-Z][a-z0-9]+)*)/g;
        const matches = originalText.match(entityRegex) || [];
        
        for (const entity of matches) {
          // Ignore very common capitalized words at start of sentences
          const commonWords = ["How", "What", "Explain", "Describe", "Tell", "Can", "Why", "If", "When"];
          if (commonWords.includes(entity) || entity.length < 3) continue;

          if (!contextString.includes(entity.toLowerCase())) {
            console.warn(`Entity '${entity}' not found in context. Potential hallucination.`);
            // In a strict environment, we could throw here. 
            // We'll trust the LLM mostly but log heavily, and throw on the explicit blacklist.
          }
        }

        return {
          text: q.text,
          category: q.category,
          type: q.type === "CODING" ? "CODING" : "TEXT",
          codeTemplate: q.codeTemplate,
          codeLanguage: q.codeLanguage,
          testCases: q.testCases,
        };
      });
      
      return aiQuestions;
    } catch (error) {
      console.error(`Questions generation error on attempt ${attempts}:`, error);
      if (attempts >= maxAttempts) {
        throw new Error("Failed to generate valid questions after 3 attempts.");
      }
      console.log("Regenerating questions...");
    }
  }

  throw new Error("Failed to generate valid JSON questions.");
}

/**
 * Evaluates a single question answer
 */
export async function evaluateAnswer(
  questionText: string,
  questionType: string,
  userAnswer: string,
  codeAnswer?: string
): Promise<AnswerEvaluation> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured. Cannot evaluate answer.");
  }

  const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are a technical examiner evaluating a mock interview answer.
Review the question and the user's response.

QUESTION:
${questionText}
Type: ${questionType}

USER ANSWER (TEXT):
${userAnswer}

${questionType === "CODING" ? `USER CODE SUBMISSION:\n${codeAnswer}` : ""}

Evaluate this response on 6 core aspects out of 100, calculate an overall score, and supply constructive feedback and a suggested ideal answer.
For coding answers, perform a code review including analysis of time/space complexity and optimization suggestions inside the feedback.

Return a JSON object of this structure:
{
  "technicalAccuracy": 85,
  "communication": 80,
  "problemSolving": 90,
  "confidence": 75,
  "completeness": 80,
  "relevance": 85,
  "overallScore": 82,
  "feedback": "Actionable, constructive feedback details",
  "idealAnswer": "Exemplary answer explanation"
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    const jsonString = text.replace(/```json/i, "").replace(/```/g, "").trim();
    return JSON.parse(jsonString) as AnswerEvaluation;
  } catch (error) {
    console.error("Answer evaluation parsing error. Raw response:", text);
    throw new Error("Failed to parse evaluation response into JSON.");
  }
}

/**
 * Generates an overall report from a full interview QA set
 */
export async function generateOverallReport(
  jobTitle: string,
  interviewType: string,
  qas: { question: string; answer: string; codeAnswer?: string; eval: AnswerEvaluation }[]
): Promise<OverallReport> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured. Cannot generate interview report.");
  }

  const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are a principal engineering director compiling a final review report for a mock interview round.
Review the following transcript and scoring:

JOB TITLE: ${jobTitle}
TYPE: ${interviewType}

TRANSCRIPT:
${qas
  .map(
    (qa, idx) => `
Q${idx + 1}: ${qa.question}
A${idx + 1}: ${qa.answer} ${qa.codeAnswer ? `\nCode: ${qa.codeAnswer}` : ""}
Evaluation Score: ${qa.eval.overallScore}
AI Feedback: ${qa.eval.feedback}
`
  )
  .join("\n")}

Compute the overall average score, construct a detailed performance summary, compile key strengths and weaknesses, specify actionable recommendations, and provide a skill breakdown mapping key technical or behavioral skill terms to their computed average score (out of 100).

Return a JSON object of this structure:
{
  "overallScore": 83, // integer overall score
  "summary": "Detailed overall wrap-up analysis paragraph",
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "skillBreakdown": {
    "Communication": 85,
    "Problem Solving": 88,
    "Technical Knowledge": 79,
    "Completeness": 80
  }
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    const jsonString = text.replace(/```json/i, "").replace(/```/g, "").trim();
    return JSON.parse(jsonString) as OverallReport;
  } catch (error) {
    console.error("Overall report generation parsing error. Raw response:", text);
    throw new Error("Failed to parse overall report response into JSON.");
  }
}
