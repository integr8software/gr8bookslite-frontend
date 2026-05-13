import type { ReactNode } from "react";
import { WorkspaceLayout } from "@/app/src/ui/modules/shared/WorkspaceLayout";

export default function ModulesLayout({ children }: { children: ReactNode }) {
  return <WorkspaceLayout>{children}</WorkspaceLayout>;
}
