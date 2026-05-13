"use client";

import dynamic from "next/dynamic";

export const OtpFormClientOnly = dynamic(
  () => import("@/app/src/ui/auth/OtpForm").then((module) => module.OtpForm),
  {
    ssr: false,
  },
);
