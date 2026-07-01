import type { ReactNode } from "react";
import { LandingNavigation } from "@/app/src/ui/landing-page/LandingNavigation";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f6f9fc]">
      <LandingNavigation />
      {children}
    </div>
  );
}
