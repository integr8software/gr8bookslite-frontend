"use client";

import { useCallback, useMemo, useState } from "react";
import { CheckCircle2, CirclePause, CreditCard } from "lucide-react";
import { usePaymentTypeListPage } from "@/app/src/hooks/modules/maintenance/payment-type/usePaymentTypeListPage";
import { useMaintenanceAddDrawerSpotlight } from "@/app/src/hooks/modules/maintenance/useMaintenanceAddDrawerSpotlight";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import {
	ModuleStatisticCards,
	type ModuleStatisticCardItem,
} from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { PaymentTypeDrawer } from "@/app/src/ui/modules/maintenance/payment-type/PaymentTypeDrawer";
import { PaymentTypeImportDialog } from "@/app/src/ui/modules/maintenance/payment-type/PaymentTypeImportDialog";
import { PaymentTypeHeaderActions } from "@/app/src/ui/modules/maintenance/payment-type/PaymentTypeHeaderActions";
import { PaymentTypeTable } from "@/app/src/ui/modules/maintenance/payment-type/PaymentTypeTable";
import type { DrawerState } from "@/app/src/types/modules/maintenance/payment-type/PaymentTypeTypes";

export function PaymentTypeListPage() {
	const page = usePaymentTypeListPage();
	const [drawerState, setDrawerState] = useState<DrawerState>(null);
	const [isImportOpen, setIsImportOpen] = useState(false);
	const closeDrawer = useCallback(() => setDrawerState(null), []);

	useMaintenanceAddDrawerSpotlight(
		() => {
			if (page.permissions.canCreate) {
				setDrawerState({ mode: "add" });
			}
		},
		closeDrawer,
	);
	const statisticCards = useMemo<ModuleStatisticCardItem[]>(
		() => [
			{
				helper: "All payment types",
				icon: CreditCard,
				label: "Total Types",
				value: page.statistics.totalPaymentTypes,
			},
			{
				helper: "Available for vouchers",
				icon: CheckCircle2,
				label: "Active Types",
				tone: "emerald",
				value: page.statistics.activePaymentTypes,
			},
			{
				helper: "Currently inactive",
				icon: CirclePause,
				label: "Inactive Types",
				tone: "amber",
				value: page.statistics.inactivePaymentTypes,
			},
		],
		[page.statistics],
	);

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Payment Type"
				description="Maintain payment type names, categories, and active status for cash disbursement workflows."
				eyebrow={
					<>
						<CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
						Accounting master data
					</>
				}
				actions={
					<PaymentTypeHeaderActions
						onAdd={() => setDrawerState({ mode: "add" })}
						onImport={() => setIsImportOpen(true)}
						permissions={page.permissions}
					/>
				}
			/>

			<ModuleStatisticCards
				items={statisticCards}
				isLoading={page.isLoading}
			/>

			<PaymentTypeTable
				filteredPaymentTypes={page.filteredPaymentTypes}
				isLoading={page.isLoading}
				isRefreshing={page.isRefreshing}
				lastSyncedAt={page.lastSyncedAt}
				paymentTypes={page.paymentTypes}
				permissions={page.permissions}
				searchTerm={page.searchTerm}
				statusFilter={page.statusFilter}
				typeFilter={page.typeFilter}
				typeFilterOptions={page.typeFilterOptions}
				onRefresh={page.refreshPaymentTypes}
				onSearchTermChange={page.setSearchTerm}
				onStatusFilterChange={page.setStatusFilter}
				onTypeFilterChange={page.setTypeFilter}
				onEdit={(paymentType) =>
					setDrawerState({ mode: "edit", paymentType })
				}
				onToggleStatus={page.setPendingStatusPaymentType}
				onView={(paymentType) =>
					setDrawerState({ mode: "view", paymentType })
				}
			/>

			<PaymentTypeDrawer
				isOpen={Boolean(drawerState)}
				mode={drawerState?.mode ?? "add"}
				onClose={closeDrawer}
				paymentType={drawerState?.paymentType}
			/>
			{page.permissions.canImport ? (
				<PaymentTypeImportDialog
					existingPaymentTypes={page.paymentTypes}
					isOpen={isImportOpen}
					onClose={() => setIsImportOpen(false)}
					onImportPaymentTypes={page.addPaymentTypes}
				/>
			) : null}
			<AppDialog
				isOpen={Boolean(page.pendingStatusPaymentType)}
				isPending={page.isMutating}
				title={
					page.pendingStatusPaymentType?.status === "Active"
						? "Set payment type inactive?"
						: "Reactivate payment type?"
				}
				description={
					page.pendingStatusPaymentType?.status === "Active"
						? `${page.pendingStatusPaymentType.paymentType} will remain in history and references, but will no longer be active for normal selection.`
						: `${page.pendingStatusPaymentType?.paymentType ?? "This payment type"} will be available for selection again.`
				}
				confirmLabel={
					page.pendingStatusPaymentType?.status === "Active"
						? "Set Inactive"
						: "Reactivate"
				}
				tone={
					page.pendingStatusPaymentType?.status === "Active"
						? "danger"
						: "success"
				}
				onCancel={() => page.setPendingStatusPaymentType(null)}
				onConfirm={page.confirmPaymentTypeStatusChange}
			/>
		</section>
	);
}
