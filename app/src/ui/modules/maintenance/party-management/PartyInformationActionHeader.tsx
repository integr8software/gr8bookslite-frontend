import Link from "next/link";
import { ArrowLeft, Building2, Edit3, Save, X } from "lucide-react";
import {
	PartyManagementActionCopy,
	PartyManagementHref,
	PartyManagementParentLabel,
} from "@/app/src/constants/modules/maintenance/party-management/PartyManagementConstants";
import type { PartyInformationActionMode } from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

export function PartyInformationActionHeader({
	cancelHref,
	editHref,
	isReadonly,
	mode,
}: {
	cancelHref: string;
	editHref?: string;
	isReadonly: boolean;
	mode: PartyInformationActionMode;
}) {
	const copy = PartyManagementActionCopy[mode];

	return (
		<ModuleHeader
			variant="panel"
			titleAs="h1"
			title={copy.title}
			description={copy.description}
			className="w-full"
			actionsClassName="max-w-full justify-start md:ml-auto md:self-end md:justify-end lg:self-auto"
			eyebrow={
				<>
					<Building2 className="h-3.5 w-3.5" aria-hidden="true" />
					{PartyManagementParentLabel}
				</>
			}
			actions={
				<>
					{mode === "view" ? (
						<Link
							href={PartyManagementHref}
							className={moduleHeaderActionClassNames.secondary}
						>
							<ArrowLeft className="h-4 w-4" aria-hidden="true" />
							Back
						</Link>
					) : null}
					{mode === "view" && editHref ? (
						<Link
							href={editHref}
							className={moduleHeaderActionClassNames.secondary}
						>
							<Edit3 className="h-4 w-4" aria-hidden="true" />
							Edit
						</Link>
					) : null}
					{mode !== "view" ? (
						<Link
							href={cancelHref}
							className={moduleHeaderActionClassNames.secondary}
						>
							<X className="h-4 w-4" aria-hidden="true" />
							Cancel
						</Link>
					) : null}
					{!isReadonly ? (
						<button
							type="submit"
							className={moduleHeaderActionClassNames.primary}
						>
							<Save className="h-4 w-4" aria-hidden="true" />
							Save Party
						</button>
					) : null}
				</>
			}
		/>
	);
}
