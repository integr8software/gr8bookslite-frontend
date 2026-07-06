"use client";

import { useState } from "react";
import { CheckCircle2, CirclePause, CreditCard } from "lucide-react";
import { usePaymentTypeListPage } from "@/app/src/hooks/modules/maintenance/payment-type/usePaymentTypeListPage";
import { useMaintenanceAddDrawerSpotlight } from "@/app/src/hooks/modules/maintenance/useMaintenanceAddDrawerSpotlight";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { PaymentTypeDrawer } from "@/app/src/ui/modules/maintenance/payment-type/PaymentTypeDrawer";
import { PaymentTypeFilters } from "@/app/src/ui/modules/maintenance/payment-type/PaymentTypeFilters";
import { PaymentTypeHeaderActions } from "@/app/src/ui/modules/maintenance/payment-type/PaymentTypeHeaderActions";
import { PaymentTypeTable } from "@/app/src/ui/modules/maintenance/payment-type/PaymentTypeTable";
import type { PaymentTypeRecord } from "@/app/src/types/modules/maintenance/payment-type/PaymentTypeTypes";

type DrawerState =
	| { mode: "add" | "edit" | "view"; paymentType?: PaymentTypeRecord }
	| null;

export function PaymentTypeListPage() {
	const page = usePaymentTypeListPage();
	const [drawerState, setDrawerState] = useState<DrawerState>(null);

	useMaintenanceAddDrawerSpotlight(
		() => setDrawerState({ mode: "add" }),
		() => setDrawerState(null),
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
					/>
				}
			/>

			<ModuleStatisticCards
				items={[
					{
						helper: "All payment types",
						icon: CreditCard,
						label: "Total Types",
						value: page.paymentTypes.length,
					},
					{
						helper: "Available for vouchers",
						icon: CheckCircle2,
						label: "Active Types",
						tone: "emerald",
						value: page.paymentTypes.filter(
							(paymentType) => paymentType.status === "Active",
						).length,
					},
					{
						helper: "Currently inactive",
						icon: CirclePause,
						label: "Inactive Types",
						tone: "amber",
						value: page.paymentTypes.filter(
							(paymentType) => paymentType.status === "Inactive",
						).length,
					},
				]}
			/>

			<PaymentTypeTable
				isLoading={page.isLoading}
				lastSyncedAt={page.lastSyncedAt}
				paymentTypes={page.filteredPaymentTypes}
				toolbar={
					<PaymentTypeFilters
						searchTerm={page.searchTerm}
						statusFilter={page.statusFilter}
						typeFilter={page.typeFilter}
						typeFilterOptions={page.typeFilterOptions}
						onSearchTermChange={page.setSearchTerm}
						onStatusFilterChange={page.setStatusFilter}
						onTypeFilterChange={page.setTypeFilter}
					/>
				}
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
				onClose={() => setDrawerState(null)}
				paymentType={drawerState?.paymentType}
			/>
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
