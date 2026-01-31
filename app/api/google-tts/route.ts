import { NextResponse } from "next/server";

const GOOGLE_CLOUD_API_KEY = process.env.GOOGLE_CLOUD_API_KEY!;

// Google Cloud TTS voice configurations
const VOICE_CONFIG: Record<string, { name: string; languageCode: string; ssmlGender: string }> = {
  "Female": {
    name: "en-US-Neural2-F", // High quality female voice
    languageCode: "en-US",
    ssmlGender: "FEMALE",
  },
  "Male": {
    name: "en-US-Neural2-D", // High quality male voice
    languageCode: "en-US",
    ssmlGender: "MALE",
  },
  "Rachel": {
    name: "en-US-Neural2-C",
    languageCode: "en-US",
    ssmlGender: "FEMALE",
  },
  "Josh": {
    name: "en-US-Neural2-J",
    languageCode: "en-US",
    ssmlGender: "MALE",
  },
};

export async function POST(request: Request): Promise<Response> {
  try {
    if (!GOOGLE_CLOUD_API_KEY) {
      return NextResponse.json(
        { error: "Google Cloud API key not configured" },
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

    // Get voice config from name or use default
    const voiceConfig = VOICE_CONFIG[voiceName] || VOICE_CONFIG["Female"];

    console.log(`🎙️ Google TTS: Converting text to speech with voice ${voiceName}`);

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_CLOUD_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: voiceConfig.languageCode,
            name: voiceConfig.name,
            ssmlGender: voiceConfig.ssmlGender,
          },
          audioConfig: {
            audioEncoding: "MP3",
            speakingRate: 1.0,
            pitch: 0,
            volumeGainDb: 0,
            effectsProfileId: ["headphone-class-device"], // Optimized for headphones
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google TTS API error:", errorText);
      return NextResponse.json(
        { error: `Google TTS API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Google returns base64 encoded audio
    const audioContent = data.audioContent;
    const audioBuffer = Buffer.from(audioContent, "base64");
    
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": "inline; filename=speech.mp3",
      },
    });
  } catch (error) {
    console.error("Google TTS API error:", error);
    return NextResponse.json(
      { error: "Text-to-Speech conversion failed" },
      { status: 500 }
    );
  }
}
