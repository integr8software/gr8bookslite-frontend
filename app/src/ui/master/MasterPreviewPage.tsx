import { ModulePreviewPages } from "@/app/src/data/shared/module/ModulePreviewData";
import { ModulePreviewPage } from "@/app/src/ui/shared/module/ModulePreviewPage";

type MasterPreviewPageProps = {
	pageKey: keyof typeof ModulePreviewPages;
};

export function MasterPreviewPage({ pageKey }: MasterPreviewPageProps) {
	return <ModulePreviewPage data={ModulePreviewPages[pageKey]} />;
}
