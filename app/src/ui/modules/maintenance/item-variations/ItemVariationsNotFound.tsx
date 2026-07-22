import { Tags } from "lucide-react";
import { ItemVariationsHref } from "@/app/src/constants/modules/maintenance/item-variations/ItemVariationsConstants";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";

export function ItemVariationsNotFound() {
	return (
		<ModuleNotFound
			actionHref={ItemVariationsHref}
			actionLabel="Back"
			align="center"
			className="p-8"
			description="The item variation may have been removed or the record identifier is invalid."
			descriptionClassName="mx-auto max-w-md"
			icon={<Tags className="h-6 w-6" aria-hidden="true" />}
			iconClassName="h-12 w-12 rounded-lg bg-skyblue/12 text-skyblue"
			title="Item variation not found"
			titleAs="h1"
			titleClassName="mt-4 text-xl"
		/>
	);
}
