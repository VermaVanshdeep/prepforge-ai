import { prisma } from "@/lib/prisma";

/**
 * Calculates the overall readiness score (average of all overallScores)
 * for completed interviews.
 */
export async function getReadinessScore(userId: string): Promise<number> {
  const result = await prisma.interviewReport.aggregate({
    where: {
      interview: {
        userId: userId,
        status: "COMPLETED",
      },
    },
    _avg: {
      overallScore: true,
    },
  });

  if (result._avg.overallScore === null) {
    return 0;
  }

  return Math.round(result._avg.overallScore);
}
