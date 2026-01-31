/**
 * User type definition
 * This represents the user details needed across the application
 */
export type User = {
  id: string;
  name: string;
  email: string;
  credits: number;
  subscription?: string | null;
  createdAt: Date;
  updatedAt: Date;
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
