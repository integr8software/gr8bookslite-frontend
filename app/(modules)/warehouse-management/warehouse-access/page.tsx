import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { WarehouseAccessListPage } from "@/app/src/ui/modules/warehouse-management/warehouse-access/WarehouseAccessListPage";

const PageTitle = "Warehouse Access";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function WarehouseAccessModulePage() {
	return <WarehouseAccessListPage />;
}
