import { NextResponse } from "next/server";

const GOOGLE_CLOUD_API_KEY = process.env.GOOGLE_CLOUD_API_KEY!;

export async function POST(request: Request): Promise<Response> {
  try {
    if (!GOOGLE_CLOUD_API_KEY) {
      return NextResponse.json(
        { error: "Google Cloud API key not configured" },
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

    // Convert audio to base64
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBytes = Buffer.from(arrayBuffer).toString("base64");

    console.log("🎤 Google STT: Processing audio...");

    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_CLOUD_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          config: {
            encoding: "WEBM_OPUS",
            sampleRateHertz: 48000,
            languageCode: "en-US",
            enableAutomaticPunctuation: true,
            model: "latest_long",
          },
          audio: {
            content: audioBytes,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google STT API error:", errorText);
      return NextResponse.json(
        { error: `Google STT API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Extract transcription results
    const transcript = data.results
      ?.map((result: any) => result.alternatives[0]?.transcript)
      .join(" ") || "";

    console.log("✅ Google STT result:", transcript);

    return NextResponse.json({
      transcript,
      confidence: data.results?.[0]?.alternatives?.[0]?.confidence || 0,
    });
  } catch (error) {
    console.error("Google STT API error:", error);
    return NextResponse.json(
      { error: "Speech-to-Text conversion failed" },
      { status: 500 }
    );
  }
}
