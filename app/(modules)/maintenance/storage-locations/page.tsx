import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { StorageLocationsListPage } from "@/app/src/ui/modules/maintenance/storage-locations/StorageLocationsListPage";

const PageTitle = "Storage Locations";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function StorageLocationsPage() {
	return <StorageLocationsListPage />;
}
