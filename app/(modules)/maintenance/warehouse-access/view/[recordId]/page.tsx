import type { Metadata } from "next";
import { WarehouseAccessFormPage } from "@/app/src/ui/modules/maintenance/warehouse-access/WarehouseAccessFormPage";

const PageTitle = "View Warehouse Access";

export const metadata: Metadata = {
	title: PageTitle,
};

export default function ViewWarehouseAccessPage() {
	return <WarehouseAccessFormPage />;
}
