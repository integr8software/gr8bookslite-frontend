import type { PickListFormValues } from "@/app/src/types/modules/inventory/pick-list/PickListTypes";
import type { PickListFieldUpdater } from "@/app/src/ui/modules/inventory/pick-list/action/PickListFieldControls";
import { PickListDetailsFields } from "@/app/src/ui/modules/inventory/pick-list/action/PickListDetailsFields";

type PickListDetailsFormProps = {
	isReadonly: boolean;
	values: PickListFormValues;
	onUpdateField: PickListFieldUpdater<PickListFormValues>;
};

export function PickListDetailsForm({
	isReadonly,
	onUpdateField,
	values,
}: PickListDetailsFormProps) {
	return (
		<section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
			<PickListDetailsFields
				isReadonly={isReadonly}
				values={values}
				onUpdateField={onUpdateField}
			/>
		</section>
	);
}
