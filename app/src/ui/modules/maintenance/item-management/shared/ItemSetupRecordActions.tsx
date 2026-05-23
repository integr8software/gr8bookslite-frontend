import Link from "next/link";
import { Edit3, Eye, Trash2 } from "lucide-react";
import { ItemSetupConfigByKind } from "@/app/src/constants/modules/maintenance/item-management/ItemManagementConstants";
import type {
	ItemSetupKind,
	ItemSetupRecord,
} from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";

type ItemSetupRecordActionsProps = {
	kind: ItemSetupKind;
	record: ItemSetupRecord;
	onDeleteRecord: (record: ItemSetupRecord) => void;
};

export function ItemSetupRecordActions({
	kind,
	onDeleteRecord,
	record,
}: ItemSetupRecordActionsProps) {
	const href = ItemSetupConfigByKind[kind].href;

	return (
		<div className="flex items-center gap-2">
			<Link
				href={`${href}/view/${record.id}`}
				aria-label={`View ${record.name}`}
				className={tableActionClassName}
			>
				<Eye className="h-4 w-4" aria-hidden="true" />
			</Link>
			<Link
				href={`${href}/edit/${record.id}`}
				aria-label={`Edit ${record.name}`}
				className={tableActionClassName}
			>
				<Edit3 className="h-4 w-4" aria-hidden="true" />
			</Link>
			<button
				type="button"
				onClick={() => onDeleteRecord(record)}
				aria-label={`Delete ${record.name}`}
				className="inline-flex h-9 w-9 items-center justify-center rounded-md text-coralpink transition hover:bg-coralpink/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/30"
			>
				<Trash2 className="h-4 w-4" aria-hidden="true" />
			</button>
		</div>
	);
}

const tableActionClassName =
	"inline-flex h-9 w-9 items-center justify-center rounded-md text-darknavy transition hover:bg-skyblue/10 hover:text-skyblue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35";

