"use client";

import { useContext, useEffect, useRef, useState } from "react";
import {
  SOCKET_STATES,
  LiveTranscriptionEvent,
  LiveTranscriptionEvents,
  useDeepgram,
} from "@/app/context/DeepgramContextProvider";
import {
  MicrophoneEvents,
  MicrophoneState,
  useMicrophone,
} from "@/app/context/MicrophoneContextProvider";

import { fetchCoachingResponse, speakText } from "@/utils/GlobalServices";
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
  const [conversation, setConversation] = useState<Message[]>([
    {
      role: "user",
      content: "Hey, can you help me learn TypeScript?",
    },
    {
      role: "assistant",
      content:
        "Of course! TypeScript is a typed superset of JavaScript. What would you like to focus on?",
    },
    {
      role: "user",
      content: "I want to understand types and interfaces.",
    },
    {
      role: "assistant",
      content:
        "Great! Types and interfaces both let you define the shape of objects. Would you like an example?",
    },
    {
      role: "user",
      content: "Yes, that would be helpful.",
    },
    {
      role: "assistant",
      content: `Here's a basic example:
    
type User = {
  name: string;
  age: number;
};

interface Product {
  id: number;
  name: string;
}

Both define shapes of objects, but interfaces can be extended more easily.`,
    },
  ]);
  const bufferedTranscriptRef = useRef<string>("");
  const captionTimeout = useRef<NodeJS.Timeout | null>(null);
  const bufferInterval = useRef<NodeJS.Timeout | null>(null);
  const [enableFeedback, setEnableFeedback] = useState<boolean>(false);


  const [sessionPhase, setSessionPhase] = useState<SessionPhase>("idle");


  const {
    connection,
    connectToDeepgram,
    connectionState,
    disconnectFromDeepgram,
  } = useDeepgram();
  const {
    setupMicrophone,
    microphone,
    startMicrophone,
    microphoneState,
    stopMicrophone,
  } = useMicrophone();

  async function handleConnect() {
    await setupMicrophone();

    const username = userData?.name || "there";
    const introText = `       Hi ${username}, How can I help you today?.`;

    // Add assistant message to chat
    setConversation((prev) => [
      ...prev,
      { role: "assistant", content: introText },
    ]);
 
    await speakText(introText, DiscussionRoomData?.expertName || "Female");
 
    setSessionPhase("listening_intro");
  }


  async function handleDisconnect() {
    console.log("🚫 Disconnecting...");
    setCaption("");
    await disconnectFromDeepgram();
    await stopMicrophone();
    setShowFinalTranscript(true);
    console.log("📌 Final Transcript:", finalTranscript);
    console.log("📌 Final Conversation:", finalConversation);
    clearInterval(bufferInterval.current!);

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

  const updateToken = async (content: string) => {
    if (!userData?.id || typeof userData.credits !== "number") return;

    // Token count is the number of words (simple estimate)
    const tokenCount = content.trim() ? content.trim().split(/\s+/).length : 0;

    const newCredits = Math.max(userData.credits - tokenCount, 0); // prevent negative credits

    try {
      await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userData.id, credits: newCredits }),
      });

      setUserData(
        (prev) =>
          prev
            ? {
              ...prev,
              credits: newCredits,
            }
            : undefined, // In case `prev` was undefined, keep it that way
      );
      console.log(`Deducted ${tokenCount} tokens. Remaining: ${newCredits}`);
    } catch (error) {
      console.error("Failed to update user tokens:", error);
    }
  };

  useEffect(() => {
    if (microphoneState === MicrophoneState.Ready) {
      console.log("🎙️ Microphone ready. Connecting to Deepgram...");
      connectToDeepgram({
        model: "nova-3",
        interim_results: true,
        smart_format: true,
        filler_words: true,
        utterance_end_ms: 3000,
      });
    }
    console.log("🎙️ Microphone ready. Connected to Deepgram...");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [microphoneState]);

  useEffect(() => {
    if (!microphone || !connection) return;

    const onData = (e: BlobEvent) => {
      if (e.data.size > 0) {
        connection?.send(e.data);
      }
    };

    const onTranscript = (data: LiveTranscriptionEvent) => {
      const thisCaption = data.channel.alternatives[0]?.transcript.trim() || "";
      const { is_final: isFinal } = data;

      if (!thisCaption) return;

      setCaption(thisCaption);

      setFinalTranscript((prev) => {
        const prevWords = prev.split(" ");
        const captionWords = thisCaption.split(" ");

        if (
          !prevWords.slice(-captionWords.length).join(" ").includes(thisCaption)
        ) {
          return (prev + " " + thisCaption).trim();
        }
        return prev;
      });

      if (isFinal) {
        if (!bufferedTranscriptRef.current.endsWith(thisCaption)) {
          bufferedTranscriptRef.current += " " + thisCaption;
        }
      }

      if (captionTimeout.current) clearTimeout(captionTimeout.current);
      captionTimeout.current = setTimeout(() => setCaption(undefined), 3000);
    };

    if (connectionState === SOCKET_STATES.open) {
      connection.addListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.addEventListener(MicrophoneEvents.DataAvailable, onData);
      startMicrophone();

      bufferInterval.current = setInterval(async () => {
        if (rateLimited) return;

        const bufferedMessage = bufferedTranscriptRef.current.trim();
        setConversation((prev) => [
          ...prev,
          {
            role: "user",
            content: bufferedMessage,
          },
        ]);
        if (bufferedMessage) {
          console.log("📤 Sending to Gemini:", bufferedMessage);
          try {
            const aiResponse = await fetchCoachingResponse({
              topic: DiscussionRoomData?.topic as string,
              coachingOption: DiscussionRoomData?.coachingOptions as string,
              message: bufferedMessage,
            });

            if (aiResponse.error) {
              console.error("⚠️ Gemini API error:", aiResponse.error);
              setFinalConversation((prev) => prev + " " + aiResponse.error);
              setConversation((prev) => [
                ...prev,
                {
                  role: "assistant",
                  content: aiResponse.error ?? "",
                },
              ]);

              if (aiResponse.error.includes("Rate limit exceeded")) {
                console.warn("🚨 Rate limit reached! Stopping API calls.");
                setRateLimited(true);
              }
            } else if (aiResponse.content) {
              console.log("🤖 Gemini Response:", aiResponse.content);
              setFinalConversation((prev) => prev + " " + aiResponse.content);

              //update user credits
              await updateToken(aiResponse.content as string);

              // Add to conversation first
              setConversation((prev) => [
                ...prev,
                {
                  role: "assistant",
                  content: aiResponse.content || "",
                },
              ]);

              // Use TalkingCharacter for speech with lip sync
              console.log(
                "🔊 Speaking with TalkingCharacter:",
                aiResponse.content,
              );
              if (talkingCharacterRef.current?.isReady()) {
                talkingCharacterRef.current
                  .speak(aiResponse.content as string)
                  .then((success) => {
                    if (success) {
                      console.log("✅ TalkingCharacter speech completed");
                    } else {
                      console.error("❌ TalkingCharacter speech failed");
                    }
                  })
                  .catch((err) => {
                    console.error("❌ TalkingCharacter error:", err);
                  });
              } else {
                console.warn("⚠️ TalkingCharacter not ready, using fallback");
                // Fallback to basic speech
                const utter = new SpeechSynthesisUtterance(
                  aiResponse.content as string,
                );
                utter.rate = 0.9;
                window.speechSynthesis.speak(utter);
              }
            }
          } catch (err) {
            console.error("⚠️ Gemini API error:", err);
            const errorMessage =
              err instanceof Error ? err.message : String(err);
            setFinalConversation((prev) => prev + " " + errorMessage);
            setConversation((prev) => [
              ...prev,
              {
                role: "assistant",
                content: errorMessage,
              },
            ]);
          }
          bufferedTranscriptRef.current = "";
        }
      }, 20000);
    }

    return () => {
      connection.removeListener(
        LiveTranscriptionEvents.Transcript,
        onTranscript,
      );
      microphone.removeEventListener(MicrophoneEvents.DataAvailable, onData);
      if (captionTimeout.current) clearTimeout(captionTimeout.current);
      if (bufferInterval.current) clearInterval(bufferInterval.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionState, rateLimited]);

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
            {microphoneState === MicrophoneState.Open && (
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
          {microphoneState !== MicrophoneState.Open ? (
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
