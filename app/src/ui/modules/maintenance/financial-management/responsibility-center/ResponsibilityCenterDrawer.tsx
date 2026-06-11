"use client";

import { ResponsibilityCenterActionCopy } from "@/app/src/constants/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterConstants";
import { useResponsibilityCenterAction } from "@/app/src/hooks/modules/maintenance/financial-management/responsibility-center/useResponsibilityCenterAction";
import type {
	ResponsibilityCenter,
	ResponsibilityCenterActionMode,
} from "@/app/src/types/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterTypes";
import { ResponsibilityCenterDetailsFields } from "@/app/src/ui/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterDetailsFields";
import { MaintenanceFormDrawer } from "@/app/src/ui/modules/maintenance/shared/MaintenanceFormDrawer";

const ResponsibilityCenterDrawerFormId = "responsibility-center-drawer-form";

type ResponsibilityCenterDrawerProps = {
	center?: ResponsibilityCenter;
	isOpen: boolean;
	mode: ResponsibilityCenterActionMode;
	onClose: () => void;
};

export function ResponsibilityCenterDrawer(props: ResponsibilityCenterDrawerProps) {
	return (
		<ResponsibilityCenterDrawerPanel
			key={`${props.mode}-${props.center?.id ?? "new"}`}
			{...props}
		/>
	);
}

function ResponsibilityCenterDrawerPanel({
	center,
	isOpen,
	mode,
	onClose,
}: ResponsibilityCenterDrawerProps) {
	const action = useResponsibilityCenterAction({
		center,
		mode,
		onSaved: onClose,
	});
	const copy = ResponsibilityCenterActionCopy[mode];

	return (
		<MaintenanceFormDrawer
			description={copy.description}
			eyebrow="Accounting master data"
			formId={ResponsibilityCenterDrawerFormId}
			isOpen={isOpen}
			isSaving={action.isMutating}
			onClose={onClose}
			title={copy.title}
		>
			<form
				id={ResponsibilityCenterDrawerFormId}
				onSubmit={action.onSubmit}
				className="px-6 py-5"
			>
				<ResponsibilityCenterDetailsFields
					errors={action.errors}
					isReadonly={false}
					parentOptions={action.parentOptions}
					values={action.values}
					onFieldChange={action.onFieldChange}
					onInputChange={action.onInputChange}
				/>
			</form>
		</MaintenanceFormDrawer>
	);
}
