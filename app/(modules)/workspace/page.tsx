import type { Metadata } from "next";
import { WorkspaceOverview } from "@/app/src/ui/modules/workspace/WorkspaceOverview";

export const metadata: Metadata = {
  title: "Work Space | Gr8Books Lite",
  description: "Workspace administration overview for Gr8Books Lite.",
};

export default function WorkspacePage() {
  return <WorkspaceOverview />;
}
