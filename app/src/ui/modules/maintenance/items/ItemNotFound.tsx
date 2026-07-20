import { Package } from "lucide-react";
import { ItemsHref } from "@/app/src/constants/modules/maintenance/items/ItemManagementConstants";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";

export function ItemNotFound() {
	return (
		<ModuleNotFound
			actionHref={ItemsHref}
			actionLabel="Back to Items"
			align="center"
			className="p-8"
			description="The item may have been removed or the record identifier is invalid."
			descriptionClassName="mx-auto max-w-md"
			icon={<Package className="h-6 w-6" aria-hidden="true" />}
			iconClassName="h-12 w-12 rounded-lg bg-skyblue/12 text-skyblue"
			title="Item not found"
			titleAs="h1"
			titleClassName="mt-4 text-xl"
		/>
	);
}

