"use client";
import { UserContext } from "@/app/context/UserContext";
import { CoachingOptions } from "@/utils/Options";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import Link from "next/link";

function History() {
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
    <section className="space-y-6">
      <div className="border-b pb-3">
        <h2 className="text-2xl font-bold">History</h2>
      </div>

      <div className="space-y-3">
        {discussionRoomList.filter((item) =>
          ["Topic Based Lecture", "Learn Language", "Meditation"].includes(
            item.coachingOptions,
          ),
        ).length === 0 ? (
          <div className="rounded-xl border-2 border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No history available
            </p>
          </div>
        ) : (
          discussionRoomList.map(
            (item) =>
              ["Topic Based Lecture", "Learn Language", "Meditation"].includes(
                item.coachingOptions,
              ) && (
                <Link
                  key={item.id}
                  href={`/view-summary/${item.id}`}
                  className="group flex items-center justify-between px-5 py-4 rounded-xl border-2 bg-card hover:border-primary/50 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                      <Image
                        src={getImage(item.coachingOptions)}
                        alt=""
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-1">{item.topic}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.coachingOptions}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                    View notes →
                  </span>
                </Link>
              ),
          )
        )}
      </div>
    </section>
  );
}

export default History;
