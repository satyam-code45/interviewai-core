"use client";
import { CoachingOptions } from "@/utils/Options";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import Image from "next/image";
import UserInputDilaog from "./UserInputDilaog";
import ProfileDialog from "./ProfileDialog";
import { useContext } from "react";
import { UserContext } from "@/app/context/UserContext";
import { useRouter } from "next/navigation";

const FeatureAssistants = () => {
  const { userData } = useContext(UserContext) ?? {};

  const router = useRouter();

  return (
    <section className="space-y-2">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Workspace
          </p>
          <h1 className="text-3xl font-semibold">
            Welcome back,{" "}
            <span className="text-primary">{userData?.name || "User"}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Select a tool to start a new session
          </p>
        </div>

        <ProfileDialog>
          <Button variant="outline">Go Back to Dashboard</Button>
        </ProfileDialog>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">


        {CoachingOptions.map((item) => {
          const card = (
            <Card
              className="
        group cursor-pointer
        rounded-xl border
        bg-background
        pt-0 px-5 pb-4
        transition-all duration-300
        hover:-translate-y-1
        hover:border-primary/40
        hover:shadow-lg
      "
            >
              <div className="flex flex-col gap-4 justify-center">
                {/* Icon */}
                <div
                  className="
            flex h-50 w-50 items-center justify-center
            rounded-lg
            bg-primary/10
            text-primary
            overflow-hidden
            transition-all duration-300
            group-hover:bg-primary/20
          "
                >
                  <div className="h-full w-full flex items-center justify-center">
                    {item.icon}
                  </div>
                </div>

                {/* Text */}
                <div className="space-y-1">
                  <p className="font-semibold leading-tight">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Start a guided session
                  </p>
                </div>
              </div>
            </Card>
          );

          // 🔥 SPECIAL CASE: Q&A → DIRECT REDIRECT
          if (item.route === "/q-and-a") {
            return (
              <div
                key={item.name}
                onClick={() => router.push(item.route)}
              >
                {card}
              </div>
            );
          }

          // ✅ DEFAULT: OPEN DIALOG
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
