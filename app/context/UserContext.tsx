"use client";
import { createContext, Dispatch, SetStateAction } from "react";

// Define your user type
export type UserData = {
  id: string;
  name: string;
  email: string;
  credits: number;
  subscription?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Define the context type
interface IUserContext {
  userData: UserData | undefined;
  setUserData: Dispatch<SetStateAction<UserData | undefined>>;
}

// Create the context with a default value of null
export const UserContext = createContext<IUserContext | null>(null);
