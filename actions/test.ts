"use server";

import { prisma } from "@/lib/prisma";

export async function testDatabaseConnection() {
  try {
    const result = await prisma.user.count();
    console.log("DATABASE OK. User count:", result);
    return { success: true, count: result };
  } catch (error) {
    console.error("DATABASE FAILED:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}
