"use client";

import { Search } from "lucide-react";
import { DiscountManagementTablePaginationStorageKey } from "@/app/src/constants/modules/maintenance/financial-management/discount-management/DiscountManagementConstants";
import { useDiscountManagementTable } from "@/app/src/hooks/modules/maintenance/financial-management/discount-management/useDiscountManagementTable";
import type {
	Discount,
	DiscountManagementTableRecord,
} from "@/app/src/types/modules/maintenance/financial-management/discount-management/DiscountManagementTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { DiscountManagementTableRow } from "./DiscountManagementTableRow";

type DiscountManagementTableProps = {
	discounts: Discount[];
	isLoading: boolean;
	onDeleteDiscount: (discount: DiscountManagementTableRecord) => void;
};

export function DiscountManagementTable({
	discounts,
	isLoading,
	onDeleteDiscount,
}: DiscountManagementTableProps) {
	const table = useDiscountManagementTable(discounts);

	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable
				emptyDescription="Add a discount to start mapping promotions to accounts."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No discounts yet"
				isLoading={isLoading}
				minWidthClassName="min-w-[52rem]"
				paginationStorageKey={DiscountManagementTablePaginationStorageKey}
				table={table}
				renderRow={({ id, original }) => (
					<DiscountManagementTableRow
						key={id}
						discount={original}
						onDeleteDiscount={onDeleteDiscount}
					/>
				)}
			/>
		</div>
	);
}
