import { prisma } from "@/lib/prisma";

/**
 * Calculates the best overall score a user has achieved in any completed interview.
 * Replaces hardcoded values with actual MAX query.
 * 
 * Returns the highest overallScore from InterviewReport records.
 * Returns 0 if no reports exist.
 */
export async function getBestScore(userId: string): Promise<number> {
  const result = await prisma.interviewReport.aggregate({
    where: {
      interview: {
        userId: userId,
        status: "COMPLETED",
      },
    },
    _max: {
      overallScore: true,
    },
  });

  return result._max.overallScore ?? 0;
}
