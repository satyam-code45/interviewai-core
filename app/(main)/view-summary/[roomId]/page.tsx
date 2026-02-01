"use client";
import { CoachingOptions, InterviewerLevels } from "@/utils/Options";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MessageSquare,
  FileText,
  Bot,
  User,
  CheckCircle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

interface DiscussionRoom {
  id: string;
  createdAt: Date;
  conversation?: any[];
  summary?: { content?: string };
  coachingOptions: string;
  topic: string;
  expertName: string;
  userId: string;
  interviewerLevel?: string;
}

function ViewSummary() {
  const { roomId } = useParams();
  const router = useRouter();
  const [DiscussionRoomData, setDiscussionRoomData] =
    useState<DiscussionRoom | null>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "conversation">(
    "summary",
  );

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

  const GetAbstractImages = (option: string | undefined) => {
    if (!option) return "/ab1.png";
    const coachingOption = CoachingOptions.find((item) => item.name === option);
    return coachingOption?.abstract ?? "/ab1.png";
  };

  const getLevelConfig = (level: string | undefined) => {
    if (!level) return null;
    return InterviewerLevels.find((l) => l.id === level);
  };

  const levelConfig = getLevelConfig(DiscussionRoomData?.interviewerLevel);
  const conversationCount = DiscussionRoomData?.conversation?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        {/* Header Card */}
        <div className="bg-card rounded-2xl border p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Image
                  src={GetAbstractImages(DiscussionRoomData?.coachingOptions)}
                  alt={DiscussionRoomData?.coachingOptions ?? "default"}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {DiscussionRoomData?.topic}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {DiscussionRoomData?.coachingOptions}
                  </span>
                  {levelConfig && (
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded ${levelConfig.bgColor} ${levelConfig.color}`}
                    >
                      {levelConfig.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {DiscussionRoomData && formatDate(DiscussionRoomData.createdAt)}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {DiscussionRoomData &&
                  formatTimeAgo(DiscussionRoomData.createdAt)}
              </div>
              <div className="flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4" />
                {conversationCount} messages
              </div>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("summary")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === "summary"
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <FileText className="h-4 w-4" />
            AI Feedback
          </button>
          <button
            onClick={() => setActiveTab("conversation")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === "conversation"
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Conversation
          </button>
        </div>

        {/* Content */}
        {activeTab === "summary" ? (
          <div className="bg-card rounded-2xl border p-6">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Performance Summary</h2>
                <p className="text-sm text-muted-foreground">
                  AI-generated feedback based on your interview
                </p>
              </div>
            </div>

            {DiscussionRoomData?.summary?.content ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>
                  {DiscussionRoomData.summary.content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No summary available yet.</p>
                <p className="text-sm">
                  Complete the session and generate feedback to see your
                  summary.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-card rounded-2xl border p-6">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Interview Transcript</h2>
                <p className="text-sm text-muted-foreground">
                  {conversationCount} messages exchanged
                </p>
              </div>
            </div>

            {DiscussionRoomData?.conversation &&
            DiscussionRoomData.conversation.length > 0 ? (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {DiscussionRoomData.conversation.map(
                  (msg: any, index: number) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div
                        className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          msg.role === "user" ? "bg-muted" : "bg-primary/10"
                        }`}
                      >
                        {msg.role === "user" ? (
                          <User className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Bot className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div
                        className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                          msg.role === "user"
                            ? "bg-muted text-foreground"
                            : "bg-primary/10 text-foreground"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No conversation recorded.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewSummary;
