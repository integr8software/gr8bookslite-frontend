import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { WarehouseSupportPage } from "@/app/src/ui/modules/maintenance/warehouse-management/WarehouseSupportPages";

const PageTitle = "Storage Locations";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function StorageLocationsPage() {
	return <WarehouseSupportPage kind="storage-locations" />;
}
