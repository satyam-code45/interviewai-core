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
  setCharacterSpeaking: (speaking: boolean) => void;
}

const SpeechContext = createContext<SpeechContextType | undefined>(undefined);

interface SpeechContextProviderProps {
  children: ReactNode;
}

// Use OpenAI Whisper for STT with continuous recording
const WhisperSpeechContextProvider: FunctionComponent<
  SpeechContextProviderProps
> = ({ children }) => {
  const [connectionState, setConnectionState] =
    useState<SpeechRecognitionState>(SpeechRecognitionState.CLOSED);
  const [interimTranscript, setInterimTranscript] = useState<string>("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const transcriptListenersRef = useRef<
    Set<(data: TranscriptionResult) => void>
  >(new Set());
  const isConnectedRef = useRef(false);
  const isCharacterSpeakingRef = useRef(false);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Expose method to set character speaking state
  const setCharacterSpeaking = useCallback((speaking: boolean) => {
    isCharacterSpeakingRef.current = speaking;
    console.log(`🔇 Character speaking: ${speaking}`);
  }, []);

  // Send audio to Whisper API
  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    if (audioBlob.size < 1000) {
      console.log("⚠️ Audio too small, skipping");
      return;
    }

    if (isCharacterSpeakingRef.current) {
      console.log("🔇 Ignoring audio while character is speaking");
      return;
    }

    if (isProcessingRef.current) {
      console.log("⏳ Already processing, skipping");
      return;
    }

    isProcessingRef.current = true;
    setInterimTranscript("Processing...");

    try {
      const formData = new FormData();
      // Convert to wav format for better compatibility
      formData.append("audio", audioBlob, "audio.webm");

      console.log("🎤 Sending audio to Whisper...", audioBlob.size, "bytes");

      const response = await fetch("/api/openai-stt", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`STT API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.transcript && data.transcript.trim()) {
        console.log("✅ Whisper transcript:", data.transcript);

        const result: TranscriptionResult = {
          text: data.transcript.trim(),
          is_final: true,
        };

        transcriptListenersRef.current.forEach((listener) => {
          try {
            listener(result);
          } catch (e) {
            console.error("Listener error:", e);
          }
        });
      }

      setInterimTranscript("");
    } catch (error) {
      console.error("❌ Whisper transcription error:", error);
      setInterimTranscript("");
    } finally {
      isProcessingRef.current = false;
    }
  }, []);

  // Start a new recording segment
  const startRecordingSegment = useCallback(() => {
    if (
      !mediaRecorderRef.current ||
      mediaRecorderRef.current.state === "recording"
    ) {
      return;
    }

    audioChunksRef.current = [];

    try {
      mediaRecorderRef.current.start();
      console.log("🎙️ Recording segment started");
    } catch (e) {
      console.error("Failed to start recording:", e);
    }
  }, []);

  // Stop current recording and transcribe
  const stopAndTranscribe = useCallback(async () => {
    if (
      !mediaRecorderRef.current ||
      mediaRecorderRef.current.state !== "recording"
    ) {
      return;
    }

    return new Promise<void>((resolve) => {
      const recorder = mediaRecorderRef.current!;

      recorder.onstop = async () => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });
          await transcribeAudio(audioBlob);
        }
        resolve();
      };

      recorder.stop();
      console.log("🛑 Recording segment stopped");
    });
  }, [transcribeAudio]);

  // Detect voice activity using audio levels
  const detectVoiceActivity = useCallback(() => {
    if (!analyserRef.current) return false;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average volume
    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

    // Threshold for voice detection (adjust as needed)
    return average > 15;
  }, []);

  const connect = useCallback(async () => {
    if (isConnectedRef.current) {
      console.log("Already connected");
      return;
    }

    setConnectionState(SpeechRecognitionState.CONNECTING);

    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });

      streamRef.current = stream;

      // Set up audio analysis for voice activity detection
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      isConnectedRef.current = true;
      setConnectionState(SpeechRecognitionState.OPEN);

      console.log("✅ Whisper STT connected");

      // Voice activity detection loop
      let isRecording = false;
      let silenceStart = 0;
      const SILENCE_THRESHOLD = 1500; // 1.5 seconds of silence to stop

      const checkVoiceActivity = () => {
        if (!isConnectedRef.current) return;

        // Skip detection while character is speaking
        if (isCharacterSpeakingRef.current) {
          if (isRecording) {
            // Stop recording while character speaks
            mediaRecorderRef.current?.stop();
            audioChunksRef.current = [];
            isRecording = false;
          }
          silenceStart = Date.now();
          return;
        }

        const hasVoice = detectVoiceActivity();

        if (hasVoice) {
          setInterimTranscript("🎤 Listening...");
          silenceStart = 0;

          if (!isRecording && mediaRecorderRef.current?.state !== "recording") {
            // Start recording
            audioChunksRef.current = [];
            try {
              mediaRecorderRef.current?.start();
              isRecording = true;
              console.log("🎙️ Voice detected, recording...");
            } catch (e) {
              console.error("Failed to start recording:", e);
            }
          }
        } else {
          if (isRecording) {
            if (silenceStart === 0) {
              silenceStart = Date.now();
            } else if (Date.now() - silenceStart > SILENCE_THRESHOLD) {
              // Silence detected, stop and transcribe
              setInterimTranscript("Processing...");
              isRecording = false;
              silenceStart = 0;

              if (mediaRecorderRef.current?.state === "recording") {
                const recorder = mediaRecorderRef.current;
                recorder.onstop = async () => {
                  if (audioChunksRef.current.length > 0) {
                    const audioBlob = new Blob(audioChunksRef.current, {
                      type: "audio/webm",
                    });
                    await transcribeAudio(audioBlob);
                  }
                };
                recorder.stop();
                console.log("🛑 Silence detected, transcribing...");
              }
            }
          } else {
            setInterimTranscript("");
          }
        }
      };

      // Check for voice activity every 100ms
      recordingIntervalRef.current = setInterval(checkVoiceActivity, 100);
    } catch (error) {
      console.error("❌ Failed to connect:", error);
      isConnectedRef.current = false;
      setConnectionState(SpeechRecognitionState.CLOSED);
    }
  }, [detectVoiceActivity, transcribeAudio]);

  const disconnect = useCallback(() => {
    console.log("🔴 Disconnecting Whisper STT");
    isConnectedRef.current = false;

    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    audioChunksRef.current = [];
    setInterimTranscript("");
    setConnectionState(SpeechRecognitionState.CLOSED);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

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
        setCharacterSpeaking,
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
      "useSpeechRecognition must be used within WhisperSpeechContextProvider",
    );
  }
  return context;
}

export { WhisperSpeechContextProvider, useSpeechRecognition };
export default WhisperSpeechContextProvider;
