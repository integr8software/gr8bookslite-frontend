import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { WarehouseStockInquiryListPage } from "@/app/src/ui/modules/maintenance/warehouse-stock-inquiry/WarehouseStockInquiryListPage";

const PageTitle = "Warehouse Stock Inquiry";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function WarehouseStockInquiryPage() {
	return <WarehouseStockInquiryListPage />;
}
