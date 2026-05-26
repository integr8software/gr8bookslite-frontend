import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { WarehouseAccessPage } from "@/app/src/ui/modules/maintenance/warehouse-management/WarehouseAccessPage";

const PageTitle = "Warehouse Access";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function WarehouseAccessRoutePage() {
	return <WarehouseAccessPage />;
}
