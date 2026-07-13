import Link from "next/link";
import {
	ArrowLeft,
	Building2,
	CheckCircle2,
	CircleOff,
	Edit3,
	Save,
	X,
} from "lucide-react";
import {
	PartyManagementActionCopy,
	PartyManagementHref,
	PartyManagementParentLabel,
} from "@/app/src/constants/modules/maintenance/party-management/PartyManagementConstants";
import type {
	PartyInformationActionHeaderProps,
} from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

export function PartyInformationActionHeader({
	canSave = true,
	cancelHref,
	editHref,
	isReadonly,
	mode,
	nextStatus,
	onStatusChange,
}: PartyInformationActionHeaderProps) {
	const copy = PartyManagementActionCopy[mode];
	const StatusIcon = nextStatus === "Inactive" ? CircleOff : CheckCircle2;
	const statusLabel =
		nextStatus === "Inactive" ? "Set as Inactive" : "Set as Active";

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
					{nextStatus && onStatusChange ? (
						<button
							type="button"
							onClick={onStatusChange}
							className={
								nextStatus === "Inactive"
									? moduleHeaderActionClassNames.danger
									: moduleHeaderActionClassNames.secondary
							}
						>
							<StatusIcon className="h-4 w-4" aria-hidden="true" />
							{statusLabel}
						</button>
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
							disabled={!canSave}
							className={`${moduleHeaderActionClassNames.primary} disabled:cursor-not-allowed disabled:opacity-45`}
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
