"use client";
import { UserContext } from "@/app/context/UserContext";
import { CoachingOptions, InterviewerLevels } from "@/utils/Options";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Clock, ArrowRight, History } from "lucide-react";

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

  const getLevelConfig = (level: string) =>
    InterviewerLevels.find((l) => l.id === level);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <History className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Session History</h2>
            <p className="text-sm text-muted-foreground">
              View your session summaries and performance insights
            </p>
          </div>
        </div>
        {discussionRoomList.length > 0 && (
          <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
            {
              discussionRoomList.filter(
                (item) =>
                  ![
                    "Topic Based Lecture",
                    "Learn Language",
                    "Meditation",
                  ].includes(item.coachingOptions),
              ).length
            }{" "}
            sessions
          </span>
        )}
      </div>

      {discussionRoomList.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed bg-gradient-to-br from-muted/30 to-muted/10 p-16 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FileText className="h-8 w-8 text-primary/60" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-muted-foreground">
                No feedback available yet
              </p>
              <p className="text-sm text-muted-foreground/70 max-w-md">
                Complete your first interview session above to receive
                personalized AI-powered feedback and performance insights
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
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
                  <div className="flex items-center gap-5">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-inner">
                      <Image
                        src={getImage(item.coachingOptions)}
                        alt=""
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-base font-bold group-hover:text-primary transition-colors">
                        {item.topic}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded">
                          {item.coachingOptions}
                        </span>
                        {item.interviewerLevel && (
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded ${getLevelConfig(item.interviewerLevel)?.bgColor} ${getLevelConfig(item.interviewerLevel)?.color}`}
                          >
                            {getLevelConfig(item.interviewerLevel)?.icon}{" "}
                            {getLevelConfig(item.interviewerLevel)?.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(item.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      View <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              ),
          )}
        </div>
      )}
    </section>
  );
}

export default Feedback;
