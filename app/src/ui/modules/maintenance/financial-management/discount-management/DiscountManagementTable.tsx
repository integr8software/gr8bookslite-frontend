"use client";

import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { DiscountManagementTablePaginationStorageKey } from "@/app/src/constants/modules/maintenance/financial-management/discount-management/DiscountManagementConstants";
import { useDiscountManagementTable } from "@/app/src/hooks/modules/maintenance/financial-management/discount-management/useDiscountManagementTable";
import type {
	Discount,
	DiscountManagementTableRecord,
} from "@/app/src/types/modules/maintenance/financial-management/discount-management/DiscountManagementTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { DiscountManagementTableRow } from "@/app/src/ui/modules/maintenance/financial-management/discount-management/DiscountManagementTableRow";

type DiscountManagementTableProps = {
	discounts: Discount[];
	isLoading: boolean;
	toolbar?: ReactNode;
	onDeleteDiscount: (discount: DiscountManagementTableRecord) => void;
	onEditDiscount: (discount: DiscountManagementTableRecord) => void;
};

export function DiscountManagementTable({
	discounts,
	isLoading,
	toolbar,
	onDeleteDiscount,
	onEditDiscount,
}: DiscountManagementTableProps) {
	const table = useDiscountManagementTable(discounts);

	return (
		<ModuleTable
			emptyDescription="Add a discount to start mapping promotions to accounts."
			emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
			emptyTitle="No discounts yet"
			isLoading={isLoading}
			minWidthClassName="min-w-[52rem]"
			paginationStorageKey={DiscountManagementTablePaginationStorageKey}
			table={table}
			toolbar={toolbar}
			renderRow={({ id, original }) => (
				<DiscountManagementTableRow
					key={id}
					discount={original}
					onDeleteDiscount={onDeleteDiscount}
					onEditDiscount={onEditDiscount}
				/>
			)}
		/>
	);
}
