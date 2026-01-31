"use client";
import ChatBox from "@/components/dashboard/ChatBox";
import SummaryBox from "@/components/dashboard/SummaryBox";
import { CoachingOptions } from "@/utils/Options";
import moment from "moment";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface DiscussionRoom {
  id: string;
  createdAt: Date;
  conversation?: unknown;
  summary?: unknown;
  coachingOptions: string;
  topic: string;
  expertName: string;
  userId: string;
}

function ViewSummary() {
  const { roomId } = useParams();
  const [DiscussionRoomData, setDiscussionRoomData] =
    useState<DiscussionRoom | null>(null);

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

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-5 items-center ">
          <Image
            src={GetAbstractImages(DiscussionRoomData?.coachingOptions)}
            alt={DiscussionRoomData?.coachingOptions ?? "default"}
            width={100}
            height={100}
            className="rounded-full h-[70px] w-[70px]"
          />
          <div>
            <h2 className="font-bold text-4xl">{DiscussionRoomData?.topic}</h2>
            <h2 className="text-gray-400">
              {DiscussionRoomData?.coachingOptions}
            </h2>
          </div>
        </div>
        <h2 className="text-gray-400 text-sm">
          {DiscussionRoomData && moment(DiscussionRoomData.createdAt).fromNow()}
        </h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mt-5">
        <div className="col-span-3">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Summary of Your Conversation
          </h2>
          <SummaryBox summary={DiscussionRoomData?.summary.content} />
        </div>
        <div className="col-span-2">
          {DiscussionRoomData?.conversation && (
            <div>
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
                Your Conversation
              </h2>
              <ChatBox
                conversation={DiscussionRoomData?.conversation}
                coachingOption={DiscussionRoomData?.coachingOptions as string}
                enableFeedback={false}
                id={DiscussionRoomData?._id as string}
                content=""
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewSummary;
