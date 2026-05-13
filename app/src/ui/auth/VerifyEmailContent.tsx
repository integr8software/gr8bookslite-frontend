"use client";

import dynamic from "next/dynamic";

const OtpForm = dynamic(
  () => import("@/app/src/ui/auth/OtpForm").then((module) => module.OtpForm),
  {
    ssr: false,
  },
);

export function VerifyEmailContent() {
  return <OtpForm />;
}
