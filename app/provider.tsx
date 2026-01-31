"use client";

import { AuthProvider } from "./AuthProvider";
import Loading from "./loading";
import { Suspense } from "react";

const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense fallback={<Loading />}>
      <AuthProvider>{children}</AuthProvider>
    </Suspense>
  );
};

export default Provider;
