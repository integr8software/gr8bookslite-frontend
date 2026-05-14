import type { ReactNode } from "react";
import { MainLayout } from "@/app/src/ui/modules/shared/MainLayout";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}
