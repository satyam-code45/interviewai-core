"use client";

import { CoachingOptions } from "@/utils/Options";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import UserInputDilaog from "./UserInputDilaog";
import ProfileDialog from "./ProfileDialog";
import { useContext } from "react";
import { UserContext } from "@/app/context/UserContext";
import { useRouter } from "next/navigation";

const FeatureAssistants = () => {
  const { userData } = useContext(UserContext) ?? {};
  const router = useRouter();

  return (
    <section className="space-y-10">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            WORKSPACE
          </p>
          <h1 className="text-5xl font-extrabold tracking-tight">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {userData?.name || "User"}
            </span>
          </h1>
          <p className="text-base text-muted-foreground">
            Select a tool to start a new session
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

      {/* Tools Grid */}
      <div className="flex justify-between px-20">
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
              "
            >
              <div className="flex flex-col gap-6">
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
                <div className="space-y-2">
                  <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Start a guided session
                  </p>
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
    </section>
  );
};

export default FeatureAssistants;
