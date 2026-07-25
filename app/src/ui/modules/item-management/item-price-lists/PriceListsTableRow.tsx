import type { Row } from "@tanstack/react-table";
import type { PriceListRecord } from "@/app/src/types/modules/item-management/item-price-lists/PriceListsTypes";
import {
  ModuleTableActionButton,
  ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";

type PriceListsTableRowProps = {
  row: Row<PriceListRecord>;
  onEdit: (record: PriceListRecord) => void;
  onToggleStatus: (record: PriceListRecord) => void;
  onView: (record: PriceListRecord) => void;
};

export function PriceListsTableRow({
  row,
  onEdit,
  onToggleStatus,
  onView,
}: PriceListsTableRowProps) {
  const record = row.original;

  return (
    <tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
      <td className="px-4 py-4 font-semibold">{record.code}</td>
      <td className="px-4 py-4 font-semibold">{record.name}</td>
      <td className="px-4 py-4 text-darknavy/70">{record.customerGroup}</td>
      <td className="px-4 py-4 text-center font-semibold">{record.currencyCode}</td>
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
