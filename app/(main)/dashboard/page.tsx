import FeatureAssistants from "@/components/dashboard/FeatureAssistants";
import Feedback from "@/components/dashboard/Feedback";

function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-6 py-10 space-y-16">
        <FeatureAssistants />

        <div className="max-w-5xl mx-auto">
          <Feedback />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
