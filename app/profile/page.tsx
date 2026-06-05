import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfileView from "@/components/profile/ProfileView";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Retrieve user information
  const user = await prisma.user?.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  });

  if (!user) {
    redirect("/auth/login");
  }

  // Retrieve resumes list
  const resumes = await prisma.resume?.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      url: true,
      createdAt: true,
    },
  });

  // Retrieve mock round history
  const interviews = await prisma.interview?.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      report: {
        select: {
          overallScore: true,
        },
      },
    },
  });

  return (
    <div className="py-6">
      <ProfileView user={user} resumes={resumes} interviews={interviews as unknown as React.ComponentProps<typeof ProfileView>["interviews"]} />
    </div>
  );
}
