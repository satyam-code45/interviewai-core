"use client";
import { ReactNode, useState } from "react";
import { UserContext, UserData } from "./context/UserContext";

/**
 * Simple context provider for user data
 * User data should be set from your authenticated endpoints
 * Use setUserData() to populate user information when the app is accessed
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData | undefined>(undefined);

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
}
