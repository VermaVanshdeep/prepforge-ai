"use client";

import { useState, useEffect } from "react";
import { 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  PlusCircle, 
  Briefcase, 
  BookOpen, 
  Award,
  TrendingUp,
  RefreshCw,
  FolderKanban
} from "lucide-react";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { analyzeATSAction } from "@/actions/resume";

interface ExperienceItem {
  company: string;
  role: string;
  duration: string;
  description: string;
}

interface EducationItem {
  institution: string;
  degree: string;
  field: string;
  year: string;
}

interface ProjectItem {
  name: string;
  technologies: string[];
  description: string;
}

interface ResumeAnalysisViewProps {
  analysis: {
    id: string;
    resumeId: string;
    skills: string[];
    experience: any;
    education: any;
    projects: any;
    certifications: string[];
    summary: string;
    resume: {
      name: string;
    };
  };
}

export default function ResumeAnalysisView({ analysis }: ResumeAnalysisViewProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "experience" | "projects" | "education">("summary");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  
  // ATS Result states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [atsResult, setAtsResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Hydration guard for Recharts
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const experience: ExperienceItem[] = Array.isArray(analysis.experience) ? analysis.experience : [];
  const education: EducationItem[] = Array.isArray(analysis.education) ? analysis.education : [];
  const projects: ProjectItem[] = Array.isArray(analysis.projects) ? analysis.projects : [];

  const handleATSCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !jobDescription) return;

    setIsAnalyzing(true);
    setErrorMessage("");
    setAtsResult(null);

    try {
      const res = await analyzeATSAction({
        resumeId: analysis.resumeId,
        jobTitle,
        jobDescription,
      });

      if (res.success && res.data) {
        setAtsResult(res.data);
      } else {
        setErrorMessage(res.error || "Failed to analyze job fit.");
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Recharts Gauge data format
  const chartData = atsResult ? [
    {
      name: "Score",
      value: atsResult.score,
      fill: atsResult.score >= 80 ? "#10b981" : atsResult.score >= 60 ? "#f59e0b" : "#f43f5e",
    }
  ] : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left 2 Cols: Resume analysis parser results */}
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-2xl border border-white/5 bg-[#09090b]/40 backdrop-blur-md overflow-hidden">
          {/* Header */}
          <div className="border-b border-white/5 p-6 bg-white/2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center">
                <FileText className="h-5.5 w-5.5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white">Parsed Resume Details</h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">File: {analysis.resume.name}</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/5 bg-slate-950/20 px-6 py-2 overflow-x-auto gap-4">
            {(["summary", "experience", "projects", "education"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
                  activeTab === tab 
                    ? "border-indigo-500 text-indigo-400" 
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          <div className="p-6 min-h-[300px]">
            {activeTab === "summary" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Professional Summary</h4>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">
                    {analysis.summary || "No summary available."}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Skills Extracted</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.skills.map((skill, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-slate-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {analysis.certifications.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Certifications</h4>
                    <ul className="space-y-2">
                      {analysis.certifications.map((cert, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-300">
                          <Award className="h-4 w-4 text-indigo-400 shrink-0" />
                          <span>{cert}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === "experience" && (
              <div className="space-y-6">
                {experience.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No experience record extracted.</p>
                ) : (
                  experience.map((exp, idx) => (
                    <div key={idx} className="border-l border-white/10 pl-4 py-1 relative space-y-2">
                      <div className="absolute h-2.5 w-2.5 rounded-full bg-indigo-500 -left-[5px] top-1.5" />
                      <div className="flex flex-wrap justify-between items-baseline gap-2">
                        <h4 className="text-sm font-bold text-white">{exp.role}</h4>
                        <span className="text-xs font-medium text-slate-500">{exp.duration}</span>
                      </div>
                      <p className="text-xs font-bold text-indigo-400">{exp.company}</p>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">{exp.description}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "projects" && (
              <div className="space-y-6">
                {projects.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No projects record extracted.</p>
                ) : (
                  projects.map((proj, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-white/5 bg-slate-950/20 space-y-3">
                      <div className="flex items-center gap-2">
                        <FolderKanban className="h-4.5 w-4.5 text-indigo-400" />
                        <h4 className="text-sm font-bold text-white">{proj.name}</h4>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">{proj.description}</p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {proj.technologies?.map((tech, tIdx) => (
                          <span 
                            key={tIdx} 
                            className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-600/10 text-indigo-400 border border-indigo-500/10"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "education" && (
              <div className="space-y-6">
                {education.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No education record extracted.</p>
                ) : (
                  education.map((edu, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <div className="h-9 w-9 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center shrink-0">
                        <BookOpen className="h-4.5 w-4.5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white">{edu.degree} in {edu.field}</h4>
                        <p className="text-xs text-indigo-400 font-semibold">{edu.institution}</p>
                        <p className="text-[10px] text-slate-500 font-medium">Graduation: {edu.year}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Col: ATS Matching Sandbox */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-white/5 bg-[#09090b]/40 backdrop-blur-md p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              ATS Job Description Comparator
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">
              Paste the target job details to evaluate how your resume scores against required roles.
            </p>
          </div>

          <form onSubmit={handleATSCompare} className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Job Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Frontend Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="px-4 py-3 border border-white/10 rounded-xl text-sm font-medium text-white bg-slate-950/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-md w-full placeholder-slate-600"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Job Requirements</label>
              <textarea
                required
                placeholder="Paste the job description keywords..."
                rows={6}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="px-4 py-3 border border-white/10 rounded-xl text-sm font-medium text-white bg-slate-950/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-md w-full placeholder-slate-600 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-500 transition-all disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                  <span>Comparing Core Layouts...</span>
                </>
              ) : (
                <>
                  <TrendingUp className="h-4.5 w-4.5" />
                  <span>Analyze ATS Fit</span>
                </>
              )}
            </button>
          </form>

          {errorMessage && (
            <p className="text-xs font-semibold text-rose-400">{errorMessage}</p>
          )}
        </div>

        {/* ATS Report results */}
        {atsResult && (
          <div className="rounded-2xl border border-white/5 bg-[#09090b]/40 backdrop-blur-md p-6 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-400" />
              Comparative ATS Report
            </h3>

            {/* Radial Match Score gauge */}
            {isMounted && (
              <div className="flex items-center justify-center h-32 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart 
                    cx="50%" 
                    cy="50%" 
                    innerRadius="70%" 
                    outerRadius="100%" 
                    barSize={10} 
                    data={chartData} 
                    startAngle={90} 
                    endAngle={-270}
                  >
                    <RadialBar background dataKey="value" />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white">{atsResult.score}%</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Match Score</span>
                </div>
              </div>
            )}

            {/* Feedback items */}
            <div className="space-y-4">
              {atsResult.missingSkills?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" />
                    Missing Critical Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {atsResult.missingSkills.map((sk: string, idx: number) => (
                      <span 
                        key={idx} 
                        className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/10 text-[10px] font-bold text-rose-400"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {atsResult.strengthAreas?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" />
                    Strength Anchors
                  </h4>
                  <ul className="space-y-1.5">
                    {atsResult.strengthAreas.map((str: string, idx: number) => (
                      <li key={idx} className="text-xs font-medium text-slate-300 flex gap-2">
                        <span className="text-emerald-400">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {atsResult.rawFeedback && (
                <div className="space-y-1 border-t border-white/5 pt-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Strategic Recommendation</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">{atsResult.rawFeedback}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
