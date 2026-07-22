import type { ItemsTableRowProps } from "@/app/src/types/modules/maintenance/items/ItemManagementTypes";
import { ItemRecordActions } from "@/app/src/ui/modules/maintenance/items/ItemRecordActions";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { formatCurrency } from "@/app/src/utils/currency.util";

export function ItemsTableRow({ item, onStatusChange }: ItemsTableRowProps) {
  return (
    <tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
      <td className="px-4 py-4 font-semibold">{item.code}</td>
      <td className="px-4 py-4">{item.skuCode || "Not set"}</td>
      <td className="px-4 py-4">
        <div className="font-medium">{item.name}</div>
        <div className="text-xs text-darknavy/55">{item.description}</div>
      </td>
      <td className="px-4 py-4">{item.primaryCategory || item.category}</td>
      <td className="px-4 py-4">{item.uom}</td>
      <td className="px-4 py-4">{formatCurrency(item.costPrice)}</td>
      <td className="px-4 py-4">{formatCurrency(item.sellingPrice)}</td>
      <td className="px-4 py-4 text-center">
        <ModuleStatusBadge status={item.status} />
      </td>
      <td className="px-4 py-4 text-center">
        <ItemRecordActions item={item} onStatusChange={onStatusChange} />
      </td>
    </tr>
  );
}
