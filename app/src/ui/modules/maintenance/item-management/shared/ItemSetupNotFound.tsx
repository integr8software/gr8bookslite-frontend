import { Tags } from "lucide-react";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";

type ItemSetupNotFoundProps = {
	href: string;
	title: string;
};

export function ItemSetupNotFound({ href, title }: ItemSetupNotFoundProps) {
	return (
		<ModuleNotFound
			actionHref={href}
			actionLabel="Back"
			align="center"
			className="p-8"
			description="The setup record may have been removed or the record identifier is invalid."
			descriptionClassName="mx-auto max-w-md"
			icon={<Tags className="h-6 w-6" aria-hidden="true" />}
			iconClassName="h-12 w-12 rounded-lg bg-skyblue/12 text-skyblue"
			title={`${title} not found`}
			titleAs="h1"
			titleClassName="mt-4 text-xl"
		/>
	);
}

