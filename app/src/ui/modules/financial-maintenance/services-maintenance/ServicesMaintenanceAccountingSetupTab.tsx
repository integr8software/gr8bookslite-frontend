import {
	ServicesMaintenanceAccountSetupModeOptions,
	ServicesMaintenanceReadOnlyFieldClassName,
} from "@/app/src/constants/modules/financial-maintenance/services-maintenance/ServicesMaintenanceConstants";
import { buildGeneratedServiceRevenueAccountTitle } from "@/app/src/data/modules/financial-maintenance/services-maintenance/ServicesMaintenanceData";
import type {
	ServicesMaintenanceAccountingSetupTabProps,
	ServicesMaintenanceAccountSetupMode,
} from "@/app/src/types/modules/financial-maintenance/services-maintenance/ServicesMaintenanceTypes";
import { ChartAccountDropdown } from "@/app/src/ui/shared/advanced-dropdown/ChartAccountDropdown";
import { FormField } from "@/app/src/ui/modules/financial-maintenance/services-maintenance/ServicesMaintenanceFields";

export function ServicesMaintenanceAccountingSetupTab({
	accountOptions,
	errors,
	isAccountCodeLoading,
	isReadonly,
	mode,
	nextAccountCode,
	selectedService,
	values,
	onAccountSetupModeChange,
	onAddAccountTitle,
	onRevenueAccountChange,
}: ServicesMaintenanceAccountingSetupTabProps) {
	const isAuto = values.accountSetupMode === "Auto";
	const selectedAccount = accountOptions.find(
		(account) => account.id === values.revenueCoaId,
	);
	const displayedAccountTitle = isAuto
		? buildGeneratedServiceRevenueAccountTitle(values.serviceName || "[Name]")
		: (selectedAccount?.accountName ?? selectedService?.revenueAccountTitle ?? "");
	const displayedAccountCode = isAuto
		? mode === "add"
			? isAccountCodeLoading
				? "Loading..."
				: nextAccountCode?.accountCode || "Auto series"
			: (selectedService?.revenueAccountCode ?? "")
		: (selectedAccount?.accountNumber ?? selectedService?.revenueAccountCode ?? "");

	return (
		<div className="grid gap-5">
			<div className="grid gap-2 sm:grid-cols-2">
				{ServicesMaintenanceAccountSetupModeOptions.map((option) => (
					<button
						key={option}
						type="button"
						disabled={isReadonly}
						onClick={() =>
							onAccountSetupModeChange(option as ServicesMaintenanceAccountSetupMode)
						}
						className={`rounded-lg border px-4 py-3 text-left text-sm transition ${
							values.accountSetupMode === option
								? "border-skyblue bg-skyblue/10 text-darknavy shadow-sm"
								: "border-darknavy/10 bg-white text-darknavy/70 hover:border-skyblue/40"
						} disabled:cursor-not-allowed disabled:bg-darknavy/[0.03]`}
					>
						<span className="block font-semibold">
							{option === "Auto" ? "Generate automatically" : "Select existing"}
						</span>
						<span className="mt-1 block text-xs text-darknavy/55">
							{option === "Auto"
								? "Create a Service Revenues account for this service."
								: "Use an existing Service Revenues posting account."}
						</span>
					</button>
				))}
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<FormField label="Account Code">
					<input
						id="services-maintenance-account-code"
						value={displayedAccountCode}
						readOnly
						className={ServicesMaintenanceReadOnlyFieldClassName}
					/>
				</FormField>
				<FormField label="Account Title" required>
					<input
						id="services-maintenance-account-title"
						value={displayedAccountTitle}
						readOnly
						className={ServicesMaintenanceReadOnlyFieldClassName}
					/>
				</FormField>
			</div>

			{!isAuto ? (
				<FormField label="Revenue Account" error={errors.revenueCoaId} required>
					<ChartAccountDropdown
						accounts={accountOptions}
						addAction={{
							label: "Add Account Title",
							onClick: onAddAccountTitle,
						}}
						disabled={isReadonly}
						emptyMessage="No active Service Revenues accounts found."
						placeholder="--Select Revenue Account--"
						searchPlaceholder="Search account title or code"
						showSelectedDetails
						value={values.revenueCoaId}
						valueField="id"
						onChange={onRevenueAccountChange}
					/>
				</FormField>
			) : null}
		</div>
	);
}
