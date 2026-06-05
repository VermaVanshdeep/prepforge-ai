"use client";
import dynamic from "next/dynamic";

const ResumeAnalysisView = dynamic(() => import("./ResumeAnalysisView"), { ssr: false });

export default ResumeAnalysisView;
