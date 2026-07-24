import type { Metadata } from "next";
import { WarehouseStorageFormPage } from "@/app/src/ui/shared/warehouse-management/WarehouseStorageFormPage";

const PageTitle = "Edit Warehouse Storage";

export const metadata: Metadata = {
	title: PageTitle,
};

export default function EditWarehouseStoragePage() {
	return <WarehouseStorageFormPage />;
}
