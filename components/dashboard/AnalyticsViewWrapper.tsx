"use client";
import dynamic from "next/dynamic";

const AnalyticsView = dynamic(() => import("./AnalyticsView"), { ssr: false });

export default AnalyticsView;
