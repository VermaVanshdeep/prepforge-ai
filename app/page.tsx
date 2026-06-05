"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Brain,
  Sparkles, 
  UploadCloud, 
  Mic, 
  LineChart, 
  ShieldCheck, 
  Check, 
  HelpCircle, 
  ArrowRight,
  Play
} from "lucide-react";

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const features = [
    {
      title: "AI-Powered Questioning",
      description: "Custom questions generated dynamically based on your uploaded resume and target job description.",
      icon: <Sparkles className="h-6 w-6 text-primary" />
    },
    {
      title: "Interactive Voice Practice",
      description: "Talk to our AI interviewer in real-time. Practice answering verbally to build speech confidence.",
      icon: <Mic className="h-6 w-6 text-primary" />
    },
    {
      title: "Granular Performance Reports",
      description: "Receive AI-driven feedback, score breakdowns, strengths/weaknesses, and suggested answers.",
      icon: <LineChart className="h-6 w-6 text-primary" />
    },
    {
      title: "Industry Specific Tuning",
      description: "Optimized prompts for Software Engineering, Product Management, Sales, Marketing, and HR roles.",
      icon: <ShieldCheck className="h-6 w-6 text-primary" />
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Upload & Customize",
      description: "Drop your PDF resume and paste the job description you are targeting. Our AI maps the core skills required."
    },
    {
      number: "02",
      title: "Simulate & Practice",
      description: "Engage in a live, timed mock interview. Speak your answers or write code in our premium integrated editor."
    },
    {
      number: "03",
      title: "Review & Improve",
      description: "Get immediate, deep analytics on your performance. Identify weak points before your actual interview."
    }
  ];

  const faqs = [
    {
      q: "How does PrepForge generate questions?",
      a: "PrepForge uses advanced LLMs (like Gemini/GPT) analyzing the overlap and gaps between your resume and the target job description to create highly realistic, company-specific questions."
    },
    {
      q: "Can I practice coding and behavioral questions?",
      a: "Yes! The platform supports text, verbal (speech-to-text), and coding questions complete with an integrated code editor and execution sandbox."
    },
    {
      q: "Is speech-to-text supported?",
      a: "Yes! PrepForge uses advanced speech-to-text technology to transcribe your spoken answers. This lets you practice speaking naturally, helping you work on your pacing, tone, and delivery."
    },
    {
      q: "What programming languages are supported?",
      a: "Currently, we support JavaScript, Python, Java, C++, and Go for integrated coding challenges."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 },
    },
  };

  return (
    <div className="min-h-screen bg-[#09090b] selection:bg-primary/30 text-slate-300">
      
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none mix-blend-screen" />
          <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-purple-600/10 rounded-full blur-[128px] pointer-events-none mix-blend-screen" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        </div>

        <motion.div 
          className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>AI-native Mock Interviews</span>
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white mb-8 leading-tight"
          >
            Forge Your <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-indigo-300">
              Next Offer.
            </span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="mx-auto max-w-2xl text-lg sm:text-xl text-slate-400 mb-10 leading-relaxed"
          >
            AI-powered interview preparation tailored to your resume and dream role. 
            Simulate real conditions, receive instant granular feedback, and eliminate interview anxiety.
          </motion.p>
          
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              href="/auth/register" 
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
            >
              Start Free
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <Link 
              href="#demo" 
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-sm font-bold text-white bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-all"
            >
              <Play className="mr-2 w-4 h-4 text-slate-400" />
              Watch Demo
            </Link>
          </motion.div>
        </motion.div>
        
        {/* Floating Abstract Cards (Mockup) */}
        <div className="relative mt-20 max-w-5xl mx-auto px-4 hidden md:block">
           <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
              className="relative rounded-2xl border border-white/10 bg-[#111118]/80 backdrop-blur-xl shadow-2xl overflow-hidden aspect-video"
           >
              {/* Fake Top Bar */}
              <div className="h-12 border-b border-white/5 flex items-center px-4 gap-2 bg-white/[0.02]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="mx-auto w-64 h-6 rounded-md bg-white/5" />
              </div>
              <div className="p-8 flex gap-8 h-full">
                 <div className="w-1/3 flex flex-col gap-4">
                    <div className="h-32 rounded-xl bg-white/5 border border-white/10 p-4">
                       <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                         <Brain className="w-4 h-4 text-primary" />
                       </div>
                       <div className="w-3/4 h-3 bg-white/10 rounded-full mb-2" />
                       <div className="w-1/2 h-3 bg-white/10 rounded-full" />
                    </div>
                    <div className="h-24 rounded-xl bg-white/5 border border-white/10 p-4">
                       <div className="w-full h-3 bg-white/10 rounded-full mb-2" />
                       <div className="w-5/6 h-3 bg-white/10 rounded-full mb-2" />
                       <div className="w-4/6 h-3 bg-white/10 rounded-full" />
                    </div>
                 </div>
                 <div className="w-2/3 flex flex-col gap-4">
                   <div className="w-full h-full rounded-xl bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 flex items-center justify-center">
                     <div className="text-center">
                        <div className="inline-block p-4 rounded-full bg-primary/10 border border-primary/20 mb-4">
                           <Mic className="w-8 h-8 text-primary" />
                        </div>
                        <div className="w-32 h-4 bg-white/10 rounded-full mx-auto" />
                     </div>
                   </div>
                 </div>
              </div>
           </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 border-t border-white/5 relative z-10 bg-[#0c0c11]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Everything you need to succeed
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              PrepForge provides an end-to-end simulation environment. Prepare under pressure so the real thing feels effortless.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative rounded-2xl border border-white/5 bg-[#111118]/50 p-6 hover:bg-[#111118] transition-colors"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="py-24 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl mb-6">
                How PrepForge Works
              </h2>
              <p className="text-lg text-slate-400 mb-10">
                It takes less than a minute to setup your first custom mock interview.
              </p>
              
              <div className="space-y-8">
                {steps.map((step, i) => (
                  <motion.div 
                    key={i} 
                    className="flex gap-4 group"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-sm border border-primary/30 group-hover:bg-primary group-hover:text-white transition-colors">
                        {step.number}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                      <p className="text-slate-400">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <motion.div 
              className="relative rounded-2xl border border-white/5 bg-gradient-to-br from-[#111118] to-[#09090b] aspect-square flex items-center justify-center overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-30" />
              <div className="w-64 h-64 rounded-full bg-primary/10 blur-[80px]" />
              <div className="relative z-10 glass p-8 rounded-2xl border border-white/10 w-3/4 shadow-2xl">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <UploadCloud className="text-indigo-400 w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-white font-bold">Resume.pdf</div>
                    <div className="text-xs text-slate-500">Processing...</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-2 bg-white/5 rounded-full w-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary"
                      initial={{ width: "0%" }}
                      whileInView={{ width: "100%" }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                      viewport={{ once: true }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Extracting skills</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 border-t border-white/5 bg-[#0c0c11] relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-extrabold text-white tracking-tight mb-6"
          >
            Ready to secure your dream role?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto"
          >
            Join thousands of candidates who used PrepForge to pass their technical and behavioral rounds with confidence.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link 
              href="/auth/register" 
              className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-primary hover:bg-primary/90 rounded-xl transition-all shadow-xl shadow-primary/20 hover:scale-105 active:scale-95"
            >
              Start Your Free Session
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
