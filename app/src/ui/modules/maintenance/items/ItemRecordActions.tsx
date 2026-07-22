import { ItemsHref } from "@/app/src/constants/modules/maintenance/items/ItemManagementConstants";
import type { ItemRecord } from "@/app/src/types/modules/maintenance/items/ItemManagementTypes";
import {
  ModuleTableActionButton,
  ModuleTableActionLink,
  ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

type ItemRecordActionsProps = {
  item: ItemRecord;
  onStatusChange: (item: ItemRecord) => void;
};

export function ItemRecordActions({ item, onStatusChange }: ItemRecordActionsProps) {
  return (
    <ModuleTableActions className="!justify-center">
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
        variant={item.status === "Active" ? "inactive" : "active"}
        onClick={() => onStatusChange(item)}
        label={item.status === "Active" ? `Set ${item.name} inactive` : `Reactivate ${item.name}`}
      />
    </ModuleTableActions>
  );
}
