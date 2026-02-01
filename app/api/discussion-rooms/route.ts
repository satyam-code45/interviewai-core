import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { coachingOptions, topic, expertName, userId, interviewerLevel } = await request.json();

    const room = await prisma.discussionRoom.create({
      data: {
        coachingOptions,
        topic,
        expertName,
        userId,
        interviewerLevel: interviewerLevel || "intermediate",
      },
    });

    return NextResponse.json(room);
  } catch (error) {
    console.error("Error creating discussion room:", error);
    return NextResponse.json(
      { error: "Failed to create discussion room" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const roomId = searchParams.get("id");

    if (roomId) {
      // Get specific room
      const room = await prisma.discussionRoom.findUnique({
        where: { id: roomId },
        include: { user: true },
      });
      return NextResponse.json(room);
    }

    if (userId) {
      // Get all rooms for a user
      const rooms = await prisma.discussionRoom.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: { user: true },
      });
      return NextResponse.json(rooms);
    }

    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  } catch (error) {
    console.error("Error fetching discussion rooms:", error);
    return NextResponse.json(
      { error: "Failed to fetch discussion rooms" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, conversation, summary } = await request.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (conversation !== undefined) updateData.conversation = conversation;
    if (summary !== undefined) updateData.summary = summary;

    const room = await prisma.discussionRoom.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(room);
  } catch (error) {
    console.error("Error updating discussion room:", error);
    return NextResponse.json(
      { error: "Failed to update discussion room" },
      { status: 500 },
    );
  }
}
