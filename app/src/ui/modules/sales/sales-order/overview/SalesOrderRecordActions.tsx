import { SalesOrderHref } from "@/app/src/constants/modules/sales/sales-order/SalesOrderConstants";
import type { SalesOrderRecord } from "@/app/src/types/modules/sales/sales-order/SalesOrderTypes";
import { ModuleTableActionLink, ModuleTableActions } from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function SalesOrderRecordActions({ record }: { record: SalesOrderRecord }) {
  return (
    <ModuleTableActions className="justify-center">
      <ModuleTableActionLink href={`${SalesOrderHref}/view/${record.id}`} label={`View ${record.transNo}`} variant="view" />
      <ModuleTableActionLink href={`${SalesOrderHref}/edit/${record.id}`} label={`Edit ${record.transNo}`} variant="edit" />
    </ModuleTableActions>
  );
}
