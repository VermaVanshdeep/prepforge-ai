"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { analyzeResume, analyzeATS } from "@/lib/gemini";
import type { ResumeStructure } from "@/lib/gemini";

const resumeUploadSchema = z.object({
  name: z.string().min(1, "File name is required"),
  url: z.string().url("Invalid file URL"),
  fileKey: z.string().min(1, "File key is required"),
});

const atsAnalysisSchema = z.object({
  resumeId: z.string().min(1, "Resume is required"),
  jobTitle: z.string().min(2, "Job title is required"),
  jobDescription: z.string().min(10, "Job description must be at least 10 characters"),
});

/**
 * Uploads a resume record and performs Gemini structural analysis
 */
export async function uploadAndAnalyzeResumeAction(rawData: unknown) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to upload a resume." };
  }

  const parsed = resumeUploadSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i: z.ZodIssue) => i.message).join(", ") };
  }

  const { name, url, fileKey } = parsed.data;

  let resume: { id: string };
  try {
    // Create the resume database record
    resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        name,
        url,
        fileKey,
      },
    });
  } catch (dbError) {
    console.error("[RESUME] Database error creating resume record:", dbError);
    return { 
      error: dbError instanceof Error ? dbError.message : "Failed to save resume to database. Please try again." 
    };
  }

  try {
    // Run Groq PDF resume parser & AI analysis
    const { rawText, analysis: structuredData } = await analyzeResume(url);

    // Update the resume with the raw extracted text
    await prisma.resume.update({
      where: { id: resume.id },
      data: { rawText },
    });

    // Save the analysis structure
    const analysis = await prisma.resumeAnalysis.create({
      data: {
        resumeId: resume.id,
        skills: structuredData.skills,
        experience: structuredData.experience as never,
        education: structuredData.education as never,
        projects: structuredData.projects as never,
        certifications: structuredData.certifications,
        summary: structuredData.summary,
      },
    });

    // Track usage
    await prisma.usage.create({
      data: {
        userId: session.user.id,
        type: "RESUME_UPLOAD",
        count: 1,
      },
    });

    return { success: true, resumeId: resume.id, analysisId: analysis.id };
  } catch (analysisError) {
    console.error("AI analysis error during resume upload:", analysisError);
    // Clean up the resume record since analysis failed
    await prisma.resume.delete({ where: { id: resume.id } }).catch(() => {});
    const message = analysisError instanceof Error ? analysisError.message : "AI analysis failed.";
    return { error: message };
  }
}

/**
 * Deletes an uploaded resume
 */
export async function deleteResumeAction(resumeId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized access." };
  }

  try {
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: session.user.id,
      },
    });

    if (!resume) {
      return { error: "Resume not found or access denied." };
    }

    // Delete the resume (cascading deletes analyses/ATS matches)
    await prisma.resume.delete({
      where: { id: resumeId },
    });

    return { success: true };
  } catch (error) {
    console.error("[RESUME] Failed to delete resume:", error);
    return { 
      error: error instanceof Error ? error.message : "Failed to delete resume. Please try again." 
    };
  }
}

/**
 * Performs ATS Matching comparison against a job description
 */
export async function analyzeATSAction(rawData: unknown) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized access." };
  }

  const parsed = atsAnalysisSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i: z.ZodIssue) => i.message).join(", ") };
  }

  const { resumeId, jobTitle, jobDescription } = parsed.data;

  try {
    // Retrieve resume analysis data
    const resumeAnalysis = await prisma.resumeAnalysis.findFirst({
      where: {
        resumeId,
        resume: {
          userId: session.user.id,
        },
      },
      include: {
        resume: true,
      },
    });

    if (!resumeAnalysis) {
      return { error: "Resume analysis details not found." };
    }

    // Reconstruct the structure for Groq
    const resumeData: ResumeStructure = {
      skills: resumeAnalysis.skills,
      summary: resumeAnalysis.summary,
      experience: resumeAnalysis.experience as never,
      education: resumeAnalysis.education as never,
      projects: resumeAnalysis.projects as never,
      certifications: resumeAnalysis.certifications,
    };

    // Run Groq ATS comparative engine
    const result = await analyzeATS(resumeData, jobDescription);

    // Save job description and ATS records
    const jobDescRecord = await prisma.jobDescription.create({
      data: {
        userId: session.user.id,
        title: jobTitle,
        description: jobDescription,
      },
    });

    const atsAnalysis = await prisma.aTSAnalysis.create({
      data: {
        resumeId,
        jobDescriptionId: jobDescRecord.id,
        score: result.score,
        missingSkills: result.missingSkills,
        strengthAreas: result.strengthAreas,
        improvementAreas: result.improvementAreas,
        rawFeedback: result.rawFeedback,
      },
    });

    // Track usage
    await prisma.usage.create({
      data: {
        userId: session.user.id,
        type: "ATS_ANALYSIS",
        count: 1,
      },
    });

    return {
      success: true,
      analysisId: atsAnalysis.id,
      jobDescriptionId: jobDescRecord.id,
      data: result,
    };
  } catch (error) {
    console.error("[RESUME] ATS Analysis engine failed:", error);
    return { 
      error: error instanceof Error ? error.message : "Failed to complete ATS matching analysis." 
    };
  }
}
