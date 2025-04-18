import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check authentication
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const documentId = params.id;

    // Find user ID from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Find the document and check ownership
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json(
        { message: "Document not found" },
        { status: 404 }
      );
    }

    if (document.userId !== user.id) {
      return NextResponse.json(
        { message: "Not authorized to delete this document" },
        { status: 403 }
      );
    }

    // Delete the document
    await prisma.document.delete({
      where: { id: documentId },
    });

    return NextResponse.json(
      { message: "Document deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Document deletion error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
