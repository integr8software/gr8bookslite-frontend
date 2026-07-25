import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { WarehouseReceivingPutawayListPage } from "@/app/src/ui/modules/warehouse-management/receiving-putaway/WarehouseReceivingPutawayListPage";

const PageTitle = "Receiving & Putaway";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function WarehouseOperationsReceivingPutawayPage() {
  return <WarehouseReceivingPutawayListPage />;
}
