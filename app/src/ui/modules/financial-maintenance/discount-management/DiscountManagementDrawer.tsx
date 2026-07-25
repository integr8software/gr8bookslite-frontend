"use client";

import {
	DiscountManagementActionCopy,
	DiscountManagementDrawerFormId,
} from "@/app/src/constants/modules/financial-maintenance/discount-management/DiscountManagementConstants";
import { useDiscountManagementFormPage } from "@/app/src/hooks/modules/financial-maintenance/discount-management/useDiscountManagementFormPage";
import type { DiscountManagementDrawerProps } from "@/app/src/types/modules/financial-maintenance/discount-management/DiscountManagementTypes";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { getModuleSavePendingLabel } from "@/app/src/ui/shared/module/ModuleDrawer";
import { DiscountManagementFields } from "@/app/src/ui/modules/financial-maintenance/discount-management/DiscountManagementFields";

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
	return <ModuleDrawer description={copy.description} eyebrow="Accounting master data" formId={DiscountManagementDrawerFormId} isOpen={isOpen} isReadonly={page.isReadonly} isSaving={page.isMutating} onBeforeSaveConfirm={page.validateBeforeSubmit} onClose={onClose} savingLabel={getModuleSavePendingLabel(mode)} title={copy.title}>
		<form id={DiscountManagementDrawerFormId} onSubmit={page.handleSubmit} className="px-6 py-5">
			<DiscountManagementFields
				errors={page.errors}
				generatedAccount={page.generatedAccount}
				isReadonly={page.isReadonly}
				values={page.values}
				onInputChange={page.handleInputChange}
				onStatusChange={page.handleStatusChange}
			/>
		</form>
	</ModuleDrawer>;
}



