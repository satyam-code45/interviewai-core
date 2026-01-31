import { NextResponse } from "next/server";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!;

// ElevenLabs voice IDs - you can customize these
const VOICE_IDS: Record<string, string> = {
  // Default voices
  "Rachel": "21m00Tcm4TlvDq8ikWAM", // Female, calm
  "Domi": "AZnzlk1XvdvUeBnXmlld", // Female, strong  
  "Bella": "EXAVITQu4vr4xnSDxMaL", // Female, soft
  "Antoni": "ErXwobaYiN019PkySvjV", // Male, well-rounded
  "Elli": "MF3mGyEYCl7XYWbV9V6O", // Female, emotional
  "Josh": "TxGEqnHWrfWFTfGW9XjX", // Male, deep
  "Arnold": "VR6AewLTigWG4xSOukaG", // Male, crisp
  "Adam": "pNInz6obpgDQGcFmaJgB", // Male, deep
  "Sam": "yoZ06aMxZJJ28mfd3POQ", // Male, raspy
  // Mapping for expert names
  "Female": "21m00Tcm4TlvDq8ikWAM", // Rachel
  "Male": "ErXwobaYiN019PkySvjV", // Antoni
};

export async function POST(request: Request): Promise<Response> {
  try {
    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: "ElevenLabs API key not configured" },
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

    // Get voice ID from name or use default
    const voiceId = VOICE_IDS[voiceName] || VOICE_IDS["Female"];

    console.log(`🎙️ ElevenLabs TTS: Converting text to speech with voice ${voiceName} (${voiceId})`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      {
        method: "POST",
        headers: {
          "Accept": "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2", // Higher quality model for clearer speech
          voice_settings: {
            stability: 0.65, // Higher stability for clearer speech
            similarity_boost: 0.80, // Higher similarity for consistent voice
            style: 0.1, // Slight style for natural speech
            use_speaker_boost: true,
          },
          output_format: "mp3_44100_128", // Higher quality audio
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", errorText);
      return NextResponse.json(
        { error: `ElevenLabs API error: ${response.status}` },
        { status: response.status }
      );
    }

    // Stream the audio response
    const audioBuffer = await response.arrayBuffer();
    
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": "inline; filename=speech.mp3",
      },
    });
  } catch (error) {
    console.error("TTS API error:", error);
    return NextResponse.json(
      { error: "Text-to-Speech conversion failed" },
      { status: 500 }
    );
  }
}
