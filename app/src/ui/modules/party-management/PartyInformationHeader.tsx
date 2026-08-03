import Link from "next/link";
import { Building2, Plus, Upload } from "lucide-react";
import {
	PartyInformationDescription,
	PartyInformationTitle,
	PartyManagementHref,
	PartyManagementParentLabel,
} from "@/app/src/constants/modules/party-management/PartyManagementConstants";
import type { PartyInformationHeaderProps } from "@/app/src/types/modules/party-management/PartyManagementTypes";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

export function PartyInformationHeader({ onImport }: PartyInformationHeaderProps) {
	return (
		<ModuleHeader
			variant="panel"
			titleAs="h1"
			title={PartyInformationTitle}
			description={PartyInformationDescription}
			actionsClassName="w-full justify-start sm:ml-auto sm:w-auto sm:justify-end sm:self-start"
			eyebrow={
				<>
					<Building2 className="h-3.5 w-3.5" aria-hidden="true" />
					{PartyManagementParentLabel}
				</>
			}
			actions={
				<>
					<button
						type="button"
						onClick={onImport}
						className={`${moduleHeaderActionClassNames.secondary} order-2 sm:order-1`}
					>
						<Upload className="h-4 w-4" aria-hidden="true" />
						Import
					</button>
					<Link
						href={`${PartyManagementHref}/add`}
						className={`${moduleHeaderActionClassNames.primary} order-1 sm:order-2`}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add Party
					</Link>
				</>
			}
		/>
	);
}
