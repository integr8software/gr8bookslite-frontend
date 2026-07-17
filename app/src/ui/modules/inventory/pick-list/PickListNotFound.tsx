import { FileX2 } from "lucide-react";
import { PickListHref } from "@/app/src/constants/modules/inventory/pick-list/PickListConstants";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";

export function PickListNotFound() {
	return (
		<ModuleNotFound
			actionHref={PickListHref}
			actionLabel="Back to pick lists"
			icon={<FileX2 className="h-5 w-5" aria-hidden="true" />}
			title="Pick list not found"
			description="The pick list may have been removed or the link is no longer valid."
		/>
	);
}
