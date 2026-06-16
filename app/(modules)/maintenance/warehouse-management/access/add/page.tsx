import type { Metadata } from "next";
import { WarehouseSupportActionPage } from "@/app/src/ui/modules/maintenance/warehouse-management/WarehouseSupportPages";

const PageTitle = "Add Warehouse Access";

export const metadata: Metadata = {
	title: PageTitle,
};

export default function AddWarehouseAccessPage() {
	return <WarehouseSupportActionPage kind="access" />;
}
