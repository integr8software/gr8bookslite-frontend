import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { WarehouseTransfersListPage } from "@/app/src/ui/modules/warehouse-management/warehouse-transfers/WarehouseTransfersListPage";

const PageTitle = "Warehouse Transfers";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function WarehouseTransfersPage() {
	return <WarehouseTransfersListPage />;
}
