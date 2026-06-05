"use client";

import { useState, useEffect } from "react";
import { 
  History, 
  Award, 
  TrendingUp, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Layers,
  Sparkles,
  BookOpen,
  UserCheck
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  CartesianGrid, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from "recharts";

interface AnswerItem {
  text: string;
  codeAnswer: string | null;
  evaluation: { technicalAccuracy?: number; communication?: number; problemSolving?: number; confidence?: number; completeness?: number; relevance?: number; feedback?: string; idealAnswer?: string; };
}

interface QuestionItem {
  id: string;
  text: string;
  type: string;
  answers: AnswerItem[];
}

interface ReportItem {
  id: string;
  interviewId: string;
  overallScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  skillBreakdown: Record<string, number>;
  createdAt: Date;
  interview: {
    jobTitle: string;
    interviewType: string;
    difficulty: string;
    questions: QuestionItem[];
  };
}

interface ReportsViewProps {
  reports: ReportItem[];
}

export default function ReportsView({ reports }: ReportsViewProps) {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(
    reports.length > 0 && reports.length < 3 ? reports[0].id : null
  );
  
  // Hydration guard for Recharts
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setTimeout(() => setIsMounted(true), 0);
  }, []);

  const selectedReport = reports.find(r => r.id === selectedReportId);

  // 1. Skill Breakdown Data
  const skillData = selectedReport && typeof selectedReport.skillBreakdown === "object"
    ? Object.entries(selectedReport.skillBreakdown as Record<string, number>).map(([name, val]) => ({
        name,
        Score: val
      }))
    : [];

  // 2. Core Categories Averages across questions
  const coreCategoriesData = selectedReport
    ? (() => {
        let tech = 0, comm = 0, prob = 0, conf = 0, comp = 0, rel = 0;
        let count = 0;
        selectedReport.interview.questions.forEach((q) => {
          const ans = q.answers[0];
          if (ans && ans.evaluation) {
            const ev = ans.evaluation as unknown as { technicalAccuracy?: number; communication?: number; problemSolving?: number; confidence?: number; completeness?: number; relevance?: number; feedback?: string; idealAnswer?: string; };
            tech += ev.technicalAccuracy || 0;
            comm += ev.communication || 0;
            prob += ev.problemSolving || 0;
            conf += ev.confidence || 0;
            comp += ev.completeness || 0;
            rel += ev.relevance || 0;
            count++;
          }
        });
        if (count === 0) return [];
        return [
          { subject: "Accuracy", A: Math.round(tech / count), fullMark: 100 },
          { subject: "Communication", A: Math.round(comm / count), fullMark: 100 },
          { subject: "Problem Solving", A: Math.round(prob / count), fullMark: 100 },
          { subject: "Confidence", A: Math.round(conf / count), fullMark: 100 },
          { subject: "Completeness", A: Math.round(comp / count), fullMark: 100 },
          { subject: "Relevance", A: Math.round(rel / count), fullMark: 100 },
        ];
      })()
    : [];

  // 3. Interview trend logs (Chronological)
  const trendData = [...reports]
    .reverse()
    .map((r) => ({
      date: new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      Score: r.overallScore,
      Role: r.interview.jobTitle,
    }));

  if (selectedReport) {
    return (
      <div className="space-y-8">
        {/* Back button */}
        <button
          onClick={() => setSelectedReportId(null)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reports List
        </button>

        {/* Report Overview Header */}
        <div className="rounded-2xl border border-white/5 bg-[#09090b]/40 backdrop-blur-md p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Layers className="h-3 w-3" />
              {selectedReport.interview.interviewType} Round ({selectedReport.interview.difficulty})
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              {selectedReport.interview.jobTitle}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(selectedReport.createdAt).toLocaleDateString("en-US")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center md:text-right">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Readiness Score</span>
              <div className="flex items-baseline justify-center md:justify-end gap-1 mt-1">
                <span className="text-5xl font-black text-white">{selectedReport.overallScore}</span>
                <span className="text-sm font-bold text-slate-500">/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics charts segment */}
        {isMounted && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chart 1: Skill score breakdown */}
            <div className="rounded-2xl border border-white/5 bg-[#09090b]/40 backdrop-blur-md p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Skill Competency breakdown</h3>
              {skillData.length > 0 ? (
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={skillData} margin={{ left: -25, right: 10, top: 10, bottom: 5 }}>
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip contentStyle={{ background: "#09090b", borderColor: "#1e293b", borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="Score" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-8 text-center">No skill breakdown metrics available.</p>
              )}
            </div>

            {/* Chart 2: Category Radar */}
            <div className="rounded-2xl border border-white/5 bg-[#09090b]/40 backdrop-blur-md p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Performance Dimensions</h3>
              {coreCategoriesData.length > 0 ? (
                <div className="h-56 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={coreCategoriesData}>
                      <PolarGrid stroke="#1e293b" />
                      <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={10} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748b" fontSize={8} />
                      <Radar name="Candidate" dataKey="A" stroke="#818cf8" fill="#6366f1" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-8 text-center">No dimension metrics computed.</p>
              )}
            </div>
          </div>
        )}

        {/* Detailed Feedback Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Summary, Strengths, Weaknesses */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-white/5 bg-[#09090b]/40 backdrop-blur-md p-6 space-y-4">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                AI Evaluation Summary
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                {selectedReport.summary}
              </p>
            </div>

            {/* Recommendations block */}
            {selectedReport.recommendations?.length > 0 && (
              <div className="rounded-2xl border border-white/5 bg-[#09090b]/40 backdrop-blur-md p-6 space-y-4">
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-indigo-400" />
                  Custom Study Plan & Recommendations
                </h2>
                <ul className="space-y-3">
                  {selectedReport.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex gap-2.5 text-xs text-slate-300 leading-relaxed font-medium">
                      <span className="text-indigo-400 font-bold shrink-0">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Questions breakdown */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 px-2">
                <BookOpen className="h-5 w-5 text-indigo-400" />
                Question-by-Question Analysis
              </h2>

              {selectedReport.interview.questions.length === 0 ? (
                <p className="text-sm text-slate-500 italic pl-2">No detailed questions compiled.</p>
              ) : (
                selectedReport.interview.questions.map((q, index) => {
                  const ans = q.answers[0];
                  const ev = ans?.evaluation as unknown as { overallScore?: number; technicalAccuracy?: number; communication?: number; problemSolving?: number; confidence?: number; completeness?: number; relevance?: number; feedback?: string; idealAnswer?: string; };
                  return (
                    <div key={q.id} className="rounded-2xl border border-white/5 bg-[#09090b]/40 backdrop-blur-md overflow-hidden">
                      <div className="bg-white/2 border-b border-white/5 p-5 flex justify-between items-start gap-4">
                        <div>
                          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Question {index + 1} ({q.type})</span>
                          <p className="text-base font-bold text-white mt-1 leading-relaxed">{q.text}</p>
                        </div>
                        {ev && (
                          <div className="bg-white/5 px-3.5 py-1.5 rounded-xl border border-white/10 text-center shrink-0">
                            <span className="text-xs font-bold text-slate-400 block uppercase">Score</span>
                            <span className="text-lg font-black text-white">{ev.overallScore || 0}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-6 space-y-5">
                        {ans?.text && (
                          <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">YOUR RESPONSE</h4>
                            <p className="text-sm text-slate-300 mt-2 leading-relaxed bg-slate-950/20 p-4 rounded-xl border border-white/5">
                              {ans.text}
                            </p>
                          </div>
                        )}

                        {ans?.codeAnswer && (
                          <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">CODE SUBMISSION</h4>
                            <pre className="text-xs mt-2 p-4 rounded-xl bg-slate-950/40 border border-white/5 text-slate-300 overflow-x-auto font-mono">
                              <code>{ans.codeAnswer}</code>
                            </pre>
                          </div>
                        )}

                        {ev?.feedback && (
                          <div>
                            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">AI EVALUATION</h4>
                            <p className="text-sm text-slate-300 mt-2 leading-relaxed font-medium">
                              {ev.feedback}
                            </p>
                          </div>
                        )}

                        {ev?.idealAnswer && (
                          <div className="border-t border-white/5 pt-4">
                            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">IDEAL ANSWER SUGGESTION</h4>
                            <p className="text-sm text-slate-300 mt-2 leading-relaxed font-medium italic">
                              {ev.idealAnswer}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Strengths & Weaknesses Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-emerald-500/10 bg-[#09090b]/40 backdrop-blur-md p-6 space-y-4">
              <h3 className="text-sm font-bold text-emerald-400 tracking-wider uppercase flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5" />
                Key Strengths
              </h3>
              <ul className="space-y-3">
                {selectedReport.strengths.map((str, idx) => (
                  <li key={idx} className="flex gap-2.5 text-xs text-slate-300 leading-relaxed font-medium">
                    <span className="text-emerald-500 font-bold shrink-0">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-rose-500/10 bg-[#09090b]/40 backdrop-blur-md p-6 space-y-4">
              <h3 className="text-sm font-bold text-rose-400 tracking-wider uppercase flex items-center gap-2">
                <AlertTriangle className="h-4.5 w-4.5" />
                Areas to Improve
              </h3>
              <ul className="space-y-3">
                {selectedReport.weaknesses.map((weak, idx) => (
                  <li key={idx} className="flex gap-2.5 text-xs text-slate-300 leading-relaxed font-medium">
                    <span className="text-rose-500 font-bold shrink-0">•</span>
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Evaluation Reports</h1>
        <p className="text-slate-400 mt-1 font-medium text-sm">
          Review detailed evaluation summaries, scores, and suggested answers from your practice mock rounds.
        </p>
      </div>

      {isMounted && reports.length >= 3 && (
        <div className="rounded-2xl border border-white/5 bg-[#09090b]/40 backdrop-blur-md p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Overall Score Velocity</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ left: -25, right: 10, top: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ background: "#09090b", borderColor: "#1e293b", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="Score" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: "#6366f1", strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-white/5 bg-[#09090b]/40 backdrop-blur-md overflow-hidden">
        {reports.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-medium italic">
            You haven&apos;t completed any mock interviews yet. Launch one from the Setup tab!
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {reports.map((report) => (
              <div
                key={report.id}
                onClick={() => setSelectedReportId(report.id)}
                className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-white/2 transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-slate-400 border border-white/10 uppercase">
                      {report.interview.interviewType}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {new Date(report.createdAt).toLocaleDateString("en-US")}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {report.interview.jobTitle}
                  </h3>
                  <p className="text-xs font-medium text-slate-500">Difficulty: {report.interview.difficulty}</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Ready Score</span>
                    <div className="flex items-baseline gap-0.5 mt-0.5">
                      <span className="text-2xl font-black text-white">{report.overallScore}</span>
                      <span className="text-[10px] font-bold text-slate-500">/100</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
