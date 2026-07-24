import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { WarehouseStorageListPage } from "@/app/src/ui/shared/warehouse-management/WarehouseStorageListPage";

const PageTitle = "Warehouse Storage";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function WarehouseStoragePage() {
	return <WarehouseStorageListPage />;
}
