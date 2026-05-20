import type { Metadata } from "next";
import { ModulePreviewPages } from "@/app/src/data/shared/MainLayout/ModulePreviewData";
import { ModulePreviewPage } from "@/app/src/ui/shared/module-preview/ModulePreviewPage";

export const metadata: Metadata = {
	title: "Inventory | Gr8Books Lite",
	description: "Inventory module mockup for Gr8Books Lite.",
};

export default function InventoryPage() {
	return <ModulePreviewPage data={ModulePreviewPages.inventory} />;
}
