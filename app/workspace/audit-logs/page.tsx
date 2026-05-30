import type { Metadata } from "next";
import { ModulePreviewPages } from "@/app/src/data/shared/module/ModulePreviewData";
import { ModulePreviewPage } from "@/app/src/ui/shared/module/ModulePreviewPage";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";

export const metadata: Metadata = {
	title: `Audit Logs | ${AppName}`,
	description: `Audit logs workspace mockup for ${AppName}.`,
};

export default function AuditLogsPage() {
	// throw new Error("Testing error page");

	return <ModulePreviewPage data={ModulePreviewPages.auditLogs} />;
}
