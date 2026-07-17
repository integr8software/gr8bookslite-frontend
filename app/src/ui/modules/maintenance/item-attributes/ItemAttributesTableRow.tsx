import type { Row } from "@tanstack/react-table";
import type { ItemAttributeRecord } from "@/app/src/types/modules/maintenance/item-attributes/ItemAttributesTypes";
import {
	ModuleTableActionButton,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";

type ItemAttributesTableRowProps = {
	row: Row<ItemAttributeRecord>;
	onEdit: (record: ItemAttributeRecord) => void;
	onToggleStatus: (record: ItemAttributeRecord) => void;
	onView: (record: ItemAttributeRecord) => void;
};

export function ItemAttributesTableRow({
	row,
	onEdit,
	onToggleStatus,
	onView,
}: ItemAttributesTableRowProps) {
	const record = row.original;

	return (
		<tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
			<td className="px-4 py-4 font-semibold">{record.name}</td>
			<td className="px-4 py-4">
				<div className="flex flex-wrap gap-1.5">
					{record.values.length > 0 ? (
						record.values.map((value) => (
							<span
								key={value}
								className="inline-flex max-w-[12rem] rounded-md bg-skyblue/10 px-2.5 py-1 text-xs font-semibold text-darknavy"
							>
								<span className="truncate">{value}</span>
							</span>
						))
					) : (
						<span className="text-sm text-darknavy/45">No values added</span>
					)}
				</div>
			</td>
			<td className="px-4 py-4 text-center">
				<ModuleStatusBadge status={record.status} />
			</td>
			<td className="px-4 py-4 text-center">
				<ModuleTableActions className="justify-center">
					<ModuleTableActionButton
						variant="view"
						label={`View ${record.name}`}
						onClick={() => onView(record)}
					/>
					<ModuleTableActionButton
						variant="edit"
						label={`Edit ${record.name}`}
						onClick={() => onEdit(record)}
					/>
					<ModuleTableActionButton
						variant={record.status === "Active" ? "inactive" : "active"}
						label={
							record.status === "Active"
								? `Set ${record.name} inactive`
								: `Set ${record.name} active`
						}
						onClick={() => onToggleStatus(record)}
					/>
				</ModuleTableActions>
			</td>
		</tr>
	);
}
