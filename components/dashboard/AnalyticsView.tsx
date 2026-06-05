"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Play, 
  ArrowRight, 
  TrendingUp,
  Brain,
  History,
  Flame,
  Target,
  Trophy,
  CheckCircle2,
  Lock,
  FileText,
  MessageSquare,
  AlertTriangle,
  Briefcase,
  Zap,
  Clock,
  Calendar,
  BarChart,
  Compass,
  MapPin,
  ListTodo
} from "lucide-react";
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  Radar, 
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { formatPercentage } from "@/lib/format";

interface RecentInterviewItem {
  id: string;
  jobTitle: string;
  interviewType: string;
  status: string;
  createdAt: Date;
  difficulty: string;
  report?: {
    overallScore: number;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    skillBreakdown: Record<string, number | string | undefined>;
  } | null;
}

interface AnalyticsViewProps {
  stats: {
    completedInterviewsCount: number;
    streakCount: number;
    avgScore: number;
    bestAtsScore: number;
    weeklyImprovement: number | null;
    topSkills: string[];
    weakAreas: { skill: string; advice: string }[];
    resumeMatch: {
      score: number | null;
      missingSkills: string[];
      strongSkills: string[];
    };
  };
  coachData: {
    latestInterview: RecentInterviewItem | null;
    latestDurationMins: number;
    previousInterview: RecentInterviewItem | null;
    scoreImprovement: number | null;
    mostImprovedSkill: string | null;
    weakestOverallSkill: string | null;
  };
  recentInterviews: RecentInterviewItem[];
  historicalScores: { date: string; Score: number }[];
  skillData: { name: string; Score: number }[];
}

