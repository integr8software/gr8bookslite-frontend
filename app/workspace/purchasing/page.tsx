import type { Metadata } from "next";
import { ModulePreviewPages } from "@/app/src/data/shared/MainLayout/ModulePreviewData";
import { ModulePreviewPage } from "@/app/src/ui/shared/module-preview/ModulePreviewPage";

export const metadata: Metadata = {
	title: "Purchasing | Gr8Books Lite",
	description: "Purchasing module mockup for Gr8Books Lite.",
};

export default function PurchasingPage() {
	return <ModulePreviewPage data={ModulePreviewPages.purchasing} />;
}
