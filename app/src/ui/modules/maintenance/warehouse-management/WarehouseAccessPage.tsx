"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Package, Save, ShieldCheck } from "lucide-react";
import { createWarehouseItemsHref } from "@/app/src/constants/modules/maintenance/warehouse-management/WarehouseManagementConstants";
import { useWarehouseAccessPage } from "@/app/src/hooks/modules/maintenance/warehouse-management/useWarehouseAccessPage";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { useAppDialogFormSubmit } from "@/app/src/hooks/shared/app/useAppDialogFormSubmit";
import { MaintenanceSavingLabel } from "@/app/src/ui/modules/maintenance/shared/MaintenanceLoadingLabels";
import { WarehouseAccessTable } from "@/app/src/ui/modules/maintenance/warehouse-management/WarehouseAccessTable";
import { WarehouseNotFound } from "@/app/src/ui/modules/maintenance/warehouse-management/WarehouseNotFound";

const WarehouseAccessFormId = "warehouse-access-form";

export function WarehouseAccessPage() {
	const page = useWarehouseAccessPage();
	const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
	const {
		closeDialog: closeSaveDialog,
		isConfirmSubmitPending,
		submitFromDialog,
	} = useAppDialogFormSubmit({
		formId: WarehouseAccessFormId,
		isDialogOpen: isSaveDialogOpen,
		isSubmitting: page.isMutating,
		onDialogOpenChange: setIsSaveDialogOpen,
	});

	if (!page.warehouse) {
		return <WarehouseNotFound />;
	}

	return (
		<>
			<form
				id={WarehouseAccessFormId}
				onSubmit={page.handleSubmit}
				className="grid gap-5"
			>
				<ModuleHeader
					variant="panel"
					titleAs="h1"
					title={`${page.warehouse.name} Access`}
					description="Assign people to this warehouse and edit the permission rights they can use."
					eyebrow={
						<>
							<ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
							Warehouse management
						</>
					}
					actions={
						<>
							<Link
								href={page.warehouseHref}
								className={moduleHeaderActionClassNames.secondary}
							>
								<ArrowLeft className="h-4 w-4" aria-hidden="true" />
								Back
							</Link>
							<Link
								href={createWarehouseItemsHref(page.warehouse.id)}
								className={moduleHeaderActionClassNames.secondary}
							>
								<Package className="h-4 w-4" aria-hidden="true" />
								Items
							</Link>
							<button
								type="button"
								onClick={() => {
									if (page.validateBeforeSubmit()) {
										setIsSaveDialogOpen(true);
									}
								}}
								disabled={page.isMutating}
								className={moduleHeaderActionClassNames.primary}
							>
								<Save className="h-4 w-4" aria-hidden="true" />
								Save Access
							</button>
						</>
					}
				/>

				<WarehouseAccessTable
					accessRecords={page.accessRecords}
					errors={page.errors}
					isPending={page.isMutating}
					onAddAccess={page.addAccess}
					onRemoveAccess={page.removeAccess}
					onTogglePermission={page.togglePermission}
					onUpdateAccess={page.updateAccess}
				/>
			</form>
			<AppDialog
				confirmLabel="Confirm"
				description="This will save the warehouse access assignments and permission changes."
				iconTone="question"
				isOpen={isSaveDialogOpen}
				isPending={isConfirmSubmitPending}
				pendingLabel={MaintenanceSavingLabel}
				title="Save warehouse access?"
				tone="success"
				onCancel={closeSaveDialog}
				onConfirm={submitFromDialog}
			/>
		</>
	);
}
