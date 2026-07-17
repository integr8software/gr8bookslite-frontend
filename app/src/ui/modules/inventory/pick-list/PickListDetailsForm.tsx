import type { PickListFormValues } from "@/app/src/types/modules/inventory/pick-list/PickListTypes";
import type { PickListFieldUpdater } from "@/app/src/ui/modules/inventory/pick-list/PickListFieldControls";
import { PickListDeliveryFields } from "@/app/src/ui/modules/inventory/pick-list/PickListDeliveryFields";
import { PickListReferenceFields } from "@/app/src/ui/modules/inventory/pick-list/PickListReferenceFields";

export type PickListDetailsSection = "delivery" | "references";

type PickListDetailsFormProps = {
	isReadonly: boolean;
	section: PickListDetailsSection;
	values: PickListFormValues;
	onUpdateField: PickListFieldUpdater<PickListFormValues>;
};

export function PickListDetailsForm({
	isReadonly,
	onUpdateField,
	section,
	values,
}: PickListDetailsFormProps) {
	return (
		<section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
			{section === "delivery" ? (
				<PickListDeliveryFields
					isReadonly={isReadonly}
					values={values}
					onUpdateField={onUpdateField}
				/>
			) : null}
			{section === "references" ? (
				<PickListReferenceFields
					isReadonly={isReadonly}
					values={values}
					onUpdateField={onUpdateField}
				/>
			) : null}
		</section>
	);
}
