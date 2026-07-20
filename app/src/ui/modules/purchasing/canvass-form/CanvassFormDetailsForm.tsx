import type { CanvassFormValues } from "@/app/src/types/modules/purchasing/canvass-form/CanvassFormTypes";
import type { CanvassFormFieldUpdater } from "@/app/src/ui/modules/purchasing/canvass-form/CanvassFormFieldControls";
import { CanvassFormReferenceFields } from "@/app/src/ui/modules/purchasing/canvass-form/CanvassFormReferenceFields";
import { CanvassFormRequestFields } from "@/app/src/ui/modules/purchasing/canvass-form/CanvassFormRequestFields";

export type CanvassFormDetailsSection = "references" | "request";

type CanvassFormDetailsFormProps = {
	isReadonly: boolean;
	section: CanvassFormDetailsSection;
	values: CanvassFormValues;
	onUpdateField: CanvassFormFieldUpdater<CanvassFormValues>;
};

export function CanvassFormDetailsForm({
	isReadonly,
	onUpdateField,
	section,
	values,
}: CanvassFormDetailsFormProps) {
	return (
		<section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
			{section === "request" ? (
				<CanvassFormRequestFields
					isReadonly={isReadonly}
					values={values}
					onUpdateField={onUpdateField}
				/>
			) : null}
			{section === "references" ? (
				<CanvassFormReferenceFields
					isReadonly={isReadonly}
					values={values}
					onUpdateField={onUpdateField}
				/>
			) : null}
		</section>
	);
}
