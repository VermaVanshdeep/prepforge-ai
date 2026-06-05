"use client";

import { useState } from "react";
import { 
  User, 
  Mail, 
  Briefcase, 
  FileText, 
  Trash2, 
  Save, 
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  History,
  Award
} from "lucide-react";
import { updateProfile } from "@/actions/profile";
import { deleteResumeAction } from "@/actions/resume";
import Link from "next/link";

interface ResumeItem {
  id: string;
  name: string;
  url: string;
  createdAt: Date;
}

interface InterviewItem {
  id: string;
  jobTitle: string;
  interviewType: string;
  difficulty: string;
  status: string;
  createdAt: Date;
  report?: {
    overallScore: number;
  } | null;
}

interface ProfileViewProps {
  user: {
    name: string;
    email: string;
  };
  resumes: ResumeItem[];
  interviews: InterviewItem[];
}

export default function ProfileView({ user, resumes: initialResumes, interviews }: ProfileViewProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [resumes, setResumes] = useState<ResumeItem[]>(initialResumes);

  // Status indicators
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage("");
    setSaveSuccess(false);

    try {
      const res = await updateProfile({ name, email });
      if (res.success) {
        setSaveSuccess(true);
      } else {
        setErrorMessage(res.error || "Failed to update settings.");
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    if (confirm("Are you sure you want to delete this resume? All associated ATS analysis records will be permanently lost.")) {
      try {
        const res = await deleteResumeAction(resumeId);
        if (res.success) {
          setResumes(prev => prev.filter(r => r.id !== resumeId));
        } else {
          alert(res.error || "Failed to delete resume.");
        }
      } catch (err) {
        alert("An error occurred while deleting resume.");
      }
    }
  };

  const inputClass = "px-4 py-3 border border-white/10 rounded-xl text-sm font-medium text-white bg-slate-950/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-md w-full placeholder-slate-600";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Profile & Settings</h1>
        <p className="text-slate-400 mt-1 font-medium text-sm">
          Manage your personal details and review your mock practice history logs.
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm font-semibold text-rose-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side: Profile Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border border-white/5 bg-[#09090b]/40 backdrop-blur-md p-6 space-y-6">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-400" />
              Account Settings
            </h2>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                    <User className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`${inputClass} pl-11`}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                    <Mail className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`${inputClass} pl-11`}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/5">
                {saveSuccess ? (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 animate-pulse">
                    <CheckCircle2 className="h-4.5 w-4.5" />
                    Changes saved successfully!
                  </span>
                ) : <span />}

                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Interview History list */}
          <div className="rounded-2xl border border-white/5 bg-[#09090b]/40 backdrop-blur-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <History className="h-5 w-5 text-indigo-400" />
              Interview Sessions History
            </h2>

            {interviews.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No interview sessions generated yet.</p>
            ) : (
              <div className="divide-y divide-white/5">
                {interviews.map((int) => (
                  <div key={int.id} className="py-3.5 flex justify-between items-center gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-white">{int.jobTitle}</h4>
                      <p className="text-xs text-slate-500 font-semibold uppercase mt-0.5">
                        {int.interviewType} • {int.difficulty} • {new Date(int.createdAt).toLocaleDateString("en-US")}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      {int.report?.overallScore ? (
                        <div className="flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/10 px-2.5 py-1 rounded-lg text-indigo-400 text-xs font-bold">
                          <Award className="h-3.5 w-3.5" />
                          <span>Score: {int.report.overallScore}%</span>
                        </div>
                      ) : (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          int.status === "COMPLETED" 
                            ? "bg-emerald-500/10 text-emerald-400" 
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/10"
                        }`}>
                          {int.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Resumes list */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/5 bg-[#09090b]/40 backdrop-blur-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-400" />
              Saved Resumes
            </h2>

            <div className="flex flex-col gap-3.5">
              {resumes.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No resumes uploaded yet.</p>
              ) : (
                resumes.map((res) => (
                  <div key={res.id} className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-slate-950/20">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                      <div className="min-w-0">
                        <a 
                          href={res.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-xs font-semibold text-white hover:text-indigo-400 transition-colors truncate block max-w-[120px]"
                        >
                          {res.name}
                        </a>
                        <p className="text-[10px] text-slate-500 font-medium">{new Date(res.createdAt).toLocaleDateString("en-US")}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteResume(res.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-rose-400 transition-colors"
                      title="Delete Resume"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-white/5 pt-4">
              <Link 
                href="/interview" 
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition-all"
              >
                <UploadCloud className="h-4.5 w-4.5 text-indigo-400" />
                Upload New Version
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
