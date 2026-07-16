"use client";

import {
	DiscountManagementActionCopy,
	DiscountManagementDrawerFormId,
} from "@/app/src/constants/modules/maintenance/financial-management/discount-management/DiscountManagementConstants";
import { useDiscountManagementFormPage } from "@/app/src/hooks/modules/maintenance/discount-management/useDiscountManagementFormPage";
import type { DiscountManagementDrawerProps } from "@/app/src/types/modules/maintenance/discount-management/DiscountManagementTypes";
import { MaintenanceFormDrawer } from "@/app/src/ui/modules/maintenance/shared/MaintenanceFormDrawer";
import { getMaintenanceSavePendingLabel } from "@/app/src/ui/modules/maintenance/shared/MaintenanceLoadingLabels";
import { DiscountManagementFields } from "@/app/src/ui/modules/maintenance/discount-management/DiscountManagementFields";

export function DiscountManagementDrawer({
	discount,
	isOpen,
	mode,
	onClose,
}: DiscountManagementDrawerProps) {
	return <DiscountManagementDrawerPanel key={`${mode}-${discount?.id ?? "new"}`} discount={discount} isOpen={isOpen} mode={mode} onClose={onClose} />;
}

function DiscountManagementDrawerPanel({
	discount,
	isOpen,
	mode,
	onClose,
}: DiscountManagementDrawerProps) {
	const page = useDiscountManagementFormPage({ existingDiscount: discount, mode, onSaved: onClose });
	const copy = DiscountManagementActionCopy[mode];
	return <MaintenanceFormDrawer description={copy.description} eyebrow="Accounting master data" formId={DiscountManagementDrawerFormId} isOpen={isOpen} isReadonly={page.isReadonly} isSaving={page.isMutating} onBeforeSaveConfirm={page.validateBeforeSubmit} onClose={onClose} savingLabel={getMaintenanceSavePendingLabel(mode)} title={copy.title}>
		<form id={DiscountManagementDrawerFormId} onSubmit={page.handleSubmit} className="px-6 py-5">
			<DiscountManagementFields
				errors={page.errors}
				generatedAccount={page.generatedAccount}
				isReadonly={page.isReadonly}
				values={page.values}
				onInputChange={page.handleInputChange}
			/>
		</form>
	</MaintenanceFormDrawer>;
}
