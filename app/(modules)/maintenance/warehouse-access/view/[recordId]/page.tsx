import type { Metadata } from "next";
import { WarehouseAccessRecordFormPage } from "@/app/src/ui/modules/maintenance/warehouse-access/WarehouseAccessRecordFormPage";

const PageTitle = "View Warehouse Access";

export const metadata: Metadata = {
	title: PageTitle,
};

export default function ViewWarehouseAccessPage() {
	return <WarehouseAccessRecordFormPage />;
}
