import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";

// Define schema for validation
const documentSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

const syncRequestSchema = z.object({
  documents: z.array(documentSchema),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check authentication
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validate the request body
    const validationResult = syncRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { documents } = validationResult.data;

    // Find user ID from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Process each document
    const results = await Promise.all(
      documents.map(async (doc) => {
        // Check if document already exists
        const existingDoc = await prisma.document.findUnique({
          where: { id: doc.id },
        });

        if (existingDoc) {
          // Update existing document
          return prisma.document.update({
            where: { id: doc.id },
            data: {
              title: doc.title,
              content: doc.content,
              updatedAt: new Date(),
            },
          });
        } else {
          // Create new document
          return prisma.document.create({
            data: {
              id: doc.id,
              title: doc.title,
              content: doc.content,
              userId: user.id,
              createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
              updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
            },
          });
        }
      })
    );

    return NextResponse.json(
      {
        message: "Documents synced successfully",
        count: results.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Document sync error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve documents from database
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check authentication
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Find user ID from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Get all user documents
    const documents = await prisma.document.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
