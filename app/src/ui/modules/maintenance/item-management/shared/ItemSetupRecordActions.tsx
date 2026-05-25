import { ItemSetupConfigByKind } from "@/app/src/constants/modules/maintenance/item-management/ItemManagementConstants";
import type {
	ItemSetupKind,
	ItemSetupRecord,
} from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/ModuleTableActions";

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
		<ModuleTableActions>
			<ModuleTableActionLink
				variant="view"
				href={`${href}/view/${record.id}`}
				label={`View ${record.name}`}
			/>
			<ModuleTableActionLink
				variant="edit"
				href={`${href}/edit/${record.id}`}
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
