import Navbar from "@/components/global/Navbar";
import { SpeechContextProvider } from "../context/ElevenLabsContextProvider";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {/* <Navbar /> */}
      <div className="p-10  md:px-20 lg:px-25 xl:px-30 2xl:72">
        <SpeechContextProvider>{children}</SpeechContextProvider>
      </div>
    </div>
  );
}

export default DashboardLayout;
