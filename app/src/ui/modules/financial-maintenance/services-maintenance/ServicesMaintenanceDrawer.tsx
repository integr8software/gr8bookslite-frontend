"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
	ServicesMaintenanceActionCopy,
	ServicesMaintenanceDrawerFormId,
	ServicesMaintenanceTitle,
} from "@/app/src/constants/modules/financial-maintenance/services-maintenance/ServicesMaintenanceConstants";
import { useServicesMaintenanceFormPage } from "@/app/src/hooks/modules/financial-maintenance/services-maintenance/useServicesMaintenanceFormPage";
import type { ChartAccount } from "@/app/src/types/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import type {
	ServicesMaintenance,
	ServicesMaintenanceDrawerProps,
} from "@/app/src/types/modules/financial-maintenance/services-maintenance/ServicesMaintenanceTypes";
import { ModuleDrawer, getModuleSavePendingLabel } from "@/app/src/ui/shared/module/ModuleDrawer";
import { ModuleTabs, type ModuleTabItem } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";
import { ChartAccountQuickAddDialog } from "@/app/src/ui/modules/financial-maintenance/charts-of-accounts/ChartAccountQuickAddDialog";
import { ServicesMaintenanceAccountingSetupTab } from "@/app/src/ui/modules/financial-maintenance/services-maintenance/ServicesMaintenanceAccountingSetupTab";
import { ServicesMaintenanceFields } from "@/app/src/ui/modules/financial-maintenance/services-maintenance/ServicesMaintenanceFields";

type ServicesMaintenanceDrawerTab = "details" | "accounting";

const ServicesMaintenanceDrawerTabs = [
	{ id: "details", label: "Details" },
	{ id: "accounting", label: "Accounting Setup" },
] as const satisfies readonly ModuleTabItem<ServicesMaintenanceDrawerTab>[];

export function ServicesMaintenanceDrawer({
	isOpen,
	mode,
	onClose,
	service,
}: ServicesMaintenanceDrawerProps) {
	return (
		<ServicesMaintenanceDrawerPanel
			key={`${mode}-${service?.id ?? "new"}`}
			isOpen={isOpen}
			mode={mode}
			onClose={onClose}
			service={service}
		/>
	);
}

function ServicesMaintenanceDrawerPanel({
	isOpen,
	mode,
	onClose,
	service,
}: {
	isOpen: boolean;
	mode: ServicesMaintenanceDrawerProps["mode"];
	onClose: () => void;
	service?: ServicesMaintenance;
}) {
	const [activeTab, setActiveTab] =
		useState<ServicesMaintenanceDrawerTab>("details");
	const [isAccountTitleDialogOpen, setIsAccountTitleDialogOpen] =
		useState(false);
	const page = useServicesMaintenanceFormPage({
		existingService: service,
		mode,
		onSaved: onClose,
	});
	const copy = ServicesMaintenanceActionCopy[mode];
	const serviceRevenueParentAccount = createServiceRevenueParentAccount(
		page.nextAccountCode,
	);

	function openAccountTitleDialog() {
		if (!serviceRevenueParentAccount) {
			toast.error("Could not find the Service Revenues parent account.");
			return;
		}

		setIsAccountTitleDialogOpen(true);
	}

	return (
		<>
			<ModuleDrawer
				description={copy.description}
				eyebrow={ServicesMaintenanceTitle}
				formId={ServicesMaintenanceDrawerFormId}
				isOpen={isOpen}
				isReadonly={page.isReadonly}
				isSaving={page.isSubmitting}
				onBeforeSaveConfirm={page.validateBeforeSubmit}
				onClose={onClose}
				savingLabel={getModuleSavePendingLabel(mode)}
				submitLabel={mode === "edit" ? "Update Service" : "Save Service"}
				title={copy.title}
			>
				<form
					id={ServicesMaintenanceDrawerFormId}
					onSubmit={page.handleSubmit}
					className="grid gap-5 px-6 py-5"
				>
					<ModuleTabs
						activeTab={activeTab}
						ariaLabel="Service maintenance sections"
						tabs={ServicesMaintenanceDrawerTabs}
						onTabChange={setActiveTab}
					/>

					<section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
						{activeTab === "details" ? (
							<ServicesMaintenanceFields
								errors={page.errors}
								isReadonly={page.isReadonly}
								values={page.values}
								onInputChange={page.handleInputChange}
								onStatusChange={page.setStatus}
							/>
						) : (
							<ServicesMaintenanceAccountingSetupTab
								accountOptions={page.accountOptions}
								errors={page.errors}
								isAccountCodeLoading={page.isNextAccountCodeLoading}
								isReadonly={page.isReadonly}
								mode={mode}
								nextAccountCode={page.nextAccountCode}
								selectedService={service}
								values={page.values}
								onAccountSetupModeChange={page.setAccountSetupMode}
								onAddAccountTitle={openAccountTitleDialog}
								onRevenueAccountChange={page.setRevenueAccount}
							/>
						)}
					</section>
				</form>
			</ModuleDrawer>
			<ChartAccountQuickAddDialog
				accountGroup={["Revenue", "Service Revenues"]}
				accountLabel="Account"
				isOpen={isAccountTitleDialogOpen}
				parentAccount={serviceRevenueParentAccount}
				onClose={() => setIsAccountTitleDialogOpen(false)}
				onSaved={(accountId) => {
					page.setRevenueAccount(accountId);
					page.refreshSetup();
					setIsAccountTitleDialogOpen(false);
				}}
			/>
		</>
	);
}

function createServiceRevenueParentAccount(
	nextAccountCode: ReturnType<typeof useServicesMaintenanceFormPage>["nextAccountCode"],
): ChartAccount | null {
	if (!nextAccountCode?.parentAccountId) {
		return null;
	}

	return {
		id: nextAccountCode.parentAccountId,
		accountNumber: nextAccountCode.parentAccountCode,
		accountName: nextAccountCode.parentAccountTitle,
		accountLevel: nextAccountCode.parentAccountLevel,
		accountGroup: ["Revenue", "Service Revenues", "Services Maintenance Revenue Parent"],
		parentId: null,
		accountType: "REVENUE",
		statementGroup: "Income Statement",
		statementSection: "Revenue",
		reportAlias: "",
		normalBalance: "CREDIT",
		description: nextAccountCode.parentAccountTitle,
		status: "Active",
		showInReports: true,
		isPostingAccount: false,
		isSystemDefault: true,
		isUserCreated: false,
		isBankLinked: false,
		createdBy: null,
		createdAt: "",
		updatedBy: null,
		updatedAt: "",
	};
}
