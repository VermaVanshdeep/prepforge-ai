import { prisma } from "@/lib/prisma";

/**
 * Calculates the current active interview streak for a user in days.
 * A streak means:
 * - User completed at least one interview on a day.
 * - Only interviews with status = "COMPLETED" count.
 * - Consecutive days only.
 * - If there is a gap, streak resets.
 * 
 * If today is Jun 4:
 * Jun 1, Jun 2, Jun 3 -> 3 Days
 * Jun 1, Jun 3 -> 1 Day (Jun 3)
 * Jun 1, Jun 2, Jun 4 -> 1 Day (Jun 4)
 */
export async function getInterviewStreak(userId: string): Promise<number> {
  const completedInterviews = await prisma.interview.findMany({
    where: {
      userId,
      status: "COMPLETED",
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      createdAt: true,
    },
  });

  if (completedInterviews.length === 0) {
    return 0;
  }

  // Extract unique local date strings (YYYY-MM-DD)
  const dateSet = new Set<string>();
  completedInterviews.forEach((interview) => {
    // Format to local date string to avoid timezone shifts
    const d = new Date(interview.createdAt);
    const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    dateSet.add(dateString);
  });

  const uniqueDates = Array.from(dateSet).sort((a, b) => b.localeCompare(a));

  if (uniqueDates.length === 0) return 0;

  let streak = 0;
  
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

  // If there's no interview today or yesterday, the streak is broken (0)
  if (!dateSet.has(todayStr) && !dateSet.has(yesterdayStr)) {
    return 0;
  }

  // Determine starting point for counting backwards
  let currentDate = new Date(today);
  
  // If no interview today, but there is one yesterday, start counting from yesterday
  if (!dateSet.has(todayStr)) {
    currentDate = new Date(yesterday);
  }

  // Count backwards
  while (true) {
    const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
    
    if (dateSet.has(dateString)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
