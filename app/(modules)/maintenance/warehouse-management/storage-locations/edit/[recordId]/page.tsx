import type { Metadata } from "next";
import { WarehouseSupportActionPage } from "@/app/src/ui/modules/maintenance/warehouse-management/WarehouseSupportPages";

const PageTitle = "Edit Storage Location";

export const metadata: Metadata = {
	title: PageTitle,
};

export default function EditStorageLocationPage() {
	return <WarehouseSupportActionPage kind="storage-locations" />;
}
