import { UserContext } from "@/app/context/UserContext";
import Image from "next/image";
import { useContext } from "react";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import { Wallet2 } from "lucide-react";

function Credits() {
  const context = useContext(UserContext);
  const userData = context?.userData;

  // Early return if no user data
  if (!userData) {
    return (
      <div className="p-4">
        <p className="text-gray-500">Loading user data...</p>
      </div>
    );
  }

  const userInitial = userData.name.trim().charAt(0).toUpperCase();

  const calculateProgress = () => {
    const max = userData.subscription ? 50000 : 5000;
    const rawProgress = (Number(userData.credits) / max) * 100;
    const clamped = Math.min(rawProgress, 100);
    console.log(
      "credits:",
      userData.credits,
      "rawProgress:",
      rawProgress,
      "clamped:",
      clamped,
    );
    return clamped;
  };

  return (
    <div>
      <div>
        <div className="flex gap-5 items-center">
          <div className="w-15 h-15 rounded-full bg-primary flex items-center justify-center text-white font-bold text-2xl">
            {userInitial}
          </div>
          <div>
            <h2 className="text-lg font-bold">{userData.name}</h2>
            <h2 className="text-gray-500">{userData.email}</h2>
          </div>
        </div>
        <hr className="my-3" />
        <div>
          <h2 className="font-bold">Token Usage:</h2>
          <h2>
            {" "}
            {userData.credits}/{userData.subscription ? "50,000" : "5000"}
          </h2>
          <Progress value={calculateProgress()} max={100} className="my-3" />
        </div>
        <div className="flex justify-between items-center mx-auto mt-3">
          <h2 className="font-bold">Current Plan</h2>
          <h2 className="text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1 text-sm font-semibold">
            {userData.subscription ? "Pro" : "Free"}
          </h2>
        </div>

        <div className="mt-5 border rounded-xl p-5">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bold">Pro Plan</h2>
              <h2>50,000</h2>
            </div>
            <h2 className="font-bold">$10/month</h2>
          </div>
          <hr className="my-3" />
          <Button className="w-full">
            {" "}
            <Wallet2 /> Upgrade $10
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Credits;
