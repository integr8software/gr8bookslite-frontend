import Link from "next/link";
import { ArrowLeft, Edit3, Save, Trash2, X } from "lucide-react";
import { ItemsHref } from "@/app/src/constants/modules/maintenance/item-management/ItemManagementConstants";
import type {
	ItemActionMode,
	ItemRecord,
} from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

type ItemActionButtonsProps = {
	isReadonly: boolean;
	item?: ItemRecord;
	mode: ItemActionMode;
	onDeleteItem: () => void;
};

export function ItemActionButtons({
	isReadonly,
	item,
	mode,
	onDeleteItem,
}: ItemActionButtonsProps) {
	return (
		<>
			<Link href={ItemsHref} className={moduleHeaderActionClassNames.secondary}>
				<ArrowLeft className="h-4 w-4" aria-hidden="true" />
				Back
			</Link>
			{mode === "view" && item ? (
				<Link
					href={`${ItemsHref}/edit/${item.id}`}
					className={moduleHeaderActionClassNames.secondary}
				>
					<Edit3 className="h-4 w-4" aria-hidden="true" />
					Edit
				</Link>
			) : null}
			{item ? (
				<button
					type="button"
					onClick={onDeleteItem}
					className={moduleHeaderActionClassNames.danger}
				>
					<Trash2 className="h-4 w-4" aria-hidden="true" />
					Delete
				</button>
			) : null}
			{mode === "edit" && item ? (
				<Link
					href={`${ItemsHref}/view/${item.id}`}
					className={moduleHeaderActionClassNames.secondary}
				>
					<X className="h-4 w-4" aria-hidden="true" />
					Cancel
				</Link>
			) : null}
			{!isReadonly ? (
				<button type="submit" className={moduleHeaderActionClassNames.primary}>
					<Save className="h-4 w-4" aria-hidden="true" />
					Save Item
				</button>
			) : null}
		</>
	);
}

