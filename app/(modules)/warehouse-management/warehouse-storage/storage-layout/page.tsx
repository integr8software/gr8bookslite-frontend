import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { StorageLayoutPage } from "@/app/src/ui/modules/warehouse-management/warehouse-storage/storage-layout/StorageLayoutPage";

export const metadata: Metadata = {
  title: `Storage Layout | ${AppName}`,
  description: `Configure warehouse storage levels in ${AppName}.`,
};

export default function WarehouseStorageLayoutPage() {
  return <StorageLayoutPage />;
}
