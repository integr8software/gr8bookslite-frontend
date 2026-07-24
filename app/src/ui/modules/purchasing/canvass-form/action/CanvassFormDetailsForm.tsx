import type { CanvassFormValues } from "@/app/src/types/modules/purchasing/canvass-form/CanvassFormTypes";
import type { CanvassFormFieldUpdater } from "@/app/src/ui/modules/purchasing/canvass-form/action/CanvassFormFieldControls";
import { CanvassFormRequestFields } from "@/app/src/ui/modules/purchasing/canvass-form/action/CanvassFormRequestFields";

type CanvassFormDetailsFormProps = {
	isReadonly: boolean;
	values: CanvassFormValues;
	onUpdateField: CanvassFormFieldUpdater<CanvassFormValues>;
};

export function CanvassFormDetailsForm({
	isReadonly,
	onUpdateField,
	values,
}: CanvassFormDetailsFormProps) {
	return (
		<section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
			<CanvassFormRequestFields
				isReadonly={isReadonly}
				values={values}
				onUpdateField={onUpdateField}
			/>
		</section>
	);
}
