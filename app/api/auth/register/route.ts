import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const prisma = new PrismaClient();

// Define schema for validation
const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate the request body against the schema
    const validationResult = userSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { name, email, password } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
      },
    });

    // Don't return the password hash
    const { hashedPassword: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: "User created successfully",
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
