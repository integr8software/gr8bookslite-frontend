import type { Metadata } from "next";
import { WarehouseAccessFormPage } from "@/app/src/ui/modules/warehouse-management/warehouse-access/WarehouseAccessFormPage";

const PageTitle = "Add Warehouse Access";

export const metadata: Metadata = {
	title: PageTitle,
};

export default function AddWarehouseAccessPage() {
	return <WarehouseAccessFormPage />;
}
