import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { WarehousePickingDispatchListPage } from "@/app/src/ui/modules/warehouse-management/picking-dispatch/WarehousePickingDispatchListPage";

const PageTitle = "Picking & Dispatch";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function WarehouseOperationsPickingDispatchPage() {
  return <WarehousePickingDispatchListPage />;
}
