import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import InterviewSession from "@/components/interview/InterviewSession";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InterviewSessionPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Fetch the interview session and preloaded questions
  const interview = await prisma.interview?.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: {
          answers: {
            where: { userId: session.user.id }
          }
        }
      }
    }
  });

  if (!interview) {
    notFound();
  }

  return (
    <div className="py-6">
      <InterviewSession interview={interview as unknown as React.ComponentProps<typeof InterviewSession>["interview"]} />
    </div>
  );
}
