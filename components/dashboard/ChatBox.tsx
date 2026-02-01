import { fetchFeedback } from "@/utils/GlobalServices";
import { Button } from "../ui/button";
import { Message } from "./App";
import { useState, useRef, useEffect } from "react";
import { Loader2, Bot, User, Sparkles, CheckCircle2 } from "lucide-react";
import { InterviewerLevel, InterviewerLevels } from "@/utils/Options";

type ChatBoxProps = {
  coachingOption: string;
  conversation: Message[];
  enableFeedback: boolean;
  id: string;
  content: string;
  interviewerLevel?: InterviewerLevel;
};

function ChatBox({
  coachingOption,
  conversation,
  enableFeedback,
  id,
  content,
  interviewerLevel = "intermediate",
}: ChatBoxProps) {
  const [loading, setLoading] = useState(false);
  const [feedbackGenerated, setFeedbackGenerated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get level config for styling
  const levelConfig = InterviewerLevels.find((l) => l.id === interviewerLevel);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  const generateFeedback = async () => {
    setLoading(true);
    try {
      const result = await fetchFeedback({ coachingOption, conversation });
      console.log(result);

      // Update summary via API
      await fetch("/api/discussion-rooms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, summary: result }),
      });

      setFeedbackGenerated(true);
    } catch (error) {
      console.error("Error generating feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Interviewer Level Badge */}
      {levelConfig && (
        <div
          className={`flex items-center gap-2 px-3 py-2 mb-3 rounded-xl ${levelConfig.bgColor} ${levelConfig.borderColor} border`}
        >
          <span className="text-lg">{levelConfig.icon}</span>
          <div className="flex-1">
            <span className={`text-xs font-bold ${levelConfig.color}`}>
              {levelConfig.name} Interviewer
            </span>
            <p className="text-[10px] text-white/60">
              {levelConfig.description}
            </p>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      {conversation.length > 0 ? (
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar">
          {conversation.map((item, index) => (
            <div
              key={index}
              className={`flex ${item.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              {item.role === "assistant" && (
                <div
                  className={`h-8 w-8 rounded-xl ${levelConfig?.bgColor || "bg-primary/20"} flex items-center justify-center mr-2 flex-shrink-0`}
                >
                  <Bot
                    className={`h-4 w-4 ${levelConfig?.color || "text-primary"}`}
                  />
                </div>
              )}
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                  item.role === "user"
                    ? "bg-white/10 backdrop-blur-sm text-white border border-white/10"
                    : `${levelConfig?.bgColor || "bg-primary/20"} ${levelConfig?.borderColor || "border-primary/30"} border text-white`
                }`}
              >
                <p className="text-sm leading-relaxed">{item.content}</p>
              </div>
              {item.role === "user" && (
                <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center ml-2 flex-shrink-0">
                  <User className="h-4 w-4 text-white/70" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
          <div
            className={`h-16 w-16 rounded-2xl ${levelConfig?.bgColor || "bg-primary/20"} flex items-center justify-center`}
          >
            <Bot
              className={`h-8 w-8 ${levelConfig?.color || "text-primary"}`}
            />
          </div>
          <div className="space-y-1">
            <h2 className="font-bold text-lg text-white">Ready to Begin</h2>
            <p className="text-sm text-white/50">
              Click "Start Interview" to begin your session
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-white/10">
        {!enableFeedback ? (
          <p className="text-xs text-white/40 text-center">{content}</p>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Button
              onClick={generateFeedback}
              disabled={loading || feedbackGenerated}
              className={`w-full rounded-xl h-11 font-semibold transition-all ${
                feedbackGenerated
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-primary hover:bg-primary/90"
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating Feedback...</span>
                </div>
              ) : feedbackGenerated ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Feedback Generated</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Feedback</span>
                </div>
              )}
            </Button>
            {!feedbackGenerated && (
              <p className="text-[10px] text-white/40 text-center">
                Generate feedback once you're done with the interview
              </p>
            )}
          </div>
        )}
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}

export default ChatBox;
