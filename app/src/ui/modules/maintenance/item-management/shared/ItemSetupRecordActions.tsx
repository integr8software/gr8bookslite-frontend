import { ItemSetupConfigByKind } from "@/app/src/constants/modules/maintenance/item-management/ItemManagementConstants";
import type {
	ItemSetupKind,
	ItemSetupRecord,
} from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

type ItemSetupRecordActionsProps = {
	kind: ItemSetupKind;
	record: ItemSetupRecord;
	onDeleteRecord: (record: ItemSetupRecord) => void;
	onEditRecord: () => void;
};

export function ItemSetupRecordActions({
	kind,
	onDeleteRecord,
	onEditRecord,
	record,
}: ItemSetupRecordActionsProps) {
	const href = ItemSetupConfigByKind[kind].href;

	return (
		<ModuleTableActions>
			<ModuleTableActionLink
				variant="view"
				href={`${href}/view/${record.id}`}
				label={`View ${record.name}`}
			/>
			<ModuleTableActionButton
				variant="edit"
				onClick={onEditRecord}
				label={`Edit ${record.name}`}
			/>
			<ModuleTableActionButton
				variant="delete"
				onClick={() => onDeleteRecord(record)}
				label={`Delete ${record.name}`}
			/>
		</ModuleTableActions>
	);
}
