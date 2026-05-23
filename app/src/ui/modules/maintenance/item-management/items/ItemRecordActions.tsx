import Link from "next/link";
import { Edit3, Eye, Trash2 } from "lucide-react";
import { ItemsHref } from "@/app/src/constants/modules/maintenance/item-management/ItemManagementConstants";
import type { ItemRecord } from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";

type ItemRecordActionsProps = {
	item: ItemRecord;
	onDeleteItem: (item: ItemRecord) => void;
};

export function ItemRecordActions({
	item,
	onDeleteItem,
}: ItemRecordActionsProps) {
	return (
		<div className="flex items-center gap-2">
			<Link
				href={`${ItemsHref}/view/${item.id}`}
				aria-label={`View ${item.name}`}
				className={tableActionClassName}
			>
				<Eye className="h-4 w-4" aria-hidden="true" />
			</Link>
			<Link
				href={`${ItemsHref}/edit/${item.id}`}
				aria-label={`Edit ${item.name}`}
				className={tableActionClassName}
			>
				<Edit3 className="h-4 w-4" aria-hidden="true" />
			</Link>
			<button
				type="button"
				onClick={() => onDeleteItem(item)}
				aria-label={`Delete ${item.name}`}
				className="inline-flex h-9 w-9 items-center justify-center rounded-md text-coralpink transition hover:bg-coralpink/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/30"
			>
				<Trash2 className="h-4 w-4" aria-hidden="true" />
			</button>
		</div>
	);
}

const tableActionClassName =
	"inline-flex h-9 w-9 items-center justify-center rounded-md text-darknavy transition hover:bg-skyblue/10 hover:text-skyblue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35";

