import type { Metadata } from "next";
import { WarehouseSupportActionPage } from "@/app/src/ui/modules/maintenance/warehouse-management/WarehouseSupportPages";

const PageTitle = "View Warehouse Transfer";

export const metadata: Metadata = {
	title: PageTitle,
};

export default function ViewWarehouseTransferPage() {
	return <WarehouseSupportActionPage kind="transfers" />;
}
