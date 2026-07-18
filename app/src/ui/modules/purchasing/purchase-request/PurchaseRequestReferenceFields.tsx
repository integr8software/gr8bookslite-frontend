import { PurchaseRequestStatusOptions } from "@/app/src/constants/modules/purchasing/purchase-request/PurchaseRequestConstants";
import type {
	PurchaseRequestFormValues,
	PurchaseRequestStatus,
} from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";
import {
	PurchaseRequestDateField,
	PurchaseRequestSelectField,
	PurchaseRequestTextField,
	type PurchaseRequestFieldUpdater,
} from "@/app/src/ui/modules/purchasing/purchase-request/PurchaseRequestFormControls";

type PurchaseRequestReferenceFieldsProps = {
	isReadonly: boolean;
	values: PurchaseRequestFormValues;
	onUpdateField: PurchaseRequestFieldUpdater<PurchaseRequestFormValues>;
};

export function PurchaseRequestReferenceFields({
	isReadonly,
	onUpdateField,
	values,
}: PurchaseRequestReferenceFieldsProps) {
	return (
		<div className="grid min-w-0 gap-5 xl:grid-cols-2">
			<div className="grid min-w-0 gap-4">
				<PurchaseRequestTextField
					id="purchase-request-trans-no"
					label="Trans No."
					isRequired
					readOnly={isReadonly}
					value={values.transNo}
					onChange={(value) => onUpdateField("transNo", value)}
				/>
				<PurchaseRequestDateField
					id="purchase-request-pr-date"
					label="PR Date"
					readOnly={isReadonly}
					value={values.prDate}
					onChange={(value) => onUpdateField("prDate", value)}
				/>
				<PurchaseRequestSelectField
					id="purchase-request-status"
					label="Status"
					readOnly={isReadonly}
					value={values.status}
					options={PurchaseRequestStatusOptions}
					onChange={(value) =>
						onUpdateField("status", value as PurchaseRequestStatus)
					}
				/>
			</div>
			<div className="grid min-w-0 content-start gap-4">
				<PurchaseRequestTextField
					id="purchase-request-bom-no"
					label="BOM No."
					readOnly={isReadonly}
					value={values.bomNo}
					onChange={(value) => onUpdateField("bomNo", value)}
				/>
				<PurchaseRequestTextField
					id="purchase-request-project-code"
					label="Project Code"
					readOnly={isReadonly}
					value={values.projectCode}
					onChange={(value) => onUpdateField("projectCode", value)}
				/>
				<PurchaseRequestTextField
					id="purchase-request-project-name"
					label="Project Name"
					readOnly={isReadonly}
					value={values.projectName}
					onChange={(value) => onUpdateField("projectName", value)}
				/>
			</div>
		</div>
	);
}
