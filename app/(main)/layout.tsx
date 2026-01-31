import Navbar from "@/components/global/Navbar";
import { MicrophoneContextProvider } from "../context/MicrophoneContextProvider";
import { DeepgramContextProvider } from "../context/DeepgramContextProvider";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {/* <Navbar /> */}
      <div className="p-10  md:px-20 lg:px-25 xl:px-30 2xl:72">
        <MicrophoneContextProvider>
          <DeepgramContextProvider>{children}</DeepgramContextProvider>
        </MicrophoneContextProvider>
      </div>
    </div>
  );
}

export default DashboardLayout;
