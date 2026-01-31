import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json();

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    // Create user if doesn't exist
    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          email,
          credits: 5000,
        },
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error creating/finding user:", error);
    return NextResponse.json(
      { error: "Failed to create/find user" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, credits } = await request.json();

    const user = await prisma.user.update({
      where: { id },
      data: { credits },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user credits:", error);
    return NextResponse.json(
      { error: "Failed to update user credits" },
      { status: 500 },
    );
  }
}
