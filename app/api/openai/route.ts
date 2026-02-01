import { NextResponse } from "next/server";
import { CoachingOptions, getDifficultyPrompt, InterviewerLevel } from "@/utils/Options";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();

    const {
      topic,
      coachingOption,
      message,
      conversationHistory,
      interviewerLevel,
    }: {
      topic: string;
      coachingOption: string;
      message: string;
      conversationHistory?: ConversationMessage[];
      interviewerLevel?: InterviewerLevel;
    } = body;

    if (!topic || !coachingOption || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const option = CoachingOptions.find(
      (item) => item.name === coachingOption
    );

    if (!option) {
      return NextResponse.json(
        { error: `Invalid coaching option: ${coachingOption}` },
        { status: 400 }
      );
    }

    // Use difficulty-based prompt if level is provided, otherwise use default
    let systemPrompt: string;
    if (interviewerLevel) {
      systemPrompt = getDifficultyPrompt(interviewerLevel, topic, coachingOption);
    } else {
      systemPrompt = option.prompt.replace("{user_topic}", topic);
    }

    // Build messages array with conversation history
    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: systemPrompt },
    ];

    // Add conversation history if provided (limit to last 10 messages to save tokens)
    // The conversation history already includes the current user message
    if (conversationHistory && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-10);
      recentHistory.forEach((msg) => {
        messages.push({ role: msg.role, content: msg.content });
      });
    } else {
      // If no history, just add the current message
      messages.push({ role: "user", content: message });
    }

    console.log("📨 OpenAI messages:", JSON.stringify(messages.map(m => ({ role: m.role, content: m.content.substring(0, 50) }))));

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
    });

    const response =
      completion.choices?.[0]?.message?.content ?? "No response generated";

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error("OpenAI API error:", error);

    // 🔴 RATE LIMIT / QUOTA
    if (error?.status === 429) {
      return NextResponse.json(
        {
          error: "Quota exceeded",
          message:
            "You have exceeded your OpenAI quota or rate limits. Please check billing or try again later.",
        },
        { status: 429 }
      );
    }

    // 🔴 AUTH ERROR
    if (error?.status === 401) {
      return NextResponse.json(
        {
          error: "Invalid API key",
          message: "Your OpenAI API key is invalid or missing.",
        },
        { status: 401 }
      );
    }

    // 🔴 GENERIC ERROR
    return NextResponse.json(
      {
        error: "OpenAI request failed",
        message: error?.message || "Unexpected server error",
      },
      { status: 500 }
    );
  }
}
