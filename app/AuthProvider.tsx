"use client";
import { ReactNode, useState, useEffect } from "react";
import { UserContext, UserData } from "./context/UserContext";
import Loading from "./loading";

/**
 * Simple context provider for user data
 * User data should be set from your authenticated endpoints
 * Use setUserData() to populate user information when the app is accessed
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user data on mount
    const loadUser = async () => {
      try {
        console.log("🔄 Loading user data...");
        // For now, create/load a demo user
        // In production, you would get this from your auth system (e.g., session, JWT, etc.)
        const response = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "User",
            email: "demo@example.com", // Replace with actual user email from auth
          }),
        });

        if (response.ok) {
          const user = await response.json();
          console.log("✅ User loaded successfully:", user);
          setUserData(user);
        } else {
          console.error("❌ Failed to load user, status:", response.status);
        }
      } catch (error) {
        console.error("❌ Failed to load user:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
}
