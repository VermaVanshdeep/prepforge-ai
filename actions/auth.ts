"use server";

import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import bcrypt from "bcrypt";
import { AuthError } from "next-auth";

/**
 * Registers a new user in the database.
 * Hashes password before storage.
 */
export async function registerUser(data: unknown) {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    const errorMessages = parsed.error.issues.map(err => err.message).join(", ");
    return { error: `Validation failed: ${errorMessages}` };
  }

  const { name, email, password } = parsed.data;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      console.warn(`[REGISTER] User already exists: ${email}`);
      return { error: "An account with this email already exists." };
    }

    // Hash the password with bcrypt (10 salt rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user record in PostgreSQL
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
      },
    });
    
    console.log(`[REGISTER] Successfully created user: ${user.id} (${user.email})`);

    return { 
      success: true, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    };
  } catch (error) {
    console.error("[REGISTER] Registration error:", error);
    return { 
      error: error instanceof Error ? error.message : "Failed to register user. Please try again later." 
    };
  }
}

/**
 * Authenticates a user via NextAuth credentials provider.
 *
 * IMPORTANT: We use `redirect: false` here because this server action is
 * called programmatically from a client component's event handler (onSubmit),
 * NOT via a <form action={...}> binding.
 *
 * When signIn() triggers a NEXT_REDIRECT inside fetchServerAction (the client-side
 * transport layer), the client receives a 303 response instead of the expected
 * binary RSC payload, causing "An unexpected response was received from the server".
 *
 * With redirect: false, signIn() sets the session cookie and returns cleanly.
 * The client component (LoginForm / RegisterForm) then navigates via router.push().
 */
export async function loginUser(data: unknown) {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Please provide a valid email and password." };
  }

  const { email, password } = parsed.data;

  try {
    await signIn("credentials", {
      email: email.toLowerCase(),
      password,
      redirect: false, // Prevents NEXT_REDIRECT from breaking fetchServerAction
    });

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password. Please try again." };
        default:
          return { error: "Authentication failed. Please verify your credentials." };
      }
    }

    console.error("[LOGIN] Uncaught error during login:", error);
    throw error;
  }
}

