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
import { useContext, useState } from "react";
import { Button } from "../ui/button";
import { Loader2, Sparkles, Lightbulb } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserContext } from "@/app/context/UserContext";

const SUGGESTED_TOPICS: Record<string, string[]> = {
  "Mock Interview": [
    "Software Engineering at FAANG",
    "Product Manager Role",
    "Data Science Position",
    "Frontend Developer Interview",
    "Backend Engineer Role",
    "DevOps Engineer Position",
  ],
  "Q&A Preparation": [
    "JavaScript Fundamentals",
    "React Best Practices",
    "C++ Programming",
    "SQL & Database Design",
    "Python Data Structures",
    "Node.js Backend",
    "System Design Basics",
    "TypeScript Advanced",
  ],
  "Learn Language": [
    "Spanish for Beginners",
    "Business English",
    "French Conversation",
    "Mandarin Chinese Basics",
    "German Language",
    "Japanese Basics",
  ],
  "HR Round": [
    "Behavioral Questions",
    "Salary Negotiation",
    "Company Culture Fit",
    "Career Goals Discussion",
    "Conflict Resolution",
    "Leadership Skills",
  ],
};

function UserInputDialog({
  children,
  CoachingOption,
  routedetail,
}: {
  children: React.ReactNode;
  CoachingOption: string;
  routedetail:string;
}) {
  const [topic, setTopic] = useState("");
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const context = useContext(UserContext);
  const userData = context?.userData;

  // Automatically select first expert
  const selectedExpert = CoachingExperts[0]?.name || "Joanna";

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
      setTopic("");
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
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[650px] rounded-3xl border-2 bg-white text-gray-900">
          <DialogHeader className="space-y-2 pb-1">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold">
                  {CoachingOption}
                </DialogTitle>
              </div>
            </div>
            <DialogDescription className="text-sm text-muted-foreground">
              Enter a topic to master your skills in {CoachingOption}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Main Topic Input Container */}
            <div className="space-y-3 p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                  Your Session Topic
                </h3>
                <p className="text-[10px] text-gray-500">
                  Describe what you'd like to practice or learn
                </p>
              </div>

              <Textarea
                placeholder="Enter Your Topic here..."
                onChange={(e) => setTopic(e.target.value)}
                value={topic}
                className="min-h-[70px] resize-none rounded-xl text-sm border-2 focus-visible:ring-2 focus-visible:ring-primary/20 bg-white focus:bg-white transition-colors shadow-sm"
              />
            </div>

            {/* Quick Start Options Container */}
            {SUGGESTED_TOPICS[CoachingOption] && (
              <div className="space-y-3 p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-bold text-primary uppercase tracking-wide">
                      Quick Start Options
                    </h3>
                  </div>
                  <p className="text-[10px] text-gray-600">
                    Click any topic below to get started instantly
                  </p>
                </div>

                {/* Popular Topics Child Container */}
                <div className="space-y-2 p-3 rounded-xl bg-white/80 backdrop-blur-sm border border-primary/10 shadow-sm">
                  <h4 className="text-[10px] font-semibold text-gray-700 uppercase tracking-wider">
                    Popular Topics
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_TOPICS[CoachingOption].map((suggestedTopic) => (
                      <button
                        key={suggestedTopic}
                        type="button"
                        onClick={() => setTopic(suggestedTopic)}
                        className="px-3 py-1.5 text-[11px] font-medium rounded-lg border border-primary/30 bg-white text-primary hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                      >
                        {suggestedTopic}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 rounded-xl h-11 border-2 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                disabled={!topic.trim() || loading}
                onClick={onCLickNext}
                size="lg"
                className="flex-1 rounded-xl h-11 font-semibold bg-primary hover:bg-primary/90"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Starting...</span>
                  </div>
                ) : (
                  <span>Start Session</span>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UserInputDialog;
