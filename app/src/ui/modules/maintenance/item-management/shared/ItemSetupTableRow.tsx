import type {
	ItemSetupKind,
	ItemSetupRecord,
} from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";
import { ItemSetupRecordActions } from "./ItemSetupRecordActions";

type ItemSetupTableRowProps = {
	kind: ItemSetupKind;
	record: ItemSetupRecord;
	onDeleteRecord: (record: ItemSetupRecord) => void;
};

export function ItemSetupTableRow({
	kind,
	onDeleteRecord,
	record,
}: ItemSetupTableRowProps) {
	return (
		<tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
			<td className="px-4 py-4 font-semibold">{record.code}</td>
			<td className="px-4 py-4">
				<div className="font-medium">{record.name}</div>
				<div className="text-xs text-darknavy/55">{record.description}</div>
			</td>
			<td className="px-4 py-4">
				<span className="inline-flex rounded-full bg-skyblue/12 px-3 py-1 text-xs font-semibold text-darknavy">
					{record.status}
				</span>
			</td>
			<td className="px-4 py-4">
				<ItemSetupRecordActions
					kind={kind}
					record={record}
					onDeleteRecord={onDeleteRecord}
				/>
			</td>
		</tr>
	);
}

