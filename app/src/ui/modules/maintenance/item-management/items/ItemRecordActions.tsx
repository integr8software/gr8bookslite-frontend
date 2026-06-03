import { ItemsHref } from "@/app/src/constants/modules/maintenance/item-management/ItemManagementConstants";
import type { ItemRecord } from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

type ItemRecordActionsProps = {
	item: ItemRecord;
	onDeleteItem: (item: ItemRecord) => void;
};

export function ItemRecordActions({
	item,
	onDeleteItem,
}: ItemRecordActionsProps) {
	return (
		<ModuleTableActions>
			<ModuleTableActionLink
				variant="view"
				href={`${ItemsHref}/view/${item.id}`}
				label={`View ${item.name}`}
			/>
			<ModuleTableActionLink
				variant="edit"
				href={`${ItemsHref}/edit/${item.id}`}
				label={`Edit ${item.name}`}
			/>
			<ModuleTableActionButton
				variant="delete"
				onClick={() => onDeleteItem(item)}
				label={`Delete ${item.name}`}
			/>
		</ModuleTableActions>
	);
}
