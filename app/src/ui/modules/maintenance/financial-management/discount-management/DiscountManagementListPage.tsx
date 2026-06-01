"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, Link2, Percent, Plus, Tags, Upload } from "lucide-react";
import { DiscountManagementHref } from "@/app/src/constants/modules/maintenance/financial-management/discount-management/DiscountManagementConstants";
import { useDiscountManagementStore } from "@/app/src/hooks/modules/maintenance/financial-management/discount-management/useDiscountManagement";
import type { DiscountManagementTableRecord } from "@/app/src/types/modules/maintenance/financial-management/discount-management/DiscountManagementTypes";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleMetrics } from "@/app/src/ui/shared/module/ModuleMetrics";
import {
	ModuleTableResetButton,
	ModuleTableFilterSelect,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { DiscountManagementTable } from "@/app/src/ui/modules/maintenance/financial-management/discount-management/DiscountManagementTable";

export function DiscountManagementListPage() {
	const discounts = useDiscountManagementStore((state) => state.discounts);
	const deleteDiscount = useDiscountManagementStore(
		(state) => state.deleteDiscount,
	);
	const isLoading = useDiscountManagementStore((state) => state.isLoading);
	const isMutating = useDiscountManagementStore((state) => state.isMutating);
	const [pendingDelete, setPendingDelete] =
		useState<DiscountManagementTableRecord | null>(null);
	const [query, setQuery] = useState("");
	const [mappingFilter, setMappingFilter] = useState("All");
	const filteredDiscounts = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return discounts.filter((discount) => {
			const matchesMapping =
				mappingFilter === "All" ||
				(mappingFilter === "Mapped" && Boolean(discount.accountId)) ||
				(mappingFilter === "Unmapped" && !discount.accountId);

			if (!matchesMapping) {
				return false;
			}

			if (!normalizedQuery) {
				return true;
			}

			return [
				discount.description,
				String(discount.percentage),
				discount.accountCode,
				discount.accountTitle,
			]
				.join(" ")
				.toLowerCase()
				.includes(normalizedQuery);
		});
	}, [discounts, mappingFilter, query]);

	function handleConfirmDelete() {
		if (!pendingDelete) {
			return;
		}

		deleteDiscount(pendingDelete.id);
		setPendingDelete(null);
	}

	function resetFilters() {
		setMappingFilter("All");
		setQuery("");
	}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Discount Management"
				description="Maintain discount definitions and map them to chart of accounts."
				eyebrow={
					<>
						<Percent className="h-3.5 w-3.5" aria-hidden="true" />
						Accounting master data
					</>
				}
				actions={<DiscountManagementHeaderActions />}
			/>

			<ModuleMetrics
				metrics={[
					{
						helper: "All discount definitions",
						icon: Percent,
						label: "Total Discounts",
						value: discounts.length,
					},
					{
						helper: "Mapped to chart accounts",
						icon: Link2,
						label: "Mapped Discounts",
						tone: "emerald",
						value: discounts.filter((discount) =>
							Boolean(discount.accountId),
						).length,
					},
					{
						helper: "Average discount rate",
						icon: Tags,
						label: "Average Discount",
						tone: "amber",
						value:
							discounts.length === 0
								? "0%"
								: `${Math.round(
										discounts.reduce(
											(total, discount) =>
												total + discount.percentage,
											0,
										) / discounts.length,
									)}%`,
					},
				]}
			/>

			<DiscountManagementTable
				discounts={filteredDiscounts}
				isLoading={isLoading}
				toolbar={
					<ModuleTableToolbar className="lg:grid-cols-[minmax(24rem,2.5fr)_minmax(15rem,1fr)_minmax(11rem,1fr)]">
						<ModuleTableSearch
							label="Search discounts"
							value={query}
							onChange={setQuery}
							placeholder="Search by description, rate, or account"
						/>
						<ModuleTableFilterSelect
							label="Account Mapping"
							value={mappingFilter}
							options={[
								{ label: "All", value: "All" },
								{ label: "Mapped", value: "Mapped" },
								{ label: "Unmapped", value: "Unmapped" },
							]}
							onChange={setMappingFilter}
						/>
						<ModuleTableResetButton onClick={resetFilters}>
							Reset
						</ModuleTableResetButton>
					</ModuleTableToolbar>
				}
				onDeleteDiscount={setPendingDelete}
			/>

			<AppDialog
				isOpen={Boolean(pendingDelete)}
				isPending={isMutating}
				title="Delete discount?"
				description={`This will remove ${pendingDelete?.description ?? "the selected discount"}.`}
				confirmLabel="Delete"
				tone="danger"
				onCancel={() => setPendingDelete(null)}
				onConfirm={handleConfirmDelete}
			/>
		</section>
	);
}

function DiscountManagementHeaderActions() {
	return (
		<>
			<button
				type="button"
				className={moduleHeaderActionClassNames.secondary}
			>
				<Upload className="h-4 w-4" aria-hidden="true" />
				Import
			</button>
			<button
				type="button"
				className={moduleHeaderActionClassNames.secondary}
			>
				<Download className="h-4 w-4" aria-hidden="true" />
				Export
			</button>
			<Link
				href={`${DiscountManagementHref}/add`}
				className={moduleHeaderActionClassNames.primary}
			>
				<Plus className="h-4 w-4" aria-hidden="true" />
				Add Discount
			</Link>
		</>
	);
}
