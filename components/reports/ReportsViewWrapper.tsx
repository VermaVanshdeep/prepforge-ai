"use client";
import dynamic from "next/dynamic";

const ReportsView = dynamic(() => import("./ReportsView"), { ssr: false });

export default ReportsView;
