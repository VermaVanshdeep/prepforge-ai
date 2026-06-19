"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { generateQuestions, evaluateAnswer, generateOverallReport } from "@/lib/gemini";
import type { ResumeStructure, AnswerEvaluation } from "@/lib/gemini";
import type { Prisma, Question, Answer } from "@prisma/client";

// Type for a Question with its nested answers (from Prisma include)
type QuestionWithAnswers = Question & { answers: Answer[] };

const createInterviewSchema = z.object({
  resumeId: z.string().optional(),
  jobTitle: z.string().min(2, "Job title is required"),
  jobDescription: z.string().min(10, "Job description must be at least 10 characters"),
  interviewType: z.enum(["TECHNICAL", "BEHAVIORAL", "HR", "SYSTEM_DESIGN", "MACHINE_LEARNING", "FRONTEND", "BACKEND"]),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  questionCount: z.number().min(3).max(20),
});

const submitAnswerSchema = z.object({
  interviewId: z.string().min(1),
  questionId: z.string().min(1),
  text: z.string().default(""),
  codeAnswer: z.string().optional(),
  duration: z.number().min(0).optional(),
});

/**
 * Creates a new interview session and generates personalized questions using Gemini
 */
export async function createInterviewAction(rawData: unknown) {
  console.log("========== START createInterviewAction ==========");
  
  const session = await auth();
  if (!session?.user?.id) {
    console.error("Auth Failed: No user ID in session");
    return { error: "Unauthorized access." };
  }

  const parsed = createInterviewSchema.safeParse(rawData);
  if (!parsed.success) {
    console.error("Zod Validation Failed:", parsed.error.issues);
    return { error: parsed.error.issues.map((i: z.ZodIssue) => i.message).join(", ") };
  }

  const { resumeId, jobTitle, jobDescription, interviewType, difficulty, questionCount } = parsed.data;

  console.log("--- REQUEST PARAMETERS ---");
  console.log("User ID:", session.user.id);
  console.log("Resume ID:", resumeId || "None");
  console.log("Job Title:", jobTitle);
  console.log("Interview Type:", interviewType);
  console.log("Difficulty:", difficulty);
  console.log("Question Count:", questionCount);

  try {
    let resumeData: ResumeStructure = {
      skills: [],
      summary: "",
      experience: [],
      education: [],
      projects: [],
      certifications: [],
    };

    if (resumeId) {
      const analysis = await prisma.resumeAnalysis.findFirst({
        where: {
          resumeId,
          resume: { userId: session.user.id },
        },
        include: {
          resume: true,
        }
      });

      if (analysis) {
        resumeData = {
          rawText: analysis.resume?.rawText || "",
          skills: analysis.skills,
          summary: analysis.summary,
          experience: analysis.experience as ResumeStructure["experience"],
          education: analysis.education as ResumeStructure["education"],
          projects: analysis.projects as ResumeStructure["projects"],
          certifications: analysis.certifications,
        };
        console.log("Loaded Resume Data Skills:", resumeData.skills.length > 0 ? "Yes" : "No");
      } else {
        console.warn(`WARNING: Resume ID ${resumeId} provided but no analysis found!`);
        throw new Error("Resume not found or has not been analyzed yet.");
      }
    }

    console.log("GROQ KEY EXISTS:", !!process.env.GROQ_API_KEY);
    console.log("--- GROQ FULL REQUEST TRIGGER ---");
    console.log("Calling generateQuestions()");
    
    // Call Gemini generator
    const aiQuestions = await generateQuestions(
      resumeData,
      jobDescription,
      interviewType,
      difficulty,
      questionCount
    );

    console.log("--- GROQ FULL RESPONSE TRIGGERED ---");
    console.log(`Received ${aiQuestions.length} questions from Groq.`);

    // Create the interview and its questions inside a transaction
    const interview = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const interviewRecord = await tx.interview.create({
        data: {
          userId: session.user.id,
          resumeId: resumeId || null,
          jobTitle,
          jobDescription,
          interviewType,
          difficulty,
          questionCount,
          status: "IN_PROGRESS",
        },
      });

      const questionsData = aiQuestions.map((q: { text: string; category?: string; type?: string; codeTemplate?: string | null; codeLanguage?: string | null; testCases?: unknown }, idx: number) => ({
        interviewId: interviewRecord.id,
        text: q.text,
        category: q.category || null,
        order: idx,
        type: q.type || "TEXT",
        codeTemplate: q.codeTemplate || null,
        codeLanguage: q.codeLanguage || null,
        testCases: q.testCases ? (q.testCases as Prisma.InputJsonValue) : undefined,
      }));

      await tx.question.createMany({
        data: questionsData,
      });

      return interviewRecord;
    });

    // Track usage
    await prisma.usage.create({
      data: {
        userId: session.user.id,
        type: "INTERVIEW_GENERATED",
        count: 1,
      },
    });

    console.log("========== END createInterviewAction SUCCESS ==========");
    return { success: true, interviewId: interview.id };
  } catch (error: unknown) {
    console.error("========== CATCH: createInterviewAction FAILED ==========");
    console.error("Stack Trace:");
    console.error(error); // Prints stack trace to terminal

    // Return the actual error message to the client
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during generation.";
    return { error: errorMessage };
  }
}

/**
 * Saves and evaluates a single question response in the database
 */
