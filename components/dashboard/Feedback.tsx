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
    <section className="space-y-8">
      <div className="pb-4">
        <h2 className="text-3xl font-bold">Feedback</h2>
        <p className="text-sm text-muted-foreground mt-2">
          View your session summaries and performance insights
        </p>
      </div>

      {discussionRoomList.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed bg-muted/20 p-12 text-center">
          <p className="text-sm text-muted-foreground font-medium">
            No feedback available yet
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Complete a session to see your feedback here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {discussionRoomList.map(
            (item) =>
              !["Topic Based Lecture", "Learn Language", "Meditation"].includes(
                item.coachingOptions,
              ) && (
                <Link
                  key={item.id}
                  href={`/view-summary/${item.id}`}
                  className="group flex items-center justify-between px-6 py-5 rounded-2xl border-2 bg-card hover:border-primary/60 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-inner">
                      <Image
                        src={getImage(item.coachingOptions)}
                        alt=""
                        width={56}
                        height={56}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold mb-1.5 group-hover:text-primary transition-colors">
                        {item.topic}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium">
                        {item.coachingOptions}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                    View feedback →
                  </span>
                </Link>
              ),
          )}
        </div>
      )}
    </section>
  );
}

export default Feedback;
