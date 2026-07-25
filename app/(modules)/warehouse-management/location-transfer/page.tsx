import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { WarehouseLocationTransferListPage } from "@/app/src/ui/modules/warehouse-management/location-transfer/WarehouseLocationTransferListPage";

const PageTitle = "Location Transfer";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function WarehouseOperationsLocationTransferPage() {
  return <WarehouseLocationTransferListPage />;
}
