import { ModulePreviewPages } from "@/app/src/data/shared/workspace/workspace-placeholder/WorkspacePlaceholderData";
import { ModulePreviewPage } from "@/app/src/ui/shared/workspace/workspace-placeholder/WorkspacePlaceholderPage";

type MasterPreviewPageProps = {
	pageKey: keyof typeof ModulePreviewPages;
};

export function MasterPreviewPage({ pageKey }: MasterPreviewPageProps) {
	return <ModulePreviewPage data={ModulePreviewPages[pageKey]} />;
}
