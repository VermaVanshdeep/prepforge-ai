import { prisma } from "@/lib/prisma";

/**
 * Calculates weekly growth in Readiness Score.
 * Current week: last 7 days.
 * Previous week: 7 days before that (days 8-14 ago).
 * 
 * Formula: ((CurrentWeekAverage - PreviousWeekAverage) / PreviousWeekAverage) * 100
 * If previous week does not exist: Display: "N/A"
 */
export async function getWeeklyGrowth(userId: string): Promise<number | null> {
  const now = new Date();
  
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(now.getDate() - 7);
  
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(now.getDate() - 14);

  // Fetch current week reports
  const currentWeekAgg = await prisma.interviewReport.aggregate({
    where: {
      interview: {
        userId,
        status: "COMPLETED",
      },
      createdAt: {
        gte: oneWeekAgo,
        lte: now,
      },
    },
    _avg: {
      overallScore: true,
    },
  });

  // Fetch previous week reports
  const previousWeekAgg = await prisma.interviewReport.aggregate({
    where: {
      interview: {
        userId,
        status: "COMPLETED",
      },
      createdAt: {
        gte: twoWeeksAgo,
        lt: oneWeekAgo,
      },
    },
    _avg: {
      overallScore: true,
    },
  });

  const currentAvg = currentWeekAgg._avg.overallScore;
  const previousAvg = previousWeekAgg._avg.overallScore;

  if (previousAvg === null || previousAvg === 0) {
    return null;
  }

  if (currentAvg === null) {
    return null; // No reports this week to compare
  }

  const growth = ((currentAvg - previousAvg) / previousAvg) * 100;
  return Math.round(growth);
}
