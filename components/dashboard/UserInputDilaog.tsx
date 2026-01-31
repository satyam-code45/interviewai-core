import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "../ui/textarea";
import { CoachingExperts } from "@/utils/Options";
import { BlurFade } from "../magicui/blur-fade";
import Image from "next/image";
import { useContext, useState } from "react";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserContext } from "@/app/context/UserContext";

function UserInputDialog({
  children,
  CoachingOption,
  routedetail,
}: {
  children: React.ReactNode;
  CoachingOption: string;
  routedetail:string;
}) {
  const [selectedExpert, setSelectedExpert] = useState("");
  const [topic, setTopic] = useState("");
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const context = useContext(UserContext);
  const userData = context?.userData;

  const onCLickNext = async () => {
    if (!userData) {
      console.error("❌ User data not available. Context:", context);
      alert("Please wait for user data to load or refresh the page.");
      return;
    }

    console.log("✅ User data available:", userData);
    setLoading(true);
    try {
      console.log("📤 Creating discussion room...");
      const response = await fetch("/api/discussion-rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coachingOptions: CoachingOption,
          expertName: selectedExpert,
          topic: topic,
          userId: userData.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ API error:", errorData);
        throw new Error(errorData.error || "Failed to create room");
      }

      const result = await response.json();
      console.log("✅ Room created successfully:", result);
      setOpenDialog(false);
      setLoading(false);

      // Navigate to the discussion room
      console.log("🚀 Navigating to:", `/discussion-room/${result.id}`);
      router.push(`${routedetail}/${result.id}`);

    } catch (error) {
      console.error("❌ Error creating discussion room:", error);
      alert("Failed to create discussion room. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogTrigger>{children}</DialogTrigger>
        <DialogContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-lg rounded-lg">
          <DialogHeader>
            <DialogTitle className="font-bold text-2xl">
              {CoachingOption}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="mt-2 space-y-4">
                <h2 className="font-semibold">
                  Enter a topic to master your skills in {CoachingOption}
                </h2>
                <Textarea
                  placeholder="Enter Your Topic here..."
                  onChange={(e) => setTopic(e.target.value)}
                />
                <div>
                  <h2>Select Your Tutor</h2>
                  <div className="flex gap-6 mt-3">
                    {CoachingExperts.map((expert, idx) => (
                      <div
                        key={expert.name}
                        className="flex justify-center flex-col items-center hover:scale-110 transition-all duration-300"
                        onClick={() => setSelectedExpert(expert.name)}
                      >
                        <BlurFade
                          delay={0.25 + idx * 0.05}
                          inView
                          className="flex justify-center flex-col items-center"
                        >
                          <Image
                            src={expert.avatar}
                            alt={expert.name}
                            width={100}
                            height={100}
                            className={`rounded-2xl h-[80px] w-[80px] object-cover cursor-pointer hover:scale-110 transition-all duration-300 p-2 ${selectedExpert == expert.name && "border-4 border-primary"}`}
                          />
                          <h2 className="mt-1">{expert.name}</h2>
                        </BlurFade>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-5 mt-5">
                  <DialogClose>
                    <Button variant={"outline"}>Cancel</Button>
                  </DialogClose>
                  <Button
                    disabled={!topic || !selectedExpert || loading}
                    onClick={onCLickNext}
                  >
                    {loading ? (
                      <div className="flex gap-2">
                        <Loader2 className="animate-spin" />
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      <span>Next</span>
                    )}
                  </Button>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UserInputDialog;
