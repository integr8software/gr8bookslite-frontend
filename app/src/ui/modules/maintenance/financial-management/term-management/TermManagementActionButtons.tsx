import Link from "next/link";
import {
	ArrowLeft,
	CheckCircle2,
	CircleOff,
	Edit3,
	Save,
	X,
} from "lucide-react";
import { TermManagementHref } from "@/app/src/constants/modules/maintenance/financial-management/term-management/TermManagementConstants";
import type {
	TermManagement,
	TermManagementActionMode,
	TermManagementStatus,
} from "@/app/src/types/modules/maintenance/financial-management/term-management/TermManagementTypes";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

type TermManagementActionButtonsProps = {
	term?: TermManagement;
	isReadonly: boolean;
	mode: TermManagementActionMode;
	nextStatus?: TermManagementStatus;
	onStatusChange: () => void;
};

export function TermManagementActionButtons({
	term,
	isReadonly,
	mode,
	nextStatus,
	onStatusChange,
}: TermManagementActionButtonsProps) {
	const StatusIcon = nextStatus === "Inactive" ? CircleOff : CheckCircle2;
	const statusLabel =
		nextStatus === "Inactive" ? "Set as Inactive" : "Set as Active";

	return (
		<>
			{mode === "view" ? (
				<Link
					href={TermManagementHref}
					className={moduleHeaderActionClassNames.secondary}
				>
					<ArrowLeft className="h-4 w-4" aria-hidden="true" />
					Back
				</Link>
			) : null}
			{mode === "view" && term ? (
				<Link
					href={`${TermManagementHref}/edit/${term.id}`}
					className={moduleHeaderActionClassNames.secondary}
				>
					<Edit3 className="h-4 w-4" aria-hidden="true" />
					Edit
				</Link>
			) : null}
			{term && nextStatus ? (
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
			{mode === "edit" && term ? (
				<Link
					href={`${TermManagementHref}/view/${term.id}`}
					className={moduleHeaderActionClassNames.secondary}
				>
					<X className="h-4 w-4" aria-hidden="true" />
					Cancel
				</Link>
			) : null}
			{!isReadonly ? (
				<button type="submit" className={moduleHeaderActionClassNames.primary}>
					<Save className="h-4 w-4" aria-hidden="true" />
					Save Term
				</button>
			) : null}
		</>
	);
}