export async function submitAnswerAction(rawData: unknown) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized access." };
  }

  const parsed = submitAnswerSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i: z.ZodIssue) => i.message).join(", ") };
  }

  const { interviewId, questionId, text, codeAnswer, duration } = parsed.data;

  try {
    // Verify question and interview ownership
    const question = await prisma.question.findFirst({
      where: {
        id: questionId,
        interviewId,
        interview: { userId: session.user.id },
      },
    });

    if (!question) {
      return { error: "Question not found or access denied." };
    }

    // Evaluate answer with Gemini
    const evaluation = await evaluateAnswer(question.text, question.type, text, codeAnswer);

    // Save answer & evaluation results in DB
    const _answer = await prisma.answer.upsert({
      where: {
        id: (await prisma.answer.findFirst({
          where: { questionId, userId: session.user.id },
        }))?.id || "temp-answer-id",
      },
      create: {
        questionId,
        userId: session.user.id,
        text,
        codeAnswer: codeAnswer || null,
        duration: duration || null,
        evaluation: evaluation as never,
      },
      update: {
        text,
        codeAnswer: codeAnswer || null,
        duration: duration || null,
        evaluation: evaluation as never,
      },
    });

    return { success: true, evaluation };
  } catch (error) {
    console.error("[INTERVIEW] Failed to save and evaluate answer:", error);
    return { 
      error: error instanceof Error ? error.message : "Failed to submit answer. Please try again." 
    };
  }
}

/**
 * Finalizes the interview, aggregates scores, builds the overall report, and sets status to COMPLETED
 */
export async function finalizeInterviewAction(interviewId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized access." };
  }

  try {
    const interview = await prisma.interview.findFirst({
      where: {
        id: interviewId,
        userId: session.user.id,
      },
      include: {
        questions: {
          include: {
            answers: {
              where: { userId: session.user.id },
            },
          },
        },
      },
    });

    if (!interview) {
      return { error: "Interview session not found." };
    }

    const totalQuestions = interview.questions.length;
    
    const qas = interview.questions.map((q: QuestionWithAnswers) => {
      const ans: Answer | undefined = q.answers[0];
      const evaluation: AnswerEvaluation = (ans?.evaluation as unknown as AnswerEvaluation) || {
        technicalAccuracy: 0,
        communication: 0,
        problemSolving: 0,
        confidence: 0,
        completeness: 0,
        relevance: 0,
        overallScore: 0,
        feedback: "No response submitted.",
        idealAnswer: "No ideal answer calculated.",
      };

      return {
        question: q.text,
        answer: ans?.text || "",
        codeAnswer: ans?.codeAnswer || undefined,
        eval: evaluation,
      };
    });

    const answeredQuestionsArr = qas.filter(
      q => q.answer.trim().length > 0 || (q.codeAnswer?.trim().length ?? 0) > 0
    );
    const answeredQuestions = answeredQuestionsArr.length;
    const skippedQuestions = totalQuestions - answeredQuestions;

    const completionRate = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
    
    let confidenceLevel = "None";
    if (completionRate >= 80) confidenceLevel = "High";
    else if (completionRate >= 40) confidenceLevel = "Medium";
    else if (completionRate > 0) confidenceLevel = "Low";

    let reportData;
    let knowledgeScore = 0;

    if (answeredQuestions === 0) {
      reportData = {
        overallScore: 0,
        summary: "No answers were submitted. A performance assessment cannot be generated.",
        strengths: [],
        weaknesses: ["Insufficient response data available."],
        recommendations: ["Complete an interview to receive a personalized study plan."],
        skillBreakdown: {},
      };
    } else {
      const totalScore = answeredQuestionsArr.reduce((sum, q) => sum + (q.eval.overallScore || 0), 0);
      knowledgeScore = Math.round(totalScore / answeredQuestions);
      
      // Run overall report generator using Gemini (passing only answered questions)
      reportData = await generateOverallReport(interview.jobTitle, interview.interviewType, answeredQuestionsArr);
      // Override the overall score with the exactly calculated knowledge score from answered questions
      reportData.overallScore = knowledgeScore;
    }

    // Save report in DB
    const report = await prisma.interviewReport.upsert({
      where: { interviewId },
      create: {
        interviewId,
        overallScore: reportData.overallScore, // Treats as knowledgeScore
        completionRate,
        confidenceLevel,
        answeredQuestions,
        skippedQuestions,
        summary: reportData.summary,
        strengths: reportData.strengths,
        weaknesses: reportData.weaknesses,
        recommendations: reportData.recommendations,
        skillBreakdown: reportData.skillBreakdown as never,
      },
      update: {
        overallScore: reportData.overallScore,
        completionRate,
        confidenceLevel,
        answeredQuestions,
        skippedQuestions,
        summary: reportData.summary,
        strengths: reportData.strengths,
        weaknesses: reportData.weaknesses,
        recommendations: reportData.recommendations,
        skillBreakdown: reportData.skillBreakdown as never,
      },
    });

    // Mark interview status as COMPLETED
    await prisma.interview.update({
      where: { id: interviewId },
      data: { status: "COMPLETED" },
    });

    return { success: true, reportId: report.id };
  } catch (error) {
    console.error("[INTERVIEW] Failed to finalize interview report:", error);
    return { 
      error: error instanceof Error ? error.message : "Failed to compile the report." 
    };
  }
}
