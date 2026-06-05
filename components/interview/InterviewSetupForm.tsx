"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  Play,
  Trash2,
  AlertCircle
} from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { uploadAndAnalyzeResumeAction, deleteResumeAction } from "@/actions/resume";
import { createInterviewAction } from "@/actions/interview";

const interviewSetupSchema = z.object({
  resumeId: z.string().min(1, "Please select or upload a resume"),
  jobTitle: z.string().min(2, "Job title must be at least 2 characters"),
  jobDescription: z.string().min(10, "Job description must be at least 10 characters"),
  interviewType: z.enum(["TECHNICAL", "BEHAVIORAL", "HR", "SYSTEM_DESIGN", "MACHINE_LEARNING", "FRONTEND", "BACKEND"]),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  questionCount: z.number().min(3).max(20),
});

type FormValues = z.infer<typeof interviewSetupSchema>;

interface ResumeItem {
  id: string;
  name: string;
  createdAt: Date;
}

interface InterviewSetupFormProps {
  initialResumes: ResumeItem[];
}

export default function InterviewSetupForm({ initialResumes }: InterviewSetupFormProps) {
  const router = useRouter();
  const [resumes, setResumes] = useState<ResumeItem[]>(initialResumes);
  const [selectedResumeId, setSelectedResumeId] = useState<string>(
    initialResumes.length > 0 ? initialResumes[0].id : ""
  );
  
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(interviewSetupSchema),
    defaultValues: {
      resumeId: initialResumes.length > 0 ? initialResumes[0].id : "",
      jobTitle: "",
      jobDescription: "",
      interviewType: "TECHNICAL",
      difficulty: "MEDIUM",
      questionCount: 5,
    }
  });

  const watchResumeId = watch("resumeId");

  const { startUpload } = useUploadThing("resumeUploader", {
    onClientUploadComplete: async (res) => {
      if (res && res.length > 0) {
        console.log("Upload successful");
        const fileInfo = res[0];
        console.log("URL generated:", fileInfo.serverData.url);
        const result = await uploadAndAnalyzeResumeAction({
          name: fileInfo.name,
          url: fileInfo.serverData.url,
          fileKey: fileInfo.serverData.fileKey,
        });

        if (result.success && result.resumeId) {
          console.log("Resume saved", result.resumeId);
          const newResume = {
            id: result.resumeId,
            name: fileInfo.name,
            createdAt: new Date(),
          };
          setResumes((prev) => [newResume, ...prev]);
          setSelectedResumeId(result.resumeId);
          setValue("resumeId", result.resumeId, { shouldValidate: true });
        } else {
          setErrorMessage(result.error || "Failed to analyze resume.");
        }
      }
      setIsUploading(false);
    },
    onUploadError: (err) => {
      setIsUploading(false);
      setErrorMessage(err.message || "Failed to upload file.");
    },
    onUploadBegin: () => {
      console.log("Upload started");
      setIsUploading(true);
      setErrorMessage("");
    }
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        setErrorMessage("Only PDF resumes are supported.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("File exceeds 5MB limit.");
        return;
      }
      setIsUploading(true);
      await startUpload([file]);
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    if (confirm("Are you sure you want to delete this resume?")) {
      const res = await deleteResumeAction(resumeId);
      if (res.success) {
        setResumes((prev) => prev.filter((r) => r.id !== resumeId));
        if (selectedResumeId === resumeId) {
          const nextResume = resumes.find((r) => r.id !== resumeId);
          const nextId = nextResume ? nextResume.id : "";
          setSelectedResumeId(nextId);
          setValue("resumeId", nextId, { shouldValidate: true });
        }
      } else {
        alert(res.error || "Failed to delete resume.");
      }
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsGenerating(true);
    setErrorMessage("");
    try {
      const result = await createInterviewAction(data);
      if (result.success && result.interviewId) {
        router.push(`/interview/${result.interviewId}`);
      } else {
        setErrorMessage(result.error || "Failed to launch interview session.");
        setIsGenerating(false);
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred.");
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm font-semibold text-rose-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. Resume Select / Upload */}
      <div className="rounded-2xl border border-white/5 bg-[#09090b]/40 backdrop-blur-md p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-400 text-xs font-bold">1</span>
          Select or Upload Resume
        </h3>

        {resumes.length > 0 && (
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Choose from history</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {resumes.map((res) => {
                const isSelected = selectedResumeId === res.id;
                return (
                  <div
                    key={res.id}
                    onClick={() => {
                      setSelectedResumeId(res.id);
                      setValue("resumeId", res.id, { shouldValidate: true });
                    }}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected 
                        ? "border-indigo-500 bg-indigo-500/5" 
                        : "border-white/10 hover:border-white/20 bg-white/2"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className={`h-5 w-5 ${isSelected ? "text-indigo-400" : "text-slate-400"}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate max-w-[150px]">{res.name}</p>
                        <p className="text-xs text-slate-500 font-medium">{new Date(res.createdAt).toLocaleDateString("en-US")}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteResume(res.id);
                      }}
                      className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-rose-400 transition-colors"
                      title="Delete Resume"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {resumes.length > 0 ? "Or upload a new version (PDF only)" : "Upload resume (PDF only)"}
          </label>
          <div className="relative border border-dashed border-white/10 hover:border-white/20 bg-white/2 rounded-xl p-8 text-center cursor-pointer transition-all">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                <UploadCloud className={`h-5 w-5 ${isUploading ? "animate-bounce text-indigo-400" : ""}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {isUploading ? "Uploading & Analyzing..." : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1">PDF up to 5MB</p>
              </div>
            </div>
          </div>
        </div>
        {errors.resumeId && (
          <span className="text-xs font-semibold text-rose-400">{errors.resumeId.message}</span>
        )}
      </div>

      {/* 2. Target Job Description */}
      <div className="rounded-2xl border border-white/5 bg-[#09090b]/40 backdrop-blur-md p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-400 text-xs font-bold">2</span>
          Job Target Details
        </h3>

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Job Title</label>
            <input
              type="text"
              placeholder="e.g. Senior Frontend Engineer"
              {...register("jobTitle")}
              className="px-4 py-3 border border-white/10 rounded-xl text-sm font-medium text-white bg-slate-950/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-md w-full placeholder-slate-600"
            />
            {errors.jobTitle && (
              <span className="text-xs font-semibold text-rose-400">{errors.jobTitle.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Job Description / Requirements</label>
            <textarea
              placeholder="Paste the job description or requirements here..."
              rows={5}
              {...register("jobDescription")}
              className="px-4 py-3 border border-white/10 rounded-xl text-sm font-medium text-white bg-slate-950/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-md w-full placeholder-slate-600 resize-y"
            />
            {errors.jobDescription && (
              <span className="text-xs font-semibold text-rose-400">{errors.jobDescription.message}</span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Settings Configuration */}
      <div className="rounded-2xl border border-white/5 bg-[#09090b]/40 backdrop-blur-md p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-400 text-xs font-bold">3</span>
          Configure Format
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Interview Type</label>
            <select
              {...register("interviewType")}
              className="px-4 py-3 border border-white/10 rounded-xl text-sm font-medium text-white bg-slate-950/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-md w-full"
            >
              <option value="TECHNICAL">Technical Round</option>
              <option value="BEHAVIORAL">Behavioral Round</option>
              <option value="HR">HR Round</option>
              <option value="SYSTEM_DESIGN">System Design Round</option>
              <option value="MACHINE_LEARNING">Machine Learning Round</option>
              <option value="FRONTEND">Frontend Round</option>
              <option value="BACKEND">Backend Round</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Difficulty</label>
            <select
              {...register("difficulty")}
              className="px-4 py-3 border border-white/10 rounded-xl text-sm font-medium text-white bg-slate-950/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-md w-full"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Number of Questions</label>
            <select
              {...register("questionCount", { valueAsNumber: true })}
              className="px-4 py-3 border border-white/10 rounded-xl text-sm font-medium text-white bg-slate-950/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-md w-full"
            >
              <option value={5}>5 Questions (Standard)</option>
              <option value={10}>10 Questions (Comprehensive)</option>
              <option value={15}>15 Questions (Hardcore Loop)</option>
              <option value={20}>20 Questions (Extreme Marathon)</option>
            </select>
          </div>
        </div>
      </div>

      {/* CTA Launch */}
      <button
        type="submit"
        disabled={isGenerating || isUploading}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 text-base font-bold text-white hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <Sparkles className="h-5 w-5 animate-pulse" />
            <span>Generating Personalized Mock Interview...</span>
          </>
        ) : (
          <>
            <Play className="h-4.5 w-4.5" />
            <span>Generate AI Interview</span>
          </>
        )}
      </button>
    </form>
  );
}
