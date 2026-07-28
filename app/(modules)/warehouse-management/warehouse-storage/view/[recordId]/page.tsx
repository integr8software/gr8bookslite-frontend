import type { Metadata } from "next";
import { WarehouseStorageFormPage } from "@/app/src/ui/modules/warehouse-management/warehouse-storage/WarehouseStorageFormPage";

const PageTitle = "View Warehouse Storage";

export const metadata: Metadata = {
	title: PageTitle,
};

export default function ViewWarehouseStoragePage() {
	return <WarehouseStorageFormPage />;
}
