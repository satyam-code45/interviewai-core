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

// Simple phoneme generator (fallback without RiTa)
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
  speak: (text: string) => Promise<boolean>;
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
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef(0);

    // Load Rive
    const { rive, RiveComponent } = useRive({
      src: "/character.riv",
      stateMachines: "State Machine 1",
      autoplay: true,
    });

    // Get the lip sync input
    const lipInput = useStateMachineInput(rive, "State Machine 1", "lipsid");

    // Load voices
    useEffect(() => {
      const load = () => {
        const loadedVoices = window.speechSynthesis.getVoices();
        setVoices(loadedVoices);
      };
      load();
      window.speechSynthesis.onvoiceschanged = load;
    }, []);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        window.speechSynthesis.cancel();
      };
    }, []);

    // Speak function that can be called externally
    const speak = useCallback(
      (textToSpeak: string): Promise<boolean> => {
        if (!lipInput || !textToSpeak) {
          console.warn("Lip input not ready or no text provided");
          return Promise.resolve(false);
        }

        return new Promise((resolve) => {
          // Reset everything
          window.speechSynthesis.cancel();
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }

          lipInput.value = 0;
          setIsSpeaking(true);
          onSpeakStart?.();

          // Get phonemes
          const phonemes = getSimplePhonemes(textToSpeak);
          console.log("🗣️ Speaking with", phonemes.length, "phonemes");

          if (phonemes.length === 0) {
            setIsSpeaking(false);
            onSpeakEnd?.();
            resolve(false);
            return;
          }

          // Create utterance
          const utter = new SpeechSynthesisUtterance(textToSpeak);
          utter.rate = 0.9;
          utter.pitch = 1.0;
          utter.volume = 1.0;

          if (voices.length > 0) {
            // Try to find a good voice
            const preferredVoice =
              voices.find(
                (v) =>
                  v.name.includes("Google") ||
                  v.name.includes("Microsoft") ||
                  v.lang.startsWith("en"),
              ) || voices[0];
            utter.voice = preferredVoice;
          }

          // Calculate timing
          const estimatedDuration = textToSpeak.split(" ").length * 0.5;
          const msPerPhoneme = (estimatedDuration * 1000) / phonemes.length;
          const adjustedMsPerPhoneme = Math.max(
            50,
            Math.min(150, msPerPhoneme),
          );

          let currentIndex = 0;

          utter.onstart = () => {
            console.log("🎤 Speech started");
            startTimeRef.current = Date.now();

            intervalRef.current = setInterval(() => {
              if (currentIndex >= phonemes.length) {
                lipInput.value = 0;
                if (intervalRef.current) {
                  clearInterval(intervalRef.current);
                  intervalRef.current = null;
                }
                return;
              }

              const phoneme = phonemes[currentIndex];
              let viseme = 0;

              if (phoneme === "PAUSE") {
                viseme = 0;
              } else {
                viseme = phonemeToViseme[phoneme] ?? 4;
              }

              lipInput.value = viseme;
              currentIndex++;
            }, adjustedMsPerPhoneme);
          };

          utter.onend = () => {
            console.log("🎤 Speech ended");
            lipInput.value = 0;
            setIsSpeaking(false);
            onSpeakEnd?.();
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            resolve(true);
          };

          utter.onerror = (e) => {
            console.error("❌ Speech error:", e);
            lipInput.value = 0;
            setIsSpeaking(false);
            onSpeakEnd?.();
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            resolve(false);
          };

          window.speechSynthesis.speak(utter);
        });
      },
      [lipInput, voices, onSpeakStart, onSpeakEnd],
    );

    // Stop speaking
    const stop = useCallback(() => {
      window.speechSynthesis.cancel();
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
