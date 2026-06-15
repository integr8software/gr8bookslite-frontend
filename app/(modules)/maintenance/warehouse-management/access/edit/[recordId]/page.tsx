import type { Metadata } from "next";
import { WarehouseSupportActionPage } from "@/app/src/ui/modules/maintenance/warehouse-management/WarehouseSupportPages";

const PageTitle = "Edit Warehouse Access";

export const metadata: Metadata = {
	title: PageTitle,
};

export default function EditWarehouseAccessPage() {
	return <WarehouseSupportActionPage kind="access" />;
}
