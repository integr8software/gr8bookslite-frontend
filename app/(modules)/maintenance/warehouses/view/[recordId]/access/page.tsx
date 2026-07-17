import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { WarehouseAccessPage } from "@/app/src/ui/modules/maintenance/warehouses/WarehouseAccessPage";

const PageTitle = "Warehouse Access";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function WarehouseAccessRoutePage() {
	return <WarehouseAccessPage />;
}
