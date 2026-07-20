import type { Metadata } from "next";
import { WarehouseStorageFormPage } from "@/app/src/ui/modules/maintenance/warehouse-storage/WarehouseStorageFormPage";

const PageTitle = "Add Warehouse Storage";

export const metadata: Metadata = {
	title: PageTitle,
};

export default function AddWarehouseStoragePage() {
	return <WarehouseStorageFormPage />;
}
