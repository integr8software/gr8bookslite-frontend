import type { Metadata } from "next";
import { WarehouseTransferFormPage } from "@/app/src/ui/modules/maintenance/warehouse-transfers/WarehouseTransferFormPage";

const PageTitle = "Add Warehouse Transfer";

export const metadata: Metadata = {
	title: PageTitle,
};

export default function AddWarehouseTransferPage() {
	return <WarehouseTransferFormPage />;
}
