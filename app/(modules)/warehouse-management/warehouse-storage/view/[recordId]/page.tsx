import type { Metadata } from "next";
import { WarehouseStorageFormPage } from "@/app/src/ui/shared/warehouse-management/WarehouseStorageFormPage";

const PageTitle = "View Warehouse Storage";

export const metadata: Metadata = {
	title: PageTitle,
};

export default function ViewWarehouseStoragePage() {
	return <WarehouseStorageFormPage />;
}
