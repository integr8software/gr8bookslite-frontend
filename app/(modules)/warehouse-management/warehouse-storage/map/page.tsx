import type { Metadata } from "next";
import { WarehouseStorageFullMapPage } from "@/app/src/ui/modules/warehouse-management/warehouse-storage/WarehouseStorageFullMapPage";

const PageTitle = "Warehouse Storage Map";

export const metadata: Metadata = {
  title: PageTitle,
};

export default function Page() {
  return <WarehouseStorageFullMapPage />;
}
