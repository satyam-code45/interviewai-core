"use client";
import { UserContext } from "@/app/context/UserContext";
import { CoachingOptions } from "@/utils/Options";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { Button } from "../ui/button";
import moment from "moment";
import Link from "next/link";

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

function Feedback() {
  const context = useContext(UserContext);
  const userData = context?.userData;
  const [discussionRoomList, setDiscussionRoomList] = useState<
    DiscussionRoom[]
  >([]);

  useEffect(() => {
    const GetDiscussionRooms = async () => {
      if (!userData?.id) return;

      try {
        const response = await fetch(
          `/api/discussion-rooms?userId=${userData.id}`,
        );
        const result = await response.json();
        console.log(result);
        setDiscussionRoomList(result);
      } catch (error) {
        console.error("Error fetching discussion rooms:", error);
      }
    };
    if (userData) {
      GetDiscussionRooms();
    }
  }, [userData]);

  const GetAbstractImages = (option: string) => {
    const coachingOption = CoachingOptions.find((item) => item.name === option);

    return coachingOption?.abstract ?? "/ab1.png";
  };

  return (
    <div>
      <h2 className="font-bold text-2xl">Feedback</h2>
      {discussionRoomList.length === 0 ? (
        <span className="text-gray-400">You do not have any Feedback</span>
      ) : (
        <div className="mt-5">
          {discussionRoomList.map((item) => (
            <div key={item.id}>
              {![
                "Topic Based Lecture",
                "Learn Language",
                "Meditation",
              ].includes(item.coachingOptions) && (
                <div className="flex justify-between items-center border-b-[1px]  pb-3 mb-4 group cursor-pointer">
                  <div className="flex items-center gap-3 ">
                    <Image
                      src={GetAbstractImages(item.coachingOptions)}
                      alt={item.coachingOptions}
                      width={70}
                      height={70}
                      className="rounded-full h-[50px] w-[50px]"
                    />
                    <div>
                      <h2 className="font-bold">{item.topic}</h2>
                      <h2 className="text-gray-400">{item.coachingOptions}</h2>
                      <h2 className="text-gray-400 text-sm">
                        {moment(item.createdAt).fromNow()}
                      </h2>
                    </div>
                  </div>
                  <Link href={"/view-summary/" + item.id}>
                    <Button
                      variant={"outline"}
                      className="invisible group-hover:visible"
                    >
                      View Feedback
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Feedback;
