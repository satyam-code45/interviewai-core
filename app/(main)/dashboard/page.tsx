import FeatureAssistants from "@/components/dashboard/FeatureAssistants";
import Feedback from "@/components/dashboard/Feedback";
import History from "@/components/dashboard/History";

function Dashboard() {
  return (
    <div className="space-y-10">
      <FeatureAssistants />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <History />
        <Feedback />
      </div>
    </div>
  );
}

export default Dashboard;
