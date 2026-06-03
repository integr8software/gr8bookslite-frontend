"use client";

import { DiscountManagementActionCopy } from "@/app/src/constants/modules/maintenance/financial-management/discount-management/DiscountManagementConstants";
import { useDiscountManagementFormPage } from "@/app/src/hooks/modules/maintenance/financial-management/discount-management/useDiscountManagementFormPage";
import type { Discount, DiscountManagementActionMode } from "@/app/src/types/modules/maintenance/financial-management/discount-management/DiscountManagementTypes";
import { MaintenanceFormDrawer } from "@/app/src/ui/modules/maintenance/shared/MaintenanceFormDrawer";
import { DiscountManagementFields } from "@/app/src/ui/modules/maintenance/financial-management/discount-management/DiscountManagementFields";

const formId = "discount-management-drawer-form";

export function DiscountManagementDrawer({ discount, isOpen, mode, onClose }: {
	discount?: Discount; isOpen: boolean; mode: DiscountManagementActionMode; onClose: () => void;
}) {
	return <DiscountManagementDrawerPanel key={`${mode}-${discount?.id ?? "new"}`} discount={discount} isOpen={isOpen} mode={mode} onClose={onClose} />;
}

function DiscountManagementDrawerPanel({ discount, isOpen, mode, onClose }: {
	discount?: Discount; isOpen: boolean; mode: DiscountManagementActionMode; onClose: () => void;
}) {
	const page = useDiscountManagementFormPage({ existingDiscount: discount, mode, onSaved: onClose });
	const copy = DiscountManagementActionCopy[mode];
	return <MaintenanceFormDrawer description={copy.description} eyebrow="Accounting master data" formId={formId} isOpen={isOpen} isSaving={page.isMutating} onClose={onClose} title={copy.title}>
		<form id={formId} onSubmit={page.handleSubmit} className="px-6 py-5">
			<DiscountManagementFields accountQuery={page.accountQuery} errors={page.errors} isReadonly={false} matchedAccounts={page.matchedAccounts} selectedAccount={page.selectedAccount} values={page.values} onAccountQueryChange={page.handleAccountQueryChange} onInputChange={page.handleInputChange} onSelectAccount={page.handleSelectAccount} />
		</form>
	</MaintenanceFormDrawer>;
}
