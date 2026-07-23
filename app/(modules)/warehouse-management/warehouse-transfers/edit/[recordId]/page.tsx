import type { Metadata } from "next";
import { WarehouseTransferFormPage } from "@/app/src/ui/modules/warehouse-management/warehouse-transfers/WarehouseTransferFormPage";

const PageTitle = "Edit Warehouse Transfer";

export const metadata: Metadata = {
	title: PageTitle,
};

export default function EditWarehouseTransferPage() {
	return <WarehouseTransferFormPage />;
}
