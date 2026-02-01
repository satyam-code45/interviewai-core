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
import {
  CoachingExperts,
  InterviewerLevel,
  InterviewerLevels,
} from "@/utils/Options";
import { useContext, useState } from "react";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserContext } from "@/app/context/UserContext";

const SUGGESTED_TOPICS: Record<string, string[]> = {
  "Mock Interview": [
    "Software Engineering",
    "Data Structures & Algorithms",
    "Web Development",
    "Machine Learning",
    "Cloud Computing",
    "Cybersecurity",
  ],
  "Q&A Preparation": [
    "DBMS Concepts",
    "Operating Systems",
    "Computer Networks",
    "OOPs in Java/C++",
    "System Design",
    "Python Basics",
  ],
  "HR Round": [
    "Tell Me About Yourself",
    "Strengths & Weaknesses",
    "Why This Company",
    "Career Goals",
    "Team Experience",
    "Problem Solving",
  ],
};

function UserInputDialog({
  children,
  CoachingOption,
  routedetail,
}: {
  children: React.ReactNode;
  CoachingOption: string;
  routedetail: string;
}) {
  const [topic, setTopic] = useState("");
  const [selectedLevel, setSelectedLevel] =
    useState<InterviewerLevel>("intermediate");
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
          interviewerLevel: selectedLevel,
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
        <DialogContent className="sm:max-w-[520px] rounded-2xl border bg-white text-gray-900 p-5">
          <DialogHeader className="space-y-1 pb-2">
            <DialogTitle className="text-xl font-bold">
              {CoachingOption}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select difficulty and enter your topic
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {/* Interviewer Level Selection */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-700">
                Interviewer Type
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {InterviewerLevels.map((level) => (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => setSelectedLevel(level.id)}
                    className={`relative p-2.5 rounded-lg border transition-all duration-200 ${
                      selectedLevel === level.id
                        ? `${level.bgColor} ${level.borderColor} shadow-sm`
                        : "bg-gray-50 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-center">
                      <h4
                        className={`text-xs font-bold ${selectedLevel === level.id ? level.color : "text-gray-700"}`}
                      >
                        {level.name}
                      </h4>
                      <p className="text-[9px] text-gray-500 mt-0.5">
                        {level.id === "newbie"
                          ? "Easy"
                          : level.id === "intermediate"
                            ? "Medium"
                            : "Hard"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Topic Input Container */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-700">Topic</h3>
              <Textarea
                placeholder="e.g., Data Structures in Java"
                onChange={(e) => setTopic(e.target.value)}
                value={topic}
                className="min-h-[50px] resize-none rounded-lg text-sm border focus-visible:ring-1 focus-visible:ring-primary/30 bg-gray-50 focus:bg-white transition-colors"
              />
            </div>

            {/* Quick Start Options */}
            {SUGGESTED_TOPICS[CoachingOption] && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-gray-700">
                  Quick Select
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_TOPICS[CoachingOption].map((suggestedTopic) => (
                    <button
                      key={suggestedTopic}
                      type="button"
                      onClick={() => setTopic(suggestedTopic)}
                      className={`px-2.5 py-1 text-[10px] font-medium rounded-md border transition-all ${
                        topic === suggestedTopic
                          ? "bg-primary text-white border-primary"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
                      }`}
                    >
                      {suggestedTopic}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-3">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-lg h-9 border hover:bg-gray-50 font-medium"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                disabled={!topic.trim() || loading}
                onClick={onCLickNext}
                size="sm"
                className="flex-1 rounded-lg h-9 font-semibold bg-primary hover:bg-primary/90"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
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
