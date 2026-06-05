"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export interface AdminMetrics {
  userCount: number;
  interviewCount: number;
  totalResumes: number;
  totalUsageLogs: number;
  recentActivity: {
    id: string;
    type: string;
    userName: string;
    userEmail: string;
    date: string;
  }[];
}

/**
 * Retrieves aggregate metrics for the platform administrator dashboard.
 * Protects route by verifying user role: "ADMIN".
 */
export async function getAdminMetrics(): Promise<{ error?: string; metrics?: AdminMetrics }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized access." };
  }

  // Retrieve user to check role
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!dbUser || dbUser.role !== "ADMIN") {
    return { error: "Access denied. Administrator privileges required." };
  }

  try {
    const userCount = await prisma.user.count();
    const interviewCount = await prisma.interview.count();
    const totalResumes = await prisma.resume.count();
    const totalUsageLogs = await prisma.usage.count();

    // Fetch some recent usage logs with user info
    const usages = await prisma.usage.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    type UsageWithUser = (typeof usages)[number];

    const recentActivity = usages.map((u: UsageWithUser) => ({
      id: u.id,
      type: u.type,
      userName: u.user.name || "Unknown",
      userEmail: u.user.email || "No Email",
      date: u.createdAt.toLocaleDateString("en-US"),
    }));

    return {
      metrics: {
        userCount,
        interviewCount,
        totalResumes,
        totalUsageLogs,
        recentActivity,
      },
    };
  } catch (error) {
    console.error("Admin metrics compilation error:", error);
    return { error: "Failed to gather administrative data." };
  }
}
