import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// OpenAI TTS voice options
const VOICE_MAP: Record<string, "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer"> = {
  "Female": "nova",      // Clear female voice
  "Male": "onyx",        // Deep male voice
  "Joanna": "nova",      // Map to nova
  "Salli": "shimmer",    // Map to shimmer
  "Joey": "echo",        // Map to echo
  "Rachel": "nova",
  "Josh": "onyx",
  // Additional mappings
  "alloy": "alloy",
  "echo": "echo", 
  "fable": "fable",
  "onyx": "onyx",
  "nova": "nova",
  "shimmer": "shimmer",
};

export async function POST(request: Request): Promise<Response> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const { text, voiceName = "Female" } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    // Get voice from mapping or default to nova
    const voice = VOICE_MAP[voiceName] || "nova";

    console.log(`🎙️ OpenAI TTS: Converting text to speech with voice ${voice}`);

    const response = await openai.audio.speech.create({
      model: "tts-1", // Use "tts-1-hd" for higher quality (slower)
      voice: voice,
      input: text,
      response_format: "mp3",
      speed: 1.0,
    });

    // Get the audio as array buffer
    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": "inline; filename=speech.mp3",
      },
    });
  } catch (error: any) {
    console.error("OpenAI TTS API error:", error);
    
    if (error?.status === 429) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: "Text-to-Speech conversion failed" },
      { status: 500 }
    );
  }
}
