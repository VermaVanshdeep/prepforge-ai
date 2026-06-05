import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import InterviewSetupForm from "@/components/interview/InterviewSetupForm";

export default async function InterviewPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Retrieve user resumes from database
  const resumes = await prisma.resume?.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, createdAt: true },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Setup Mock Interview</h1>
        <p className="text-slate-400 mt-1 font-medium text-sm">
          Customize your practice session by choosing a resume and specifying job requirements.
        </p>
      </div>

      <InterviewSetupForm initialResumes={resumes} />
    </div>
  );
}
