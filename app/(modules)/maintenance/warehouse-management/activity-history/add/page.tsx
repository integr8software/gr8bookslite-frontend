import type { Metadata } from "next";
import { WarehouseSupportActionPage } from "@/app/src/ui/modules/maintenance/warehouse-management/WarehouseSupportPages";

const PageTitle = "Add Warehouse Activity";

export const metadata: Metadata = {
	title: PageTitle,
};

export default function AddWarehouseActivityPage() {
	return <WarehouseSupportActionPage kind="activity-history" />;
}
