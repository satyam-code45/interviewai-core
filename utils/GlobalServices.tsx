import { VoiceId } from "@aws-sdk/client-polly";
import { Message } from "@/components/dashboard/App";

export const getApiKey = async () => {
  const response = await fetch("/api/authenticate");
  const data = await response.json();
  return data.apiKey; // Return only the API key
};

interface CoachingRequest {
  topic: string;
  coachingOption: string;
  message: string;
  conversationHistory?: Message[];
}

export async function fetchCoachingResponse({
  topic,
  coachingOption,
  message,
  conversationHistory,
}: CoachingRequest): Promise<{ content?: string; error?: string }> {
  try {
    const res = await fetch("/api/openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic,
        coachingOption,
        message,
        conversationHistory,
      }),
    });

    // ❗ Make sure to call .json() only once here
    const data = await res.json();

    if (!res.ok) {
      return { error: data?.error || "Something went wrong with the request." };
    }

    // API returns { response: "..." }, so map it to { content: "..." }
    return { content: data.response || data.content };
  } catch (error) {
    console.error("Error in fetchCoachingResponse:", error);
    return { error: "Failed to fetch coaching response" };
  }
}

interface feedback {
  coachingOption: string;
  conversation: Message[];
}

export async function fetchFeedback({
  coachingOption,
  conversation,
}: feedback): Promise<{
  response: string | undefined; content?: string; error?: string 
}> {
  try {
    const res = await fetch("/api/openaifeedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ coachingOption, conversation }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return { error: `Server error: ${res.status} ${errorText}` };
    }

    const data = await res.json();

    if (data.error) {
      return { error: data.message || data.error };
    }

    // ✅ Correct field name here
    return { content: data.response };
  } catch (err: any) {
    return { error: `Network error: ${err.message}` };
  }
}

// ElevenLabs Text-to-Speech - High quality, low latency
export const speakWithElevenLabs = async (
  text: string,
  voiceName?: string
): Promise<boolean> => {
  try {
    console.log("🎙️ ElevenLabs TTS: Speaking:", text.substring(0, 50) + "...");
    
    const response = await fetch("/api/elevenlabs-tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        voiceName: voiceName || "Female",
      }),
    });

    if (!response.ok) {
      console.error("ElevenLabs TTS error:", await response.text());
      return false;
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    return new Promise((resolve) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        console.log("✅ ElevenLabs speech finished");
        resolve(true);
      };
      
      audio.onerror = (error) => {
        console.error("❌ Audio playback error:", error);
        URL.revokeObjectURL(audioUrl);
        resolve(false);
      };
      
      audio.play().catch((error) => {
        console.error("❌ Audio play failed:", error);
        resolve(false);
      });
    });
  } catch (error) {
    console.error("ElevenLabs TTS error:", error);
    return false;
  }
};

// Free Web Speech API (browser-based, no API keys needed) - Fallback
export const speakText = (
  text: string,
  voiceName?: string,
): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) {
      console.error("❌ Speech synthesis not supported in this browser");
      resolve(false);
      return;
    }

    console.log("🎙️ Attempting to speak:", text.substring(0, 100) + "...");

    // Function to speak after voices are loaded
    const speak = () => {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Configure voice settings
      utterance.rate = 1.0; // Speed (0.1 to 10)
      utterance.pitch = 1.0; // Pitch (0 to 2)
      utterance.volume = 1.0; // Volume (0 to 1)

      // Try to set a specific voice if available
      const voices = window.speechSynthesis.getVoices();
      console.log("📢 Available voices:", voices.length);

      if (voices.length > 0) {
        // Prefer female English voices for better quality
        const preferredVoice =
          voices.find(
            (v) =>
              v.name.includes(voiceName || "Female") ||
              v.name.includes("Samantha") ||
              v.name.includes("Google US English"),
          ) ||
          voices.find((v) => v.lang.startsWith("en")) ||
          voices[0];

        utterance.voice = preferredVoice;
        console.log("✅ Using voice:", preferredVoice.name);
      } else {
        console.warn("⚠️ No voices available, using default");
      }

      utterance.onstart = () => {
        console.log("▶️ Speech started");
      };

      utterance.onend = () => {
        console.log("✅ Speech finished");
        resolve(true);
      };

      utterance.onerror = (event) => {
        console.error("❌ Speech error:", event.error);
        resolve(false);
      };

      window.speechSynthesis.speak(utterance);
      console.log("🔊 Speech queued successfully");
    };

    // Wait for voices to be loaded (important for Chrome/Edge)
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      speak();
    } else {
      console.log("⏳ Waiting for voices to load...");
      window.speechSynthesis.onvoiceschanged = () => {
        console.log("✅ Voices loaded");
        speak();
      };
      // Fallback: try speaking after a short delay
      setTimeout(() => {
        if (window.speechSynthesis.getVoices().length === 0) {
          console.warn("⚠️ Voices still not loaded, attempting anyway");
        }
        speak();
      }, 100);
    }
  });
};
