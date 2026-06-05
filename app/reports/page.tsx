import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ReportsView from "@/components/reports/ReportsViewWrapper";

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Query actual evaluation reports from the database
  const reports = await prisma.interviewReport?.findMany({
    where: {
      interview: {
        userId: session.user.id,
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      interview: {
        select: {
          jobTitle: true,
          interviewType: true,
          difficulty: true,
          questions: {
            orderBy: { order: "asc" },
            include: {
              answers: {
                where: { userId: session.user.id },
                select: {
                  text: true,
                  codeAnswer: true,
                  evaluation: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return (
    <div className="py-6">
      <ReportsView reports={reports as any} />
    </div>
  );
}
