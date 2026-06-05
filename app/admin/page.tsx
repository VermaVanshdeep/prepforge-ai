import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ShieldAlert, Users, Layers, FileText, Activity } from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Double check admin role
  const user = await prisma.user?.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Fetch administrator statistics
  const userCount = (await prisma.user?.count()) ?? 0;
  const interviewCount = (await prisma.interview?.count()) ?? 0;
  const totalResumes = (await prisma.resume?.count()) ?? 0;
  const totalReports = (await prisma.interviewReport?.count()) ?? 0;

  const recentUsages = await prisma.usage?.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  });

  return (
    <div className="space-y-8 py-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <ShieldAlert className="h-8 w-8 text-indigo-400" />
          Admin Dashboard
        </h1>
        <p className="text-slate-400 mt-1 font-medium text-sm">
          Overview of global metrics, user counts, and platform activity logs.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-2xl border border-white/5 bg-[#09090b]/40 backdrop-blur-md p-6 relative overflow-hidden">
          <div className="absolute right-3 top-3 h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400">
            <Users className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Users</span>
          <span className="text-4xl font-black text-white block mt-2">{userCount}</span>
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#09090b]/40 backdrop-blur-md p-6 relative overflow-hidden">
          <div className="absolute right-3 top-3 h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400">
            <Layers className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Interviews</span>
          <span className="text-4xl font-black text-white block mt-2">{interviewCount}</span>
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#09090b]/40 backdrop-blur-md p-6 relative overflow-hidden">
          <div className="absolute right-3 top-3 h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400">
            <FileText className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Resumes</span>
          <span className="text-4xl font-black text-white block mt-2">{totalResumes}</span>
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#09090b]/40 backdrop-blur-md p-6 relative overflow-hidden">
          <div className="absolute right-3 top-3 h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400">
            <Activity className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Reports Generated</span>
          <span className="text-4xl font-black text-white block mt-2">{totalReports}</span>
        </div>
      </div>

      {/* Recent activity logs */}
      <div className="rounded-2xl border border-white/5 bg-[#09090b]/40 backdrop-blur-md p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Global Platform Activity Logs</h3>
        {recentUsages.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4">No recent usage log entries found.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {recentUsages.map((usage) => (
              <div key={usage.id} className="py-3.5 flex flex-wrap justify-between items-center gap-4">
                <div className="min-w-0">
                  <span className="text-xs font-bold text-indigo-400 block uppercase tracking-wider">{usage.type}</span>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    User: {usage.user.name} ({usage.user.email})
                  </p>
                </div>
                <span className="text-xs font-medium text-slate-500 shrink-0">
                  {new Date(usage.createdAt).toLocaleString("en-US")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
