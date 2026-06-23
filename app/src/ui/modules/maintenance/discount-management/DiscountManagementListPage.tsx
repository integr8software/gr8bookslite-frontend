"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Download, Percent, Plus, Power, Upload } from "lucide-react";
import { useDiscountManagementStore } from "@/app/src/hooks/modules/maintenance/discount-management/useDiscountManagement";
import { useMaintenanceAddDrawerSpotlight } from "@/app/src/hooks/modules/maintenance/useMaintenanceAddDrawerSpotlight";
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
import { DiscountManagementTable } from "@/app/src/ui/modules/maintenance/discount-management/DiscountManagementTable";
import { DiscountManagementDrawer } from "@/app/src/ui/modules/maintenance/discount-management/DiscountManagementDrawer";
import type { Discount } from "@/app/src/types/modules/maintenance/discount-management/DiscountManagementTypes";

type DrawerState = { mode: "add" | "edit" | "view"; discount?: Discount } | null;

export function DiscountManagementListPage() {
	const discounts = useDiscountManagementStore((state) => state.discounts);
	const updateDiscount = useDiscountManagementStore((state) => state.updateDiscount);
	const isLoading = useDiscountManagementStore((state) => state.isLoading);
	const isMutating = useDiscountManagementStore((state) => state.isMutating);
	const [drawerState, setDrawerState] = useState<DrawerState>(null);
	const [pendingStatusDiscount, setPendingStatusDiscount] =
		useState<Discount | null>(null);
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("All");
	const [discountTypeFilter, setDiscountTypeFilter] = useState("All");
	useMaintenanceAddDrawerSpotlight(
		() => setDrawerState({ mode: "add" }),
		() => setDrawerState(null),
	);
	const filteredDiscounts = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return discounts.filter((discount) => {
			const matchesStatus =
				statusFilter === "All" || discount.status === statusFilter;
			const matchesDiscountType =
				discountTypeFilter === "All" ||
				discount.discountType === discountTypeFilter;

			if (!matchesStatus || !matchesDiscountType) {
				return false;
			}

			if (!normalizedQuery) {
				return true;
			}

			return [
				discount.name ?? discount.description,
				discount.description,
				discount.discountType,
				String(discount.amount),
				(discount.moduleNames ?? []).join(" "),
				discount.status,
				discount.accountCode,
				discount.accountTitle,
			]
				.join(" ")
				.toLowerCase()
				.includes(normalizedQuery);
		});
	}, [discounts, discountTypeFilter, statusFilter, query]);

	function resetFilters() {
		setStatusFilter("All");
		setDiscountTypeFilter("All");
		setQuery("");
	}

	function confirmDiscountStatusChange() {
		if (!pendingStatusDiscount) {
			return;
		}

		updateDiscount({
			...pendingStatusDiscount,
			status:
				pendingStatusDiscount.status === "Active" ? "Inactive" : "Active",
		});
		setPendingStatusDiscount(null);
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
				actions={<DiscountManagementHeaderActions onAdd={() => setDrawerState({ mode: "add" })} />}
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
						helper: "Available for transactions",
						icon: CheckCircle2,
						label: "Active Discounts",
						tone: "emerald",
						value: discounts.filter((discount) =>
							discount.status === "Active",
						).length,
					},
					{
						helper: "Hidden from new transactions",
						icon: Power,
						label: "Inactive Discounts",
						tone: "amber",
						value: discounts.filter((discount) =>
							discount.status === "Inactive",
						).length,
					},
				]}
			/>

			<DiscountManagementTable
				discounts={filteredDiscounts}
				isLoading={isLoading}
				toolbar={
					<ModuleTableToolbar className="lg:grid-cols-[minmax(24rem,2.5fr)_minmax(13rem,1fr)_minmax(13rem,1fr)_minmax(11rem,1fr)]">
						<ModuleTableSearch
							label="Search discounts"
							value={query}
							onChange={setQuery}
							placeholder="Search by name, description, value, module, or account"
						/>
						<ModuleTableFilterSelect
							label="Discount Type"
							value={discountTypeFilter}
							options={[
								{ label: "All", value: "All" },
								{ label: "Percentage", value: "Percentage" },
								{ label: "Fixed", value: "Fixed" },
							]}
							onChange={setDiscountTypeFilter}
						/>
						<ModuleTableFilterSelect
							label="Status"
							value={statusFilter}
							options={[
								{ label: "All", value: "All" },
								{ label: "Active", value: "Active" },
								{ label: "Inactive", value: "Inactive" },
							]}
							onChange={setStatusFilter}
						/>
						<ModuleTableResetButton onClick={resetFilters}>
							Reset
						</ModuleTableResetButton>
					</ModuleTableToolbar>
				}
				onEditDiscount={(discount) => setDrawerState({ mode: "edit", discount })}
				onToggleStatus={setPendingStatusDiscount}
				onViewDiscount={(discount) => setDrawerState({ mode: "view", discount })}
			/>
			<DiscountManagementDrawer discount={drawerState?.discount} isOpen={Boolean(drawerState)} mode={drawerState?.mode ?? "add"} onClose={() => setDrawerState(null)} />
			<AppDialog
				isOpen={Boolean(pendingStatusDiscount)}
				isPending={isMutating}
				title={
					pendingStatusDiscount?.status === "Active"
						? "Set discount inactive?"
						: "Reactivate discount?"
				}
				description={
					pendingStatusDiscount?.status === "Active"
						? `${pendingStatusDiscount.name} will remain in history and references, but will no longer be active for normal selection.`
						: `${pendingStatusDiscount?.name ?? "This discount"} will be available for selection again.`
				}
				confirmLabel={
					pendingStatusDiscount?.status === "Active"
						? "Set Inactive"
						: "Reactivate"
				}
				tone={pendingStatusDiscount?.status === "Active" ? "danger" : "success"}
				onCancel={() => setPendingStatusDiscount(null)}
				onConfirm={confirmDiscountStatusChange}
			/>
		</section>
	);
}

function DiscountManagementHeaderActions({ onAdd }: { onAdd: () => void }) {
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
			<button
				type="button"
				onClick={onAdd}
				className={moduleHeaderActionClassNames.primary}
			>
				<Plus className="h-4 w-4" aria-hidden="true" />
				Add Discount
			</button>
		</>
	);
}
