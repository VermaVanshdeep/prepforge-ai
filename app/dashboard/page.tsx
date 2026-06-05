import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AnalyticsView from "@/components/dashboard/AnalyticsViewWrapper";
import { getInterviewStreak } from "@/lib/dashboard/getInterviewStreak";
import { getBestScore } from "@/lib/dashboard/getBestScore";
import { getReadinessScore } from "@/lib/dashboard/getReadinessScore";
import { getWeeklyGrowth } from "@/lib/dashboard/getWeeklyGrowth";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const userId = session.user.id;

  // 1. Fetch Dynamic Dashboard Metrics
  const streakCount = await getInterviewStreak(userId);
  const bestAtsScore = await getBestScore(userId);
  const avgScore = await getReadinessScore(userId);
  const weeklyImprovement = await getWeeklyGrowth(userId);

  // 2. Fetch completed interviews for the progressive coach logic
  const completedInterviewsCount = await prisma.interview.count({
    where: { userId, status: "COMPLETED" },
  });

  const completedInterviews = await prisma.interview.findMany({
    where: { userId, status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
    include: {
      report: true,
      questions: {
        select: {
          answers: {
            select: { duration: true }
          }
        }
      }
    },
  });

  const latestInterview = completedInterviews[0] || null;
  const previousInterview = completedInterviews[1] || null;

  // Calculate duration of the latest interview in minutes
  let latestDurationMins = 0;
  if (latestInterview) {
    let totalSeconds = 0;
    latestInterview.questions.forEach((q) => {
      q.answers.forEach((a) => {
        totalSeconds += a.duration || 0;
      });
    });
    latestDurationMins = Math.round(totalSeconds / 60);
    if (latestDurationMins === 0) latestDurationMins = 15; // fallback estimate
  }

  // Calculate comparison metrics for State 2
  let scoreImprovement = null;
  let mostImprovedSkill = null;
  let weakestOverallSkill = null;

  if (latestInterview?.report && previousInterview?.report) {
    scoreImprovement = latestInterview.report.overallScore - previousInterview.report.overallScore;
    
    const latestSkills = (latestInterview.report.skillBreakdown as Record<string, number>) || {};
    const prevSkills = (previousInterview.report.skillBreakdown as Record<string, number>) || {};
    
    let maxDiff = -100;
    let minScore = 100;
    
    Object.keys(latestSkills).forEach((skill) => {
      const current = latestSkills[skill];
      const prev = prevSkills[skill];
      
      if (current < minScore) {
        minScore = current;
        weakestOverallSkill = skill;
      }
      
      if (prev !== undefined) {
        const diff = current - prev;
        if (diff > maxDiff) {
          maxDiff = diff;
          mostImprovedSkill = skill;
        }
      }
    });
  }

  // 6. Extract Top Skills from latest Resume Analysis
  const latestAnalysis = await prisma.resumeAnalysis.findFirst({
    where: { resume: { userId } },
    orderBy: { createdAt: "desc" },
    select: { skills: true },
  });
  const topSkills = latestAnalysis?.skills.slice(0, 10) || [];

  // ATS Match Data
  const atsAnalysis = await prisma.aTSAnalysis.findFirst({
    where: { resume: { userId } },
    orderBy: { createdAt: "desc" },
  });

  const resumeMatch = {
    score: atsAnalysis?.score ?? null,
    missingSkills: atsAnalysis?.missingSkills || [],
    strongSkills: atsAnalysis?.strengthAreas || [],
  };

  // 7. Extract Weak Areas from all reports (for the 3+ state)
  const allReports = completedInterviews.map(i => i.report).filter(Boolean);
  const weakAreasMap = new Map<string, number>();
  allReports.forEach((r) => {
    r!.weaknesses.forEach((w) => {
      weakAreasMap.set(w, (weakAreasMap.get(w) || 0) + 1);
    });
  });
  const weakAreas = Array.from(weakAreasMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([skill]) => {
      const adviceMap: Record<string, string> = {
        "React": "Review component lifecycle and hooks.",
        "TypeScript": "Practice strict typing and interfaces.",
        "Node.js": "Review asynchronous event loops.",
        "SQL": "Practice writing complex joins.",
        "System Design": "Practice scaling APIs and load balancing.",
        "Communication": "Structure answers using the STAR method.",
        "DSA": "Focus on array manipulation and hash maps.",
        "Dynamic Programming": "Solve top 10 DP patterns.",
      };
      const advice = adviceMap[skill] || `Practice more problems focusing on ${skill}.`;
      return { skill, advice };
    });

  // 8. Fetch Recent Interviews (all statuses for the table)
  const recentInterviews = await prisma.interview.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      report: {
        select: { overallScore: true },
      },
    },
  });

  // 9. Compile Historical Scores
  const historicalScores = allReports.reverse().map((r) => ({
    date: new Date(r!.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    Score: r!.overallScore,
  }));

  // 10. Compile Competency Scores
  const skillScoresMap: Record<string, number> = {};
  allReports.forEach((r) => {
    const breakdown = (r!.skillBreakdown as Record<string, number>) || {};
    Object.entries(breakdown).forEach(([skill, val]) => {
      skillScoresMap[skill] = skillScoresMap[skill]
        ? Math.round((skillScoresMap[skill] + val) / 2)
        : val;
    });
  });

  const skillData = Object.keys(skillScoresMap).length > 0
    ? Object.entries(skillScoresMap).map(([name, val]) => ({ name, Score: val }))
    : topSkills.map((name) => ({ name, Score: 70 }));

  return (
    <div className="py-6">
      <AnalyticsView 
        stats={{
          completedInterviewsCount,
          streakCount,
          avgScore,
          bestAtsScore,
          weeklyImprovement,
          topSkills,
          weakAreas,
          resumeMatch,
        }}
        coachData={{
          latestInterview: latestInterview as any,
          latestDurationMins,
          previousInterview: previousInterview as any,
          scoreImprovement,
          mostImprovedSkill,
          weakestOverallSkill,
        }}
        recentInterviews={recentInterviews as any}
        historicalScores={historicalScores}
        skillData={skillData}
      />
    </div>
  );
}
