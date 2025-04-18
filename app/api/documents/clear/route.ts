import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
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

    // Delete all user documents
    const result = await prisma.document.deleteMany({
      where: { userId: user.id },
    });

    return NextResponse.json(
      {
        message: "All documents cleared successfully",
        count: result.count,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Document clear error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
