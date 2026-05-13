import type { Metadata } from "next";
import { ModulePreviewPages } from "@/app/src/data/modules/shared/ModulePreviewData";
import { ModulePreviewPage } from "@/app/src/ui/modules/shared/ModulePreviewPage";

export const metadata: Metadata = {
  title: "Audit Logs | Gr8Books Lite",
  description: "Audit logs workspace mockup for Gr8Books Lite.",
};

export default function AuditLogsPage() {
  return <ModulePreviewPage data={ModulePreviewPages.auditLogs} />;
}
