"use client";

import { Search } from "lucide-react";
import {
	WarehouseStockInquiryActionLabel,
	WarehouseStockInquiryDescription,
	WarehouseStockInquiryTitle,
} from "@/app/src/constants/modules/warehouse-management/warehouse-stock-inquiry/WarehouseStockInquiryConstants";
import { useWarehouseStockInquiryListPage } from "@/app/src/hooks/modules/warehouse-management/warehouse-stock-inquiry/useWarehouseStockInquiryListPage";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { WarehouseStockInquiryStatisticCards } from "@/app/src/ui/modules/warehouse-management/warehouse-stock-inquiry/WarehouseStockInquiryStatisticCards";
import { WarehouseStockInquiryTable } from "@/app/src/ui/modules/warehouse-management/warehouse-stock-inquiry/WarehouseStockInquiryTable";

export function WarehouseStockInquiryListPage() {
	const page = useWarehouseStockInquiryListPage();
	const hasActiveFilters =
		page.query.trim().length > 0 || page.statusFilter !== "Active";

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title={WarehouseStockInquiryTitle}
				description={WarehouseStockInquiryDescription}
				eyebrow={
					<>
						<Search className="h-3.5 w-3.5" aria-hidden="true" />
						Warehouse management
					</>
				}
				actions={
					<button
						type="button"
						className={moduleHeaderActionClassNames.primary}
						onClick={page.refreshRecords}
					>
						<Search className="h-4 w-4" aria-hidden="true" />
						{WarehouseStockInquiryActionLabel}
					</button>
				}
			/>
			<WarehouseStockInquiryStatisticCards
				isLoading={page.isLoading}
				records={page.records}
				statistics={page.statistics}
			/>
			<WarehouseStockInquiryTable
				page={page}
				hasActiveFilters={hasActiveFilters}
			/>
		</section>
	);
}
