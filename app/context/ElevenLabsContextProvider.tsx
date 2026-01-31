"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  ReactNode,
  FunctionComponent,
  useCallback,
  useEffect,
} from "react";

// Connection states
export enum SpeechRecognitionState {
  CLOSED = "closed",
  OPEN = "open",
  CONNECTING = "connecting",
}

interface TranscriptionResult {
  text: string;
  is_final: boolean;
}

interface SpeechContextType {
  connectionState: SpeechRecognitionState;
  connect: () => Promise<void>;
  disconnect: () => void;
  addTranscriptListener: (
    callback: (data: TranscriptionResult) => void,
  ) => void;
  removeTranscriptListener: (
    callback: (data: TranscriptionResult) => void,
  ) => void;
  interimTranscript: string;
}

const SpeechContext = createContext<SpeechContextType | undefined>(undefined);

interface SpeechContextProviderProps {
  children: ReactNode;
}

// Use Web Speech API for real-time STT
const SpeechContextProvider: FunctionComponent<SpeechContextProviderProps> = ({
  children,
}) => {
  const [connectionState, setConnectionState] =
    useState<SpeechRecognitionState>(SpeechRecognitionState.CLOSED);
  const [interimTranscript, setInterimTranscript] = useState<string>("");

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptListenersRef = useRef<
    Set<(data: TranscriptionResult) => void>
  >(new Set());
  const isConnectedRef = useRef(false);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Create and start a new recognition instance
  const createRecognition = useCallback(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      console.error("❌ Speech Recognition not supported");
      return null;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log("✅ Speech Recognition STARTED");
      setConnectionState(SpeechRecognitionState.OPEN);
    };

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      if (interim) {
        setInterimTranscript(interim);
      }

      if (final && final.trim()) {
        console.log("✅ FINAL:", final.trim());
        const result: TranscriptionResult = {
          text: final.trim(),
          is_final: true,
        };
        transcriptListenersRef.current.forEach((listener) => {
          try {
            listener(result);
          } catch (e) {
            console.error("Listener error:", e);
          }
        });
        setInterimTranscript("");
      }
    };

    recognition.onerror = (event) => {
      console.error("❌ Speech error:", event.error);
      // Don't restart on fatal errors
      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      ) {
        isConnectedRef.current = false;
        setConnectionState(SpeechRecognitionState.CLOSED);
        return;
      }
      // For other errors, the onend will handle restart
    };

    recognition.onend = () => {
      console.log(
        "🔄 Speech Recognition ENDED, shouldRestart:",
        isConnectedRef.current,
      );

      if (isConnectedRef.current) {
        // Clear any pending restart
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
        }

        // Restart with a small delay
        restartTimeoutRef.current = setTimeout(() => {
          if (isConnectedRef.current) {
            console.log("🔄 Creating new recognition instance...");
            // Create completely fresh instance
            const newRecognition = createRecognition();
            if (newRecognition) {
              recognitionRef.current = newRecognition;
              try {
                newRecognition.start();
                console.log("✅ New recognition started");
              } catch (e) {
                console.error("Failed to start new recognition:", e);
              }
            }
          }
        }, 200);
      }
    };

    return recognition;
  }, []);

  const connect = useCallback(async () => {
    if (isConnectedRef.current) {
      console.log("Already connected");
      return;
    }

    setConnectionState(SpeechRecognitionState.CONNECTING);
    isConnectedRef.current = true;

    const recognition = createRecognition();
    if (!recognition) {
      isConnectedRef.current = false;
      setConnectionState(SpeechRecognitionState.CLOSED);
      return;
    }

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start:", e);
      isConnectedRef.current = false;
      setConnectionState(SpeechRecognitionState.CLOSED);
    }
  }, [createRecognition]);

  const disconnect = useCallback(() => {
    console.log("🔴 Disconnecting speech recognition");
    isConnectedRef.current = false;

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore
      }
      recognitionRef.current = null;
    }

    setInterimTranscript("");
    setConnectionState(SpeechRecognitionState.CLOSED);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isConnectedRef.current = false;
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const addTranscriptListener = useCallback(
    (callback: (data: TranscriptionResult) => void) => {
      transcriptListenersRef.current.add(callback);
    },
    [],
  );

  const removeTranscriptListener = useCallback(
    (callback: (data: TranscriptionResult) => void) => {
      transcriptListenersRef.current.delete(callback);
    },
    [],
  );

  return (
    <SpeechContext.Provider
      value={{
        connectionState,
        connect,
        disconnect,
        addTranscriptListener,
        removeTranscriptListener,
        interimTranscript,
      }}
    >
      {children}
    </SpeechContext.Provider>
  );
};

function useSpeechRecognition(): SpeechContextType {
  const context = useContext(SpeechContext);
  if (!context) {
    throw new Error(
      "useSpeechRecognition must be used within SpeechContextProvider",
    );
  }
  return context;
}

export { SpeechContextProvider, useSpeechRecognition };
