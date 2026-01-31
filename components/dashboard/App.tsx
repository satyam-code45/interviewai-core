"use client";

import { useContext, useEffect, useRef, useState, useCallback } from "react";
import {
  SpeechRecognitionState,
  useSpeechRecognition,
} from "@/app/context/ElevenLabsContextProvider";

import { fetchCoachingResponse } from "@/utils/GlobalServices";
import { CoachingExpert, CoachingExperts } from "@/utils/Options";
import ChatBox from "./ChatBox";
import { UserContext } from "@/app/context/UserContext";
import Webcam from "react-webcam";
import TalkingCharacter, {
  TalkingCharacterRef,
} from "@/components/talkchar/TalkingCharacter";
import Squares from "@/components/ui/Squares";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

interface DiscussionRoom {
  id: string;
  createdAt: Date;
  conversation?: any;
  summary?: any;
  coachingOptions: string;
  topic: string;
  expertName: string;
  userId: string;
}

type SessionPhase = "idle" | "intro" | "listening_intro" | "mock";

function App({ roomId }: { roomId: string }) {
  const [expert, setExpert] = useState<CoachingExpert | undefined>(undefined);
  const [DiscussionRoomData, setDiscussionRoomData] =
    useState<DiscussionRoom | null>(null);

  // Ref for TalkingCharacter
  const talkingCharacterRef = useRef<TalkingCharacterRef>(null);
  const [isCharacterSpeaking, setIsCharacterSpeaking] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(true);

  // Fetch discussion room data
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/discussion-rooms?id=${roomId}`);
        const data = await response.json();
        setDiscussionRoomData(data);
      } catch (error) {
        console.error("Error fetching room:", error);
      }
    };
    if (roomId) {
      fetchRoom();
    }
  }, [roomId]);

  useEffect(() => {
    if (DiscussionRoomData) {
      const foundExpert = CoachingExperts.find(
        (item) => item.name === DiscussionRoomData.expertName,
      );
      setExpert(foundExpert);
    }
  }, [DiscussionRoomData]);

  const [caption, setCaption] = useState<string | undefined>("");
  const [finalTranscript, setFinalTranscript] = useState<string>("");
  const [showFinalTranscript, setShowFinalTranscript] =
    useState<boolean>(false);
  const [finalConversation, setFinalConversation] = useState<string>("");
  const [rateLimited, setRateLimited] = useState<boolean>(false);
  const { userData, setUserData } = useContext(UserContext)!;
  const [conversation, setConversation] = useState<Message[]>([]);
  const bufferedTranscriptRef = useRef<string>("");
  const captionTimeout = useRef<NodeJS.Timeout | null>(null);
  const bufferInterval = useRef<NodeJS.Timeout | null>(null);
  const [enableFeedback, setEnableFeedback] = useState<boolean>(false);


  const [sessionPhase, setSessionPhase] = useState<SessionPhase>("idle");

  // Speech Recognition (Web Speech API - free, real-time)
  const {
    connectionState,
    connect: connectSpeechRecognition,
    disconnect: disconnectSpeechRecognition,
    addTranscriptListener,
    removeTranscriptListener,
    interimTranscript,
  } = useSpeechRecognition();

  // Track if we're processing to avoid overlapping AI requests
  const isProcessingRef = useRef(false);
  const lastProcessedTimeRef = useRef(0);

  async function handleConnect() {
    await connectSpeechRecognition();
    setSessionPhase("listening_intro");

    // Get intro message from OpenAI instead of hardcoding
    try {
      const username = userData?.name || "there";
      const introResponse = await fetchCoachingResponse({
        topic: DiscussionRoomData?.topic as string,
        coachingOption: DiscussionRoomData?.coachingOptions as string,
        message: `[SYSTEM: This is the start of the session. User's name is ${username}. Give a brief, friendly greeting and ask them to introduce themselves. Keep it short - 1-2 sentences max.]`,
      });

      const introText = introResponse.content || `Hi ${username}, let's get started. Please introduce yourself.`;

      // Deduct tokens for intro message
      await updateToken(introText);

      // Add assistant message to chat
      setConversation((prev) => [
        ...prev,
        { role: "assistant", content: introText },
      ]);

      // Use ElevenLabs TTS via TalkingCharacter (non-blocking)
      if (talkingCharacterRef.current?.isReady()) {
        talkingCharacterRef.current.speak(introText, DiscussionRoomData?.expertName);
      }
    } catch (error) {
      console.error("Error getting intro:", error);
    }
  }


  async function handleDisconnect() {
    console.log("🚫 Disconnecting...");
    setCaption("");
    disconnectSpeechRecognition();
    setShowFinalTranscript(true);
    console.log("📌 Final Transcript:", finalTranscript);
    console.log("📌 Final Conversation:", finalConversation);

    // Update conversation via API
    try {
      await fetch("/api/discussion-rooms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: DiscussionRoomData?.id, conversation }),
      });
    } catch (error) {
      console.error("Error updating conversation:", error);
    }

    setEnableFeedback(true);
  }

  const updateToken = useCallback(async (content: string) => {
    console.log("🔄 updateToken called with:", content?.substring(0, 50));
    
    if (!userData?.id) {
      console.log("⚠️ No userData.id, skipping token update");
      return;
    }
    if (typeof userData.credits !== "number") {
      console.log("⚠️ No credits number, skipping token update");
      return;
    }

    // Token count is the number of words (simple estimate)
    const tokenCount = content.trim() ? content.trim().split(/\s+/).length : 0;
    const newCredits = Math.max(userData.credits - tokenCount, 0);

    console.log(`📊 Deducting ${tokenCount} tokens. ${userData.credits} → ${newCredits}`);

    try {
      const response = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userData.id, credits: newCredits }),
      });
      
      if (!response.ok) {
        console.error("❌ Users API failed:", response.status);
        return;
      }

      setUserData((prev) =>
        prev ? { ...prev, credits: newCredits } : undefined
      );
      console.log(`✅ Token update successful. Remaining: ${newCredits}`);
    } catch (error) {
      console.error("❌ Failed to update user tokens:", error);
    }
  }, [userData?.id, userData?.credits, setUserData]);

  // Update caption with interim transcript for live display
  useEffect(() => {
    if (interimTranscript) {
      setCaption(interimTranscript);
    }
  }, [interimTranscript]);

  // Process transcript and send to AI
  const processTranscript = useCallback(async (transcriptText: string) => {
    if (!transcriptText || transcriptText.length < 2) return;
    if (rateLimited) {
      console.log("⚠️ Rate limited, skipping");
      return;
    }
    
    // Prevent rapid-fire requests (wait at least 1 second between requests)
    const now = Date.now();
    if (now - lastProcessedTimeRef.current < 1000) {
      console.log("⏳ Too fast, waiting...");
      return;
    }
    
    // If already processing, queue for later
    if (isProcessingRef.current) {
      console.log("⏳ Already processing, skipping this input");
      return;
    }

    isProcessingRef.current = true;
    lastProcessedTimeRef.current = now;
    
    console.log("📤 Processing transcript:", transcriptText);

    // Clear caption after processing
    setCaption("");

    // Get current conversation for history BEFORE adding user message
    const currentConversation = [...conversation];
    
    // Add user message to conversation
    const newUserMessage: Message = { role: "user", content: transcriptText };
    const updatedConversation = [...currentConversation, newUserMessage];
    setConversation(updatedConversation);

    // Update final transcript
    setFinalTranscript((prev) => (prev + " " + transcriptText).trim());

    console.log("📤 Sending to AI with history (", updatedConversation.length, "messages):", transcriptText);

    try {
      const aiResponse = await fetchCoachingResponse({
        topic: DiscussionRoomData?.topic as string,
        coachingOption: DiscussionRoomData?.coachingOptions as string,
        message: transcriptText,
        conversationHistory: updatedConversation, // Pass conversation history!
      });

      if (aiResponse.error) {
        console.error("⚠️ AI API error:", aiResponse.error);
        setConversation((prev) => [
          ...prev,
          { role: "assistant", content: aiResponse.error ?? "" },
        ]);

        if (aiResponse.error.includes("Rate limit")) {
          setRateLimited(true);
        }
      } else if (aiResponse.content) {
        console.log("🤖 AI Response:", aiResponse.content);
        setFinalConversation((prev) => prev + " " + aiResponse.content);
        await updateToken(aiResponse.content);

        // Add to conversation
        setConversation((prev) => [
          ...prev,
          { role: "assistant", content: aiResponse.content || "" },
        ]);

        // Speak with ElevenLabs TTS via TalkingCharacter (non-blocking to allow continuous listening)
        console.log("🔊 Speaking with ElevenLabs:", aiResponse.content);
        if (talkingCharacterRef.current?.isReady()) {
          // Don't await - let speech play while still listening
          talkingCharacterRef.current.speak(
            aiResponse.content,
            DiscussionRoomData?.expertName
          );
        }
      }
    } catch (err) {
      console.error("⚠️ AI API error:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setConversation((prev) => [
        ...prev,
        { role: "assistant", content: errorMessage },
      ]);
    } finally {
      // Always reset processing flag
      isProcessingRef.current = false;
      console.log("✅ Processing complete, ready for next input");
    }
  }, [DiscussionRoomData, rateLimited, updateToken, conversation]);

  // Listen for final transcripts from Speech Recognition
  useEffect(() => {
    if (connectionState !== SpeechRecognitionState.OPEN) return;

    // Handle final transcript
    const onTranscript = (data: { text: string; is_final: boolean }) => {
      const transcriptText = data.text.trim();
      if (!transcriptText) return;

      console.log("🎤 Final transcript received:", transcriptText, "| Processing:", isProcessingRef.current);
      
      // Process the transcript
      processTranscript(transcriptText);

      if (captionTimeout.current) clearTimeout(captionTimeout.current);
      captionTimeout.current = setTimeout(() => setCaption(undefined), 3000);
    };

    // Add listener
    addTranscriptListener(onTranscript);

    return () => {
      removeTranscriptListener(onTranscript);
      if (captionTimeout.current) clearTimeout(captionTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionState, processTranscript]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-gray-900">
      {/* Animated Squares Background */}
      <div className="absolute inset-0 z-0">
        <Squares
          speed={0.3}
          squareSize={50}
          direction="diagonal"
          borderColor="rgba(201, 151, 27, 0.15)"
          hoverFillColor="rgba(201, 151, 27, 0.1)"
        />
      </div>

      {/* Full Screen Character Container */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <TalkingCharacter
          ref={talkingCharacterRef}
          onSpeakStart={() => setIsCharacterSpeaking(true)}
          onSpeakEnd={() => setIsCharacterSpeaking(false)}
          className="w-full h-full max-w-4xl max-h-[80vh]"
        />
      </div>

      {/* Top Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4">
        <div className="flex items-center justify-between">
          {/* Session Info */}
          <div className="bg-black/40 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/10">
            <p className="text-[10px] uppercase tracking-widest text-primary font-semibold">
              SESSION
            </p>
            <h1 className="text-lg font-bold text-white">
              {DiscussionRoomData?.coachingOptions}
            </h1>
            <p className="text-xs text-white/60">{DiscussionRoomData?.topic}</p>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-3">
            {isCharacterSpeaking && (
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 backdrop-blur-md border border-primary/30 rounded-full">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-sm font-medium text-primary">
                  AI Speaking
                </span>
              </div>
            )}
            {connectionState === SpeechRecognitionState.OPEN && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 backdrop-blur-md border border-green-500/30 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-400">Live</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Webcam - Bottom Left */}
      <div className="absolute bottom-24 left-6 z-30">
        <div className="relative">
          <div className="w-40 h-32 rounded-2xl overflow-hidden border-2 border-primary/50 shadow-2xl bg-gray-800">
            <Webcam
              height={128}
              width={160}
              className="w-full h-full object-cover"
              mirrored
            />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
            <span className="text-xs text-white/80 font-medium">You</span>
          </div>
        </div>
      </div>

      {/* Caption Overlay - Bottom Center */}
      {(caption || showFinalTranscript) && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 max-w-2xl w-full px-4">
          <div className="bg-black/70 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/10">
            {caption && (
              <p className="text-white text-center text-lg">{caption}</p>
            )}
            {showFinalTranscript && !caption && (
              <p className="text-white/70 text-center text-sm">
                {finalTranscript}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Controls - Bottom Center */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
        <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/10">
          {connectionState !== SpeechRecognitionState.OPEN ? (
            <button
              onClick={handleConnect}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
              Start Interview
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                />
              </svg>
              End Interview
            </button>
          )}

          {/* Transcript Toggle */}
          <button
            onClick={() => setIsTranscriptOpen(!isTranscriptOpen)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all font-medium ${
              isTranscriptOpen
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-white/10 text-white/70 hover:bg-white/20 border border-white/10"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            Transcript
          </button>
        </div>
      </div>

      {/* Right Sidebar - Transcript Panel */}
      <div
        className={`absolute top-0 right-0 h-full z-40 transition-transform duration-300 ease-in-out ${
          isTranscriptOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="w-96 h-full bg-black/60 backdrop-blur-xl border-l border-white/10 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm uppercase tracking-wide">
                    Conversation
                  </h3>
                  <p className="text-xs text-white/50">Real-time transcript</p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsTranscriptOpen(false)}
                className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <svg
                  className="w-4 h-4 text-white/70"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 overflow-hidden p-4">
            <ChatBox
              conversation={conversation}
              coachingOption={DiscussionRoomData?.coachingOptions as string}
              enableFeedback={enableFeedback}
              id={roomId}
              content="At the end of your conversation we will automatically generate Notes/Feedback"
            />
          </div>
        </div>
      </div>

      {/* Transcript Open Button (when closed) */}
      {!isTranscriptOpen && (
        <button
          onClick={() => setIsTranscriptOpen(true)}
          className="absolute top-1/2 right-0 -translate-y-1/2 z-30 bg-primary/90 hover:bg-primary text-white p-3 rounded-l-xl shadow-lg transition-all"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

export default App;
