import Link from "next/link";
import { SalesOrderHref } from "@/app/src/constants/modules/sales/sales-order/SalesOrderConstants";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function SalesOrderNotFound() {
  return (
    <ModuleHeader
      variant="panel"
      titleAs="h1"
      title="Sales Order Not Found"
      description="The selected sales order could not be found."
      actions={
        <Link href={SalesOrderHref} className={moduleHeaderActionClassNames.secondary}>
          Back to List
        </Link>
      }
    />
  );
}
