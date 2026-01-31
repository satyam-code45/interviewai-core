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
  addTranscriptListener: (callback: (data: TranscriptionResult) => void) => void;
  removeTranscriptListener: (callback: (data: TranscriptionResult) => void) => void;
  interimTranscript: string;
}

const SpeechContext = createContext<SpeechContextType | undefined>(undefined);

interface SpeechContextProviderProps {
  children: ReactNode;
}

// Use Web Speech API for real-time STT (free, no API key needed, low latency)
const SpeechContextProvider: FunctionComponent<SpeechContextProviderProps> = ({
  children,
}) => {
  const [connectionState, setConnectionState] = useState<SpeechRecognitionState>(
    SpeechRecognitionState.CLOSED
  );
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptListenersRef = useRef<Set<(data: TranscriptionResult) => void>>(new Set());
  const isConnectedRef = useRef(false); // Use ref to track connection state for callbacks
  
  const connect = useCallback(async () => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error("❌ Speech Recognition not supported in this browser");
      return;
    }
    
    // If already connected, don't reconnect
    if (isConnectedRef.current) {
      console.log("Already connected");
      return;
    }
    
    setConnectionState(SpeechRecognitionState.CONNECTING);
    isConnectedRef.current = true;
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;
    
    recognition.onstart = () => {
      console.log("✅ Speech Recognition started");
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
      
      // Update interim transcript for live display
      if (interim) {
        setInterimTranscript(interim);
        console.log("🎙️ Interim:", interim);
      }
      
      // Notify listeners of final transcript
      if (final && final.trim()) {
        console.log("✅ Final transcript ready:", final.trim());
        
        const result: TranscriptionResult = {
          text: final.trim(),
          is_final: true,
        };
        
        // Immediately notify all listeners
        transcriptListenersRef.current.forEach((listener) => {
          try {
            listener(result);
          } catch (e) {
            console.error("Listener error:", e);
          }
        });
        
        // Clear interim after final
        setInterimTranscript("");
      }
    };
    
    recognition.onerror = (event) => {
      console.error("Speech Recognition error:", event.error);
      
      // Auto-restart on recoverable errors
      if (isConnectedRef.current && (event.error === "no-speech" || event.error === "aborted" || event.error === "network")) {
        console.log("🔄 Restarting after error...");
        setTimeout(() => {
          if (isConnectedRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              // Ignore if already running
            }
          }
        }, 300);
      }
    };
    
    recognition.onend = () => {
      console.log("🔄 Speech Recognition ended, isConnected:", isConnectedRef.current);
      
      // Auto-restart to keep listening continuously
      if (isConnectedRef.current) {
        console.log("🔄 Auto-restarting speech recognition...");
        // Use shorter delay for faster restart
        setTimeout(() => {
          if (isConnectedRef.current) {
            try {
              // Create fresh recognition instance if needed
              if (!recognitionRef.current) {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                const newRecognition = new SpeechRecognition();
                newRecognition.continuous = true;
                newRecognition.interimResults = true;
                newRecognition.lang = "en-US";
                recognitionRef.current = newRecognition;
                
                // Re-attach handlers
                newRecognition.onstart = () => {
                  console.log("✅ Speech Recognition restarted");
                  setConnectionState(SpeechRecognitionState.OPEN);
                };
                newRecognition.onresult = recognition.onresult;
                newRecognition.onerror = recognition.onerror;
                newRecognition.onend = recognition.onend;
              }
              
              recognitionRef.current.start();
              console.log("✅ Speech Recognition restart initiated");
            } catch (e: any) {
              // If already running, that's fine
              if (e.name !== "InvalidStateError") {
                console.error("Could not restart:", e);
              }
            }
          }
        }, 100);
      }
    };
    
    recognitionRef.current = recognition;
    
    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
      isConnectedRef.current = false;
    }
  }, []);
  
  const disconnect = useCallback(() => {
    isConnectedRef.current = false; // Set this first to prevent auto-restart
    
    if (recognitionRef.current) {
      recognitionRef.current.onend = null; // Prevent auto-restart callback
      recognitionRef.current.onerror = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    setInterimTranscript("");
    setConnectionState(SpeechRecognitionState.CLOSED);
    console.log("🔴 Speech Recognition stopped");
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isConnectedRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
  }, []);
  
  const addTranscriptListener = useCallback((callback: (data: TranscriptionResult) => void) => {
    transcriptListenersRef.current.add(callback);
  }, []);
  
  const removeTranscriptListener = useCallback((callback: (data: TranscriptionResult) => void) => {
    transcriptListenersRef.current.delete(callback);
  }, []);
  
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
    throw new Error("useSpeechRecognition must be used within SpeechContextProvider");
  }
  return context;
}

export { SpeechContextProvider, useSpeechRecognition };
