import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: Request): Promise<Response> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "Audio file is required" },
        { status: 400 }
      );
    }

    console.log("🎤 OpenAI Whisper: Processing audio...", audioFile.type, audioFile.size);

    // Convert to the format OpenAI expects
    const response = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en",
      response_format: "json",
    });

    console.log("✅ Whisper transcription:", response.text);

    return NextResponse.json({
      transcript: response.text,
      success: true,
    });
  } catch (error: any) {
    console.error("OpenAI Whisper API error:", error);
    
    if (error?.status === 429) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: "Speech-to-Text conversion failed", details: error?.message },
      { status: 500 }
    );
  }
}
