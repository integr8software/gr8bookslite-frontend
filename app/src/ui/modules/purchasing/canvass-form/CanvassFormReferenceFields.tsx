import { CanvassFormStatusOptions } from "@/app/src/constants/modules/purchasing/canvass-form/CanvassFormConstants";
import type {
	CanvassFormStatus,
	CanvassFormValues,
} from "@/app/src/types/modules/purchasing/canvass-form/CanvassFormTypes";
import {
	DateField,
	SelectField,
	TextField,
	type CanvassFormFieldUpdater,
} from "@/app/src/ui/modules/purchasing/canvass-form/CanvassFormFieldControls";

type CanvassFormReferenceFieldsProps = {
	isReadonly: boolean;
	values: CanvassFormValues;
	onUpdateField: CanvassFormFieldUpdater<CanvassFormValues>;
};

export function CanvassFormReferenceFields({
	isReadonly,
	onUpdateField,
	values,
}: CanvassFormReferenceFieldsProps) {
	return (
		<div className="grid min-w-0 gap-5 xl:grid-cols-2">
			<div className="grid min-w-0 gap-4">
				<TextField
					id="canvass-form-trans-no"
					label="Trans No."
					isRequired
					readOnly={isReadonly}
					value={values.transNo}
					onChange={(value) => onUpdateField("transNo", value)}
				/>
				<DateField
					id="canvass-form-document-date"
					label="Document Date"
					readOnly={isReadonly}
					value={values.documentDate}
					onChange={(value) => onUpdateField("documentDate", value)}
				/>
				<SelectField
					id="canvass-form-status"
					label="Status"
					readOnly={isReadonly}
					value={values.status}
					options={CanvassFormStatusOptions}
					onChange={(value) => onUpdateField("status", value as CanvassFormStatus)}
				/>
			</div>
		</div>
	);
}
