import { NextResponse } from "next/server";
import { CoachingOptions } from "@/utils/Options";
import OpenAI from "openai";
import { Message } from "@/components/dashboard/App";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Default model for feedback
const DEFAULT_FEEDBACK_MODEL = "gpt-4o-mini";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const {
      coachingOption,
      conversation,
    }: {
      coachingOption: string;
      conversation: Message[];
    } = await request.json();

    console.log("✅ Received request:", { coachingOption, conversation });

    const option = CoachingOptions.find((item) => item.name === coachingOption);
    if (!option) {
      return NextResponse.json(
        { error: `No matching coaching option found for ${coachingOption}` },
        { status: 400 },
      );
    }

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: option.summaryPrompt },
      ...conversation
        .filter((m) => m.content?.trim())
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
    ];

    console.log("📤 Sending to OpenAI:", messages);

    // Use OpenAI GPT-4o-mini for feedback
    const completion = await openai.chat.completions.create({
      model: DEFAULT_FEEDBACK_MODEL,
      messages,
      temperature: 0.7,
    });

    console.log("🤖 OpenAI Response:", completion);

    if (!completion.choices || completion.choices.length === 0) {
      throw new Error("No choices returned from OpenAI.");
    }

    const responseContent = completion.choices[0].message?.content;

    if (!responseContent) {
      return NextResponse.json(
        { error: "OpenAI returned an empty response." },
        { status: 500 },
      );
    }

    return NextResponse.json({ response: responseContent });
  } catch (error: unknown) {
    console.error("❌ Error fetching response from OpenAI:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Handle rate limit errors
    if (errorMessage.includes("Rate limit") || errorMessage.includes("429")) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: "Too many requests. Please try again later.",
        },
        { status: 429 },
      );
    }

    // Handle quota errors
    if (errorMessage.includes("quota") || errorMessage.includes("billing")) {
      return NextResponse.json(
        {
          error: "Quota exceeded",
          message: "API quota exceeded. Please check your OpenAI billing.",
        },
        { status: 429 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch OpenAI response",
        message: errorMessage,
      },
      { status: 500 },
    );
  }
}
