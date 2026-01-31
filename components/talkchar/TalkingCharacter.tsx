"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import { useRive, useStateMachineInput } from "@rive-app/react-canvas";

// Improved phoneme to viseme mapping
const phonemeToViseme: Record<string, number> = {
  // Closed mouth (M, B, P)
  M: 0,
  B: 0,
  P: 0,

  // Lips together/rounded (F, V)
  F: 1,
  V: 1,

  // Teeth visible (TH, DH, S, Z)
  TH: 2,
  DH: 2,
  S: 2,
  Z: 2,

  // Narrow (EE, I)
  IY: 3,
  IH: 3,
  EY: 3,

  // Relaxed (UH, ER)
  AH: 4,
  UH: 4,
  ER: 4,

  // Lip rounded (OO, U, W)
  UW: 5,
  UU: 5,
  W: 5,
  OW: 5,

  // Slightly open (EH, AE)
  EH: 6,
  AE: 6,

  // Medium open (AA, AO)
  AA: 7,
  AO: 7,
  AW: 7,

  // Wide open (AH, AY)
  AY: 8,
  AI: 8,

  // Very wide (for emphasis)
  AA1: 9,
  AO1: 9,

  // Consonants
  T: 2,
  D: 2,
  N: 2,
  L: 3,
  R: 4,
  K: 4,
  G: 4,
  NG: 4,
  CH: 3,
  JH: 3,
  SH: 2,
  ZH: 2,
  HH: 4,
  Y: 3,
};

// Simple phoneme generator for lip sync animation
function getSimplePhonemes(text: string): string[] {
  const phonemes: string[] = [];
  const words = text.toLowerCase().split(/\s+/);

  words.forEach((word, wordIndex) => {
    // Simple character to phoneme mapping
    for (const char of word) {
      switch (char) {
        case "a":
          phonemes.push("AH");
          break;
        case "e":
          phonemes.push("EH");
          break;
        case "i":
          phonemes.push("IH");
          break;
        case "o":
          phonemes.push("OW");
          break;
        case "u":
          phonemes.push("UH");
          break;
        case "m":
          phonemes.push("M");
          break;
        case "b":
          phonemes.push("B");
          break;
        case "p":
          phonemes.push("P");
          break;
        case "f":
          phonemes.push("F");
          break;
        case "v":
          phonemes.push("V");
          break;
        case "s":
          phonemes.push("S");
          break;
        case "z":
          phonemes.push("Z");
          break;
        case "t":
          phonemes.push("T");
          break;
        case "d":
          phonemes.push("D");
          break;
        case "n":
          phonemes.push("N");
          break;
        case "l":
          phonemes.push("L");
          break;
        case "r":
          phonemes.push("R");
          break;
        case "k":
        case "c":
          phonemes.push("K");
          break;
        case "g":
          phonemes.push("G");
          break;
        case "w":
          phonemes.push("W");
          break;
        case "y":
          phonemes.push("Y");
          break;
        case "h":
          phonemes.push("HH");
          break;
        default:
          phonemes.push("AH");
          break;
      }
    }

    // Add pause between words
    if (wordIndex < words.length - 1) {
      phonemes.push("PAUSE");
    }
  });

  return phonemes;
}

export interface TalkingCharacterRef {
  speak: (text: string, voiceName?: string) => Promise<boolean>;
  stop: () => void;
  isSpeaking: () => boolean;
  isReady: () => boolean;
}

interface TalkingCharacterProps {
  onSpeakStart?: () => void;
  onSpeakEnd?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const TalkingCharacter = forwardRef<TalkingCharacterRef, TalkingCharacterProps>(
  function TalkingCharacter(
    { onSpeakStart, onSpeakEnd, className, style },
    ref,
  ) {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Load Rive
    const { rive, RiveComponent } = useRive({
      src: "/character.riv",
      stateMachines: "State Machine 1",
      autoplay: true,
    });

    // Get the lip sync input
    const lipInput = useStateMachineInput(rive, "State Machine 1", "lipsid");

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }, []);

    // Speak function using OpenAI TTS
    const speak = useCallback(
      async (textToSpeak: string, voiceName?: string): Promise<boolean> => {
        if (!lipInput || !textToSpeak) {
          console.warn("Lip input not ready or no text provided");
          return false;
        }

        // Stop any ongoing speech
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        lipInput.value = 0;
        setIsSpeaking(true);
        onSpeakStart?.();

        try {
          console.log("🎙️ OpenAI TTS: Requesting speech...");

          // Call OpenAI TTS API
          const response = await fetch("/api/openai-tts", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: textToSpeak,
              voiceName: voiceName || "Female",
            }),
          });

          if (!response.ok) {
            throw new Error(`TTS API error: ${response.status}`);
          }

          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          audioRef.current = audio;

          // Get phonemes for lip sync
          const phonemes = getSimplePhonemes(textToSpeak);
          const estimatedDuration = textToSpeak.split(" ").length * 0.35; // Estimate for OpenAI TTS
          const msPerPhoneme = Math.max(
            40,
            Math.min(100, (estimatedDuration * 1000) / phonemes.length),
          );

          return new Promise((resolve) => {
            let currentIndex = 0;

            audio.onplay = () => {
              console.log("🔊 OpenAI TTS audio started");

              // Start lip sync animation
              intervalRef.current = setInterval(() => {
                if (currentIndex >= phonemes.length) {
                  lipInput.value = 0;
                  return;
                }

                const phoneme = phonemes[currentIndex];
                const viseme =
                  phoneme === "PAUSE" ? 0 : (phonemeToViseme[phoneme] ?? 4);
                lipInput.value = viseme;
                currentIndex++;
              }, msPerPhoneme);
            };

            audio.onended = () => {
              console.log("✅ OpenAI TTS speech finished");
              lipInput.value = 0;
              setIsSpeaking(false);
              onSpeakEnd?.();
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
              URL.revokeObjectURL(audioUrl);
              resolve(true);
            };

            audio.onerror = (error) => {
              console.error("❌ Audio playback error:", error);
              lipInput.value = 0;
              setIsSpeaking(false);
              onSpeakEnd?.();
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
              URL.revokeObjectURL(audioUrl);
              resolve(false);
            };

            audio.play().catch((error) => {
              console.error("❌ Audio play failed:", error);
              lipInput.value = 0;
              setIsSpeaking(false);
              onSpeakEnd?.();
              URL.revokeObjectURL(audioUrl);
              resolve(false);
            });
          });
        } catch (error) {
          console.error("❌ OpenAI TTS error:", error);
          lipInput.value = 0;
          setIsSpeaking(false);
          onSpeakEnd?.();
          return false;
        }
      },
      [lipInput, onSpeakStart, onSpeakEnd],
    );

    // Stop speaking
    const stop = useCallback(() => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (lipInput) {
        lipInput.value = 0;
      }
      setIsSpeaking(false);
      onSpeakEnd?.();
    }, [lipInput, onSpeakEnd]);

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        speak,
        stop,
        isSpeaking: () => isSpeaking,
        isReady: () => !!lipInput,
      }),
      [speak, stop, isSpeaking, lipInput],
    );

    return (
      <div
        className={`relative ${className || ""}`}
        style={{ width: "100%", height: "100%", ...style }}
      >
        <RiveComponent />
        {isSpeaking && (
          <div className="absolute bottom-2 left-2 bg-primary/80 text-white text-xs px-2 py-1 rounded-full animate-pulse">
            🎤 Speaking...
          </div>
        )}
      </div>
    );
  },
);

export default TalkingCharacter;
