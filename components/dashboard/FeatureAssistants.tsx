"use client";

import { CoachingOptions } from "@/utils/Options";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import UserInputDilaog from "./UserInputDilaog";
import { useContext } from "react";
import { UserContext } from "@/app/context/UserContext";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

const FeatureAssistants = () => {
  const { userData } = useContext(UserContext) ?? {};
  const router = useRouter();

  // Motivational quotes array
  const motivationalQuotes = [
    {
      quote: "Success is not final, failure is not fatal",
      author: "Winston Churchill",
    },
    {
      quote: "The only way to do great work is to love what you do",
      author: "Steve Jobs",
    },
    {
      quote: "Believe you can and you're halfway there",
      author: "Theodore Roosevelt",
    },
    { quote: "Your limitation—it's only your imagination", author: "Unknown" },
    { quote: "Dream big. Start small. Act now", author: "Robin Sharma" },
  ];

  // Get a quote based on the day
  const todayQuote =
    motivationalQuotes[new Date().getDate() % motivationalQuotes.length];

  return (
    <section className="space-y-12">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            WORKSPACE
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight">
            "{todayQuote.quote}"
          </h1>
          <p className="text-base text-muted-foreground">
            — {todayQuote.author}
          </p>
        </div>

        <Button
          variant="outline"
          size="lg"
          onClick={() => router.push("/")}
          className="
            flex items-center gap-2
            rounded-xl border-2
            px-6
            text-sm font-semibold
            transition-all duration-300
            hover:border-primary
            hover:bg-primary/5
            hover:shadow-lg
            active:scale-95
          "
        >
          ← Back to Dashboard
        </Button>
      </div>

      {/* Section Title */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Choose Your Practice Mode</h2>
        <p className="text-sm text-muted-foreground">
          Each mode is designed to help you prepare for different aspects of
          your interview journey
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CoachingOptions.map((item) => {
          const card = (
            <Card
              className="
                group cursor-pointer
                rounded-3xl border-2
                bg-card
                p-7
                transition-all duration-300
                hover:-translate-y-2
                hover:border-primary/60
                hover:shadow-2xl
                hover:shadow-primary/20
                active:scale-95
                h-full
              "
            >
              <div className="flex flex-col gap-6 h-full">
                {/* Icon */}
                <div
                  className="
                    w-full aspect-[4/3]
                    flex items-center justify-center
                    rounded-2xl
                    bg-gradient-to-br from-primary/10 via-primary/5 to-background
                    overflow-hidden
                    transition-all duration-300
                    group-hover:scale-105
                    group-hover:from-primary/20
                    group-hover:via-primary/10
                    group-hover:to-primary/5
                    shadow-inner
                  "
                >
                  <div className="h-full w-full flex items-center justify-center p-4">
                    {item.icon}
                  </div>
                </div>

                {/* Text */}
                <div className="space-y-3 flex-1">
                  <h3 className="font-bold text-xl leading-tight group-hover:text-primary transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.name === "Mock Interview" &&
                      "Practice real interview scenarios with AI-powered feedback and difficulty levels."}
                    {item.name === "Q&A Preparation" &&
                      "Master common interview questions with guided practice sessions."}
                    {item.name === "HR Round" &&
                      "Prepare for behavioral questions and culture fit discussions."}
                  </p>
                </div>

                {/* CTA */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-primary font-semibold group-hover:underline">
                      Start Session →
                    </span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      AI Powered
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );

          // 🔥 Q&A → DIRECT REDIRECT (NO DIALOG)
          if (item.route === "/q-and-a") {
            return (
              <div key={item.name} onClick={() => router.push(item.route)}>
                {card}
              </div>
            );
          }

          // ✅ Default → Open dialog
          return (
            <UserInputDilaog
              key={item.name}
              CoachingOption={item.name}
              routedetail={item.route}
            >
              {card}
            </UserInputDilaog>
          );
        })}
      </div>

      {/* Tips Section */}
      <div className="mt-8 p-6 rounded-2xl border-2 bg-gradient-to-r from-primary/5 via-background to-primary/5">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">Pro Tip</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Start with the{" "}
              <span className="text-primary font-medium">Friendly</span>{" "}
              interviewer level if you're new, then progress to{" "}
              <span className="text-primary font-medium">Strict</span> mode to
              simulate real high-pressure interviews. Your feedback will be
              saved automatically for review.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureAssistants;
