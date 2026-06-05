import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ResumeAnalysisView from "@/components/resume/ResumeAnalysisViewWrapper";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ResumeAnalysisPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Retrieve structural resume details by ID
  const analysis = await prisma.resumeAnalysis?.findFirst({
    where: {
      id,
      resume: {
        userId: session.user.id,
      },
    },
    include: {
      resume: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!analysis) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Resume Intelligence</h1>
        <p className="text-slate-400 mt-1 font-medium text-sm">
          Review extracted skills, experiences, and match them directly against specific job profiles.
        </p>
      </div>

      <ResumeAnalysisView analysis={analysis} />
    </div>
  );
}
