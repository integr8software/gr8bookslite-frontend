import type { ReactNode } from "react";
import { MainLayout } from "@/app/src/ui/shared/main-layout/MainLayout";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}
