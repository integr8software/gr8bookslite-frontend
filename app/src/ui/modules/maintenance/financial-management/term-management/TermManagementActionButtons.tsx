import Link from "next/link";
import { ArrowLeft, Edit3, Save, Trash2, X } from "lucide-react";
import { TermManagementHref } from "@/app/src/constants/modules/maintenance/financial-management/term-management/TermManagementConstants";
import type {
	TermManagement,
	TermManagementActionMode,
} from "@/app/src/types/modules/maintenance/financial-management/term-management/TermManagementTypes";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

type TermManagementActionButtonsProps = {
	term?: TermManagement;
	isReadonly: boolean;
	mode: TermManagementActionMode;
	onDeleteTerm: () => void;
};

export function TermManagementActionButtons({
	term,
	isReadonly,
	mode,
	onDeleteTerm,
}: TermManagementActionButtonsProps) {
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
			{term ? (
				<button
					type="button"
					onClick={onDeleteTerm}
					className={moduleHeaderActionClassNames.danger}
				>
					<Trash2 className="h-4 w-4" aria-hidden="true" />
					Delete
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
