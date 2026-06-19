"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

/**
 * Updates details of the logged-in user
 */
export async function updateProfile(rawData: unknown) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized access." };
  }

  const parsed = updateProfileSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i: z.ZodIssue) => i.message).join(", ") };
  }

  const { name, email } = parsed.data;

  try {
    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        NOT: { id: session.user.id },
      },
    });

    if (existingUser) {
      return { error: "This email address is already in use." };
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        email: email.toLowerCase(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("[PROFILE] Failed to update profile settings:", error);
    return { 
      error: error instanceof Error ? error.message : "Failed to update account details." 
    };
  }
}
