import Link from "next/link";
import { ArrowLeft, Edit3, Save, Trash2, X } from "lucide-react";
import type {
	ItemActionMode,
	ItemSetupRecord,
} from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

type ItemSetupActionButtonsProps = {
	href: string;
	isReadonly: boolean;
	mode: ItemActionMode;
	record?: ItemSetupRecord;
	onDeleteRecord: () => void;
};

export function ItemSetupActionButtons({
	href,
	isReadonly,
	mode,
	onDeleteRecord,
	record,
}: ItemSetupActionButtonsProps) {
	return (
		<>
			<Link href={href} className={moduleHeaderActionClassNames.secondary}>
				<ArrowLeft className="h-4 w-4" aria-hidden="true" />
				Back
			</Link>
			{mode === "view" && record ? (
				<Link
					href={`${href}/edit/${record.id}`}
					className={moduleHeaderActionClassNames.secondary}
				>
					<Edit3 className="h-4 w-4" aria-hidden="true" />
					Edit
				</Link>
			) : null}
			{record ? (
				<button
					type="button"
					onClick={onDeleteRecord}
					className={moduleHeaderActionClassNames.danger}
				>
					<Trash2 className="h-4 w-4" aria-hidden="true" />
					Delete
				</button>
			) : null}
			{mode === "edit" && record ? (
				<Link
					href={`${href}/view/${record.id}`}
					className={moduleHeaderActionClassNames.secondary}
				>
					<X className="h-4 w-4" aria-hidden="true" />
					Cancel
				</Link>
			) : null}
			{!isReadonly ? (
				<button type="submit" className={moduleHeaderActionClassNames.primary}>
					<Save className="h-4 w-4" aria-hidden="true" />
					Save
				</button>
			) : null}
		</>
	);
}

