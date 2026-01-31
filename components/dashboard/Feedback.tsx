"use client";
import { UserContext } from "@/app/context/UserContext";
import { CoachingOptions } from "@/utils/Options";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import Link from "next/link";

function Feedback() {
  const { userData } = useContext(UserContext) ?? {};
  const [discussionRoomList, setDiscussionRoomList] = useState<any[]>([]);

  useEffect(() => {
    if (!userData?.id) return;
    fetch(`/api/discussion-rooms?userId=${userData.id}`)
      .then((res) => res.json())
      .then(setDiscussionRoomList);
  }, [userData]);

  const getImage = (option: string) =>
    CoachingOptions.find((i) => i.name === option)?.abstract ?? "/ab1.png";

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Feedback</h2>

      {discussionRoomList.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No feedback available
        </p>
      )}

      <div className="divide-y rounded-lg border">
        {discussionRoomList.map(
          (item) =>
            !["Topic Based Lecture", "Learn Language", "Meditation"].includes(
              item.coachingOptions,
            ) && (
              <Link
                key={item.id}
                href={`/view-summary/${item.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted transition"
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={getImage(item.coachingOptions)}
                    alt=""
                    width={36}
                    height={36}
                    className="rounded-full"
                  />
                  <div>
                    <p className="text-sm font-medium">{item.topic}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.coachingOptions}
                    </p>
                  </div>
                </div>

                <span className="text-xs text-muted-foreground">
                  View feedback →
                </span>
              </Link>
            ),
        )}
      </div>
    </section>
  );
}

export default Feedback;
