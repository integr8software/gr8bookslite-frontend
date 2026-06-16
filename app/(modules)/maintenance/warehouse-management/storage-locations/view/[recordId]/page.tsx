import type { Metadata } from "next";
import { WarehouseSupportActionPage } from "@/app/src/ui/modules/maintenance/warehouse-management/WarehouseSupportPages";

const PageTitle = "View Storage Location";

export const metadata: Metadata = {
	title: PageTitle,
};

export default function ViewStorageLocationPage() {
	return <WarehouseSupportActionPage kind="storage-locations" />;
}
