import { Id } from "@/convex/_generated/dataModel";

/**
 * User type definition
 * This represents the user details needed across the application
 */
export type User = {
  _id: Id<"users">;
  _creationTime: number;
  subscription?: string;
  name: string;
  email: string;
  credits: number;
};

/**
 * Helper function to get user from session or props
 * Since this app is only accessed from authenticated endpoints,
 * user data should be passed from the parent/authenticated context
 */
export function getUser(): User | null {
  // This is a placeholder - actual implementation depends on how
  // user data is passed from authenticated endpoints
  // Could be from props, context, or session storage
  return null;
}
