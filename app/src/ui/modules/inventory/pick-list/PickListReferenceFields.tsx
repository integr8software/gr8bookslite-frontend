import type { PickListFormValues } from "@/app/src/types/modules/inventory/pick-list/PickListTypes";
import {
	DateField,
	TextField,
	type PickListFieldUpdater,
} from "@/app/src/ui/modules/inventory/pick-list/PickListFieldControls";

type PickListReferenceFieldsProps = {
	isReadonly: boolean;
	values: PickListFormValues;
	onUpdateField: PickListFieldUpdater<PickListFormValues>;
};

export function PickListReferenceFields({
	isReadonly,
	onUpdateField,
	values,
}: PickListReferenceFieldsProps) {
	return (
		<div className="grid min-w-0 gap-5 xl:grid-cols-2">
			<div className="grid min-w-0 content-start gap-4">
				<TextField
					id="pick-list-transaction-no"
					label="Trans No."
					isRequired
					readOnly={isReadonly}
					value={values.transactionNo}
					onChange={(value) => onUpdateField("transactionNo", value)}
				/>
				<DateField
					id="pick-list-document-date"
					label="Document Date"
					readOnly={isReadonly}
					value={values.documentDate}
					onChange={(value) => onUpdateField("documentDate", value)}
				/>
			</div>
			<div className="grid min-w-0 content-start gap-4">
				<TextField
					id="pick-list-status"
					label="Status"
					readOnly={isReadonly}
					value={values.status}
					onChange={(value) => onUpdateField("status", value)}
				/>
			</div>
		</div>
	);
}
