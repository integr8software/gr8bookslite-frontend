import { ArrowLeft, UserRound } from "lucide-react";
import { PartyManagementHref } from "@/app/src/constants/modules/maintenance/party-management/PartyManagementConstants";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";

export function PartyInformationNotFound() {
	return (
		<ModuleNotFound
			titleAs="h1"
			title="Party information not found"
			description="The selected party record does not exist."
			descriptionClassName="mt-1 text-sm text-darknavy/55"
			icon={<UserRound className="h-5 w-5" aria-hidden="true" />}
			actionHref={PartyManagementHref}
			actionLabel="Back to list"
			actionIcon={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}
		/>
	);
}
