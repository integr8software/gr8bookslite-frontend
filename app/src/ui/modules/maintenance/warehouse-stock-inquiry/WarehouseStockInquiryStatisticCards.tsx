import { CheckCircle2, PackageSearch, Search } from "lucide-react";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";

type WarehouseStockInquiryStatisticCardsProps = {
	isLoading: boolean;
	statistics: {
		activeRecords: number;
		otherRecords: number;
		totalRecords: number;
	};
};

export function WarehouseStockInquiryStatisticCards({
	isLoading,
	statistics,
}: WarehouseStockInquiryStatisticCardsProps) {
	return (
		<ModuleStatisticCards
			isLoading={isLoading}
			items={[
				{
					helper: "Stock rows",
					icon: Search,
					label: "Total Records",
					value: statistics.totalRecords,
				},
				{
					helper: "Available to inspect",
					icon: CheckCircle2,
					label: "Active",
					tone: "emerald",
					value: statistics.activeRecords,
				},
				{
					helper: "Inventory items",
					icon: PackageSearch,
					label: "Stock Lines",
					tone: "cyan",
					value: statistics.totalRecords,
				},
			]}
		/>
	);
}
