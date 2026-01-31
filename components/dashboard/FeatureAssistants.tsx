"use client";
import { CoachingOptions } from "@/utils/Options";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import Image from "next/image";
import UserInputDilaog from "./UserInputDilaog";
import ProfileDialog from "./ProfileDialog";
import { useContext } from "react";
import { UserContext } from "@/app/context/UserContext";

const FeatureAssistants = () => {
  const { userData } = useContext(UserContext) ?? {};

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

        <ProfileDialog>
          <Button
            variant="outline"
            className="whitespace-nowrap rounded-xl border-2 hover:border-primary/50 hover:shadow-md transition-all"
            size="lg"
          >
            Go Back to Dashboard
          </Button>
        </ProfileDialog>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {CoachingOptions.map((item) => (
          <UserInputDilaog key={item.name} CoachingOption={item.name}>
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
                {/* Icon Container */}
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

                {/* Text Content */}
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
          </UserInputDilaog>
        ))}
      </div>
    </section>
  );
};

export default FeatureAssistants;
