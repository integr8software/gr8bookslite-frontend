import Link from "next/link";
import { Building2, Plus } from "lucide-react";
import {
	PartyInformationDescription,
	PartyInformationTitle,
	PartyManagementHref,
	PartyManagementParentLabel,
} from "@/app/src/constants/modules/party-management/PartyManagementConstants";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

export function PartyInformationHeader() {
	return (
		<ModuleHeader
			variant="panel"
			titleAs="h1"
			title={PartyInformationTitle}
			description={PartyInformationDescription}
			eyebrow={
				<>
					<Building2 className="h-3.5 w-3.5" aria-hidden="true" />
					{PartyManagementParentLabel}
				</>
			}
			actions={
				<Link
					href={`${PartyManagementHref}/add`}
					className={moduleHeaderActionClassNames.primary}
				>
					<Plus className="h-4 w-4" aria-hidden="true" />
					Add Party
				</Link>
			}
		/>
	);
}
