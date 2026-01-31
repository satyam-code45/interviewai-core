"use client";

import ChatBox from "@/components/dashboard/ChatBox";
import SummaryBox from "@/components/dashboard/SummaryBox";
import { generateSummary } from "@/lib/generateSummary";
import { CoachingOptions } from "@/utils/Options";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Summary {
  content: string;
}

interface DiscussionRoom {
  id: string;
  createdAt: string;
  conversation?: any;
  summary?: Summary;
  coachingOptions: string;
  topic: string;
  expertName: string;
  userId: string;
}

const formatTimeAgo = (date: string) => {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  return `${diffDays} day ago`;
};

export default function ViewSummary() {
  const { roomId } = useParams() as { roomId: string };
  const [data, setData] = useState<DiscussionRoom | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;

    const fetchAndGenerateSummary = async () => {
      setLoading(true);

      const res = await fetch(`/api/discussion-rooms?id=${roomId}`);
      const room: DiscussionRoom = await res.json();

      // 🔥 AUTO-GENERATE SUMMARY IF MISSING
      if (
        room.conversation &&
        room.conversation.length > 0 &&
        !room.summary
      ) {
        const summaryText = generateSummary(room.conversation);

        await fetch("/api/discussion-rooms", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: room.id,
            summary: summaryText,
          }),
        });

        // update local state immediately
        room.summary = { content: summaryText };
      }

      setData(room);
      setLoading(false);
    };

    fetchAndGenerateSummary();
  }, [roomId]);


  const getAbstractImages = (option?: string) => {
    const found = CoachingOptions.find((o) => o.name === option);
    return found?.abstract ?? "/ab1.png";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="animate-spin h-10 w-10 rounded-full border-t-2 border-gray-500" />
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex justify-between items-center">
        <div className="flex gap-5 items-center">
          <Image
            src={getAbstractImages(data?.coachingOptions)}
            alt="icon"
            width={70}
            height={70}
            className="rounded-full"
          />
          <div>
            <h2 className="font-bold text-3xl">{data?.topic}</h2>
            <p className="text-gray-400">{data?.coachingOptions}</p>
          </div>
        </div>

        {data?.createdAt && (
          <p className="text-sm text-gray-400">
            {formatTimeAgo(data.createdAt)}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mt-5">
        <div className="col-span-3">
          <h2 className="font-semibold mb-3 px-9">Interview Summary</h2>
          <SummaryBox summary={data?.summary?.content ?? ""} />
        </div>

        <div className="col-span-2">
          {data?.conversation && (
            <>
              <h2 className="font-semibold mb-3">Conversation History</h2>
              <ChatBox
                conversation={data.conversation}
                coachingOption={data.coachingOptions}
                enableFeedback={false}
                id={data.id}
                content=""
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