export default function AnalyticsView({ stats, coachData, recentInterviews, historicalScores, skillData }: AnalyticsViewProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setTimeout(() => setIsMounted(true), 0);
  }, []);

  if (!isMounted) {
    return <div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // -------------------------------------------------------------
  // STATE 0: 0 INTERVIEWS
  // -------------------------------------------------------------
  if (stats.completedInterviewsCount === 0) {
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={itemVariants} className="glass p-12 rounded-3xl border border-white/10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          <div className="inline-flex p-4 bg-primary/10 rounded-2xl mb-6">
            <Brain className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Welcome to your Personal AI Coach</h2>
          <p className="text-slate-400 max-w-lg mx-auto mb-8">
            Complete your first mock interview to unlock your personalized strengths, weaknesses, and a custom path to getting hired.
          </p>

          <div className="max-w-md mx-auto space-y-4">
            <Link href="/dashboard/resumes" className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] hover:bg-white/5 border border-white/5 transition-all group">
              <FileText className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
              <span className="text-sm font-medium text-slate-300 group-hover:text-white">Step 1: Upload your resume</span>
            </Link>
            <Link href="/interview" className="flex items-center gap-3 p-4 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/30 transition-all group">
              <Brain className="w-5 h-5 text-primary" />
              <span className="text-sm font-bold text-white">Step 2: Start your first interview</span>
              <ArrowRight className="w-4 h-4 text-primary ml-auto" />
            </Link>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Common properties
  const latest = coachData.latestInterview;
  const rep = latest?.report;

  // Determine Confidence Level
  let confidenceLevel = "LOW";
  let confidenceColor = "text-red-400";
  let confidenceBg = "bg-red-400/10";
  if (stats.completedInterviewsCount === 2) {
    confidenceLevel = "MEDIUM";
    confidenceColor = "text-yellow-400";
    confidenceBg = "bg-yellow-400/10";
  } else if (stats.completedInterviewsCount >= 3) {
    confidenceLevel = "HIGH";
    confidenceColor = "text-green-400";
    confidenceBg = "bg-green-400/10";
  }

  // Calculate Path To 90+
  const currentScore = rep?.overallScore || stats.avgScore;
  const targetScore = 90;
  const estimatedInterviewsTo90 = currentScore >= 90 ? 0 : Math.max(1, Math.ceil((90 - currentScore) / 4));

  // Determine next action suggestion based on weaknesses
  let nextInterviewType = "Technical Interview";
  let nextReason = "General practice needed to build baseline skills.";
  if (rep?.weaknesses && rep.weaknesses.length > 0) {
    const topWeak = rep.weaknesses[0].toLowerCase();
    if (topWeak.includes("sql") || topWeak.includes("database")) {
      nextInterviewType = "Backend Technical Interview";
      nextReason = "SQL and Database weaknesses detected in the latest session.";
    } else if (topWeak.includes("system") || topWeak.includes("api")) {
      nextInterviewType = "System Design Interview";
      nextReason = "API Design and System Architecture improvements needed.";
    } else if (topWeak.includes("communication") || topWeak.includes("behavior")) {
      nextInterviewType = "HR / Behavioral Interview";
      nextReason = "Communication and structuring (STAR method) need refinement.";
    } else {
      nextInterviewType = `${rep.weaknesses[0]} Focused Interview`;
      nextReason = `${rep.weaknesses[0]} was identified as a core weakness.`;
    }
  }

  // Circular Progress Calculation
  const readinessRadius = 40;
  const readinessCircumference = 2 * Math.PI * readinessRadius;
  const readinessOffset = readinessCircumference - (stats.avgScore / 100) * readinessCircumference;

  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="show">
      
      {/* GLOBAL HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" /> Personal AI Coach
          </h2>
          <p className="text-slate-400 text-sm mt-1">What you should do next to get hired.</p>
        </div>
        <div className={`mt-4 sm:mt-0 flex items-center gap-2 px-3 py-1.5 rounded-lg border ${confidenceBg.replace('10', '20')} ${confidenceBg}`}>
          <BarChart className={`w-4 h-4 ${confidenceColor}`} />
          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-300">
            Insights Confidence: <span className={confidenceColor}>{confidenceLevel}</span>
          </span>
          <span className="text-xs text-slate-500 font-medium ml-1">({stats.completedInterviewsCount} Interviews)</span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* STATE 1+: COACHING OVERVIEW */}
      {/* ------------------------------------------------------------- */}
      
      {latest && rep && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* SECTION 1: INTERVIEW RESULT */}
          <motion.div variants={itemVariants} className="lg:col-span-1 glass rounded-2xl border border-white/5 p-6 flex flex-col">
            <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4 flex items-center gap-2">
              <History className="w-3 h-3 text-primary" /> Latest Result
            </h3>
            
            <div className="flex items-end gap-3 mb-6">
              <span className="text-5xl font-black text-white leading-none">{rep.overallScore}</span>
              <span className="text-sm text-slate-500 font-bold pb-1">/ 100</span>
            </div>

            <div className="space-y-4 flex-1">
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-xs text-slate-400 font-medium">Type</span>
                <span className="text-xs font-bold text-white bg-white/5 px-2 py-1 rounded-md">{latest.interviewType.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-xs text-slate-400 font-medium">Difficulty</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                  latest.difficulty === 'HARD' ? 'bg-red-500/20 text-red-400' : 
                  latest.difficulty === 'EASY' ? 'bg-green-500/20 text-green-400' : 
                  'bg-yellow-500/20 text-yellow-400'
                }`}>{latest.difficulty}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-xs text-slate-400 font-medium">Technical Score</span>
                <span className="text-xs font-bold text-white">{rep.skillBreakdown?.technical || rep.skillBreakdown?.['Technical Knowledge'] || 0}/100</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-xs text-slate-400 font-medium">Communication</span>
                <span className="text-xs font-bold text-white">{rep.skillBreakdown?.communication || rep.skillBreakdown?.['Communication'] || 0}/100</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-xs text-slate-400 font-medium">Problem Solving</span>
                <span className="text-xs font-bold text-white">{rep.skillBreakdown?.problemSolving || rep.skillBreakdown?.['Problem Solving'] || 0}/100</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-xs text-slate-400 font-medium">Duration</span>
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" /> {coachData.latestDurationMins} min
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-xs text-slate-400 font-medium">Date</span>
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" /> 
                  {new Date(latest.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            </div>
            
            <Link href={`/interview/${latest.id}`} className="mt-4 w-full py-2.5 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary text-xs font-bold rounded-xl transition-all text-center">
              Review Full Session
            </Link>
          </motion.div>

          {/* SECTION 2, 3, 4: AI COACH SUMMARY & STRENGTHS/WEAKNESSES */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            
            <div className="glass rounded-2xl border border-primary/20 bg-primary/5 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Brain className="w-32 h-32 text-primary" />
              </div>
              <h3 className="text-[10px] uppercase tracking-widest text-primary font-bold mb-3 flex items-center gap-2">
                <MessageSquare className="w-3 h-3" /> AI Coach Summary
              </h3>
              <ul className="space-y-3 relative z-10">
                {rep.strengths.slice(0, 2).map((str, i) => (
                  <li key={`str-${i}`} className="flex items-start gap-2 text-sm text-slate-200 font-medium">
                    <span className="text-green-400 font-bold shrink-0">•</span> {str}
                  </li>
                ))}
                {rep.weaknesses.slice(0, 2).map((weak, i) => (
                  <li key={`weak-${i}`} className="flex items-start gap-2 text-sm text-slate-200 font-medium">
                    <span className="text-orange-400 font-bold shrink-0">•</span> {weak}
                  </li>
                ))}
                <li className="flex items-start gap-2 text-sm text-white font-bold mt-2">
                  <span className="text-primary font-bold shrink-0">•</span> Focus next on {rep.weaknesses[0] || "core concepts"}.
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="glass rounded-2xl border border-white/5 p-6">
                <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4 flex items-center gap-2">
                  <Trophy className="w-3 h-3 text-green-500" /> Top Strengths
                </h3>
                <ul className="space-y-3">
                  {rep.strengths.slice(0, 4).map((str, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs font-medium text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      {str}
                    </li>
                  ))}
                  {(!rep.strengths || rep.strengths.length === 0) && (
                    <li className="text-xs text-slate-500 italic">None explicitly identified yet.</li>
                  )}
                </ul>
              </div>

              <div className="glass rounded-2xl border border-white/5 p-6">
                <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3 text-orange-500" /> Improvement Areas
                </h3>
                <ul className="space-y-3">
                  {rep.weaknesses.slice(0, 4).map((weak, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs font-medium text-slate-300">
                      <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
                      {weak}
                    </li>
                  ))}
                  {(!rep.weaknesses || rep.weaknesses.length === 0) && (
                    <li className="text-xs text-slate-500 italic">None explicitly identified yet.</li>
                  )}
                </ul>
              </div>
            </div>

          </motion.div>
        </div>
      )}

      {/* SECTION 5: NEXT RECOMMENDED ACTIONS & ROADMAP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Next Recommended Actions */}
        <motion.div variants={itemVariants} className="glass rounded-2xl border border-white/5 p-6">
          <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-primary" /> Next Recommended Actions
          </h3>
          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <span className="text-xs font-black text-primary">1</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">{nextInterviewType}</h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">Reason: {nextReason}</p>
                <Link href="/interview" className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1">
                  Start Session <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
            
            {rep?.weaknesses && rep.weaknesses.length > 1 && (
              <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  <span className="text-xs font-black text-slate-400">2</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">{rep.weaknesses[1]} Practice Round</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">Reason: Detected gaps in {rep.weaknesses[1].toLowerCase()} concepts.</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Path To 90+ Roadmap */}
        <motion.div variants={itemVariants} className="glass rounded-2xl border border-white/5 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <Compass className="w-40 h-40 text-primary" />
          </div>
          <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-400" /> Your Path To 90+
          </h3>
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="text-center">
              <span className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Current</span>
              <div className="w-16 h-16 rounded-full border-4 border-slate-700 flex items-center justify-center bg-black">
                <span className="text-xl font-black text-white">{currentScore}</span>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col items-center px-4">
              <div className="w-full h-1 bg-white/10 rounded-full relative">
                <div className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all" style={{ width: `${(currentScore / targetScore) * 100}%` }}></div>
              </div>
            </div>

            <div className="text-center">
              <span className="block text-[10px] uppercase tracking-widest text-primary font-bold mb-2">Target</span>
              <div className="w-16 h-16 rounded-full border-4 border-primary flex items-center justify-center bg-primary/20 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                <span className="text-xl font-black text-primary">{targetScore}</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 bg-black/40 rounded-xl p-4 border border-white/5">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3">Recommended Study Topics</p>
            <div className="flex flex-wrap gap-2">
              {rep?.weaknesses?.slice(0,3).map((w, i) => (
                <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-slate-300">
                  {w}
                </span>
              ))}
              {(!rep?.weaknesses || rep.weaknesses.length === 0) && (
                <span className="text-xs text-slate-500">More data needed.</span>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* STATE 2+: COMPARISON MODULE */}
      {/* ------------------------------------------------------------- */}
      {stats.completedInterviewsCount >= 2 && coachData.previousInterview && coachData.scoreImprovement !== null && (
        <motion.div variants={itemVariants} className="glass rounded-2xl border border-white/5 p-6">
          <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" /> Progression Comparison
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Score Change</span>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-white">{coachData.previousInterview.report?.overallScore}</span>
                <ArrowRight className="w-4 h-4 text-slate-500 mb-2" />
                <span className="text-3xl font-black text-white">{latest?.report?.overallScore}</span>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Net Improvement</span>
              <span className={`text-3xl font-black ${coachData.scoreImprovement > 0 ? 'text-green-400' : coachData.scoreImprovement < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                {coachData.scoreImprovement > 0 ? `+${coachData.scoreImprovement}` : coachData.scoreImprovement}
              </span>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Most Improved</span>
              <span className="text-sm font-bold text-green-400 text-center">{coachData.mostImprovedSkill || "N/A"}</span>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Weakest Area</span>
              <span className="text-sm font-bold text-orange-400 text-center">{coachData.weakestOverallSkill || "N/A"}</span>
            </div>

          </div>
        </motion.div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* RESUME INTEGRATION (ATS) - ALWAYS SHOWN IF ATS DATA EXISTS */}
      {/* ------------------------------------------------------------- */}
      {stats.resumeMatch.score !== null && (
        <motion.div variants={itemVariants} className="glass rounded-2xl border border-white/5 p-6">
          <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" /> Resume Analysis & ATS Match
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/[0.02] rounded-xl border border-white/5 flex flex-col items-center justify-center p-6">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 text-center">Match Score</span>
              <span className="text-5xl font-black text-white leading-none">{stats.resumeMatch.score}%</span>
            </div>
            <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-5">
              <p className="text-[10px] uppercase tracking-widest text-green-500 font-bold mb-3">Strong Skills (Detected)</p>
              <ul className="space-y-2">
                {stats.resumeMatch.strongSkills.slice(0, 4).map((s, i) => (
                  <li key={i} className="text-xs font-medium text-slate-300 flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" /> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-5">
              <p className="text-[10px] uppercase tracking-widest text-red-500 font-bold mb-3">Missing Skills (Required)</p>
              <ul className="space-y-2">
                {stats.resumeMatch.missingSkills.slice(0, 4).map((s, i) => (
                  <li key={i} className="text-xs font-medium text-slate-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span> {s}
                  </li>
                ))}
                {stats.resumeMatch.missingSkills.length === 0 && <li className="text-xs text-slate-500 italic">Excellent match!</li>}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STATE 3+: ADVANCED ANALYTICS (RADAR, TREND, BREAKDOWN) */}
      {/* ------------------------------------------------------------- */}
      {stats.completedInterviewsCount >= 3 && (
        <>
          <div className="flex items-center gap-4 py-4">
            <div className="h-px bg-white/10 flex-1"></div>
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Advanced Analytics Unlocked</span>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div variants={itemVariants} className="glass rounded-2xl border border-white/5 p-6 flex flex-col items-center justify-center">
              <h3 className="absolute top-6 left-6 text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" /> Overall Readiness
              </h3>
              <div className="relative w-32 h-32 mt-8">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r={readinessRadius} stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/5" />
                  <motion.circle cx="64" cy="64" r={readinessRadius} stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={readinessCircumference} initial={{ strokeDashoffset: readinessCircumference }} animate={{ strokeDashoffset: readinessOffset }} transition={{ duration: 1.5, ease: "easeOut" }} className="text-primary" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white leading-none">{stats.avgScore}%</span>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="glass rounded-2xl border border-white/5 p-6 lg:col-span-2">
              <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" /> Skill Heatmap Breakdown
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                {skillData.map((skill, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-slate-300">{skill.name}</span>
                      <span className="text-xs font-black text-white">{skill.Score}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000" 
                        style={{ 
                          width: `${skill.Score}%`,
                          backgroundColor: skill.Score > 80 ? '#22c55e' : skill.Score > 60 ? '#eab308' : '#f97316'
                        }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={itemVariants} className="glass rounded-2xl border border-white/5 p-6">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" /> Skill Radar Profile
              </h3>
              <div className="h-56 w-full -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillData.slice(0, 5)}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111118', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                    <Radar name="Score" dataKey="Score" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="glass rounded-2xl border border-white/5 p-6">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Historical Trend
              </h3>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalScores}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} dx={-10} domain={['dataMin - 10', 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111118', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                      labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px' }}
                    />
                    <Line type="monotone" dataKey="Score" stroke="#8B5CF6" strokeWidth={3} dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4, stroke: '#111118' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </>
      )}

    </motion.div>
  );
}
