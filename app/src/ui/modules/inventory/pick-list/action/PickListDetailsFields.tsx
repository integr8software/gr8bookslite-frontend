import { PickListStatusFilterOptions } from "@/app/src/constants/modules/inventory/pick-list/PickListConstants";
import { PickListClusterOptions } from "@/app/src/data/modules/inventory/pick-list/PickListData";
import type { PickListFormValues } from "@/app/src/types/modules/inventory/pick-list/PickListTypes";
import {
	DateField,
	FieldClassName,
	FieldShell,
	SelectField,
	TextField,
	type PickListFieldUpdater,
} from "@/app/src/ui/modules/inventory/pick-list/action/PickListFieldControls";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";

type PickListDetailsFieldsProps = {
	isReadonly: boolean;
	values: PickListFormValues;
	onUpdateField: PickListFieldUpdater<PickListFormValues>;
};

export function PickListDetailsFields({
	isReadonly,
	onUpdateField,
	values,
}: PickListDetailsFieldsProps) {
	return (
		<div className="grid min-w-0 gap-5 xl:grid-cols-2">
			<div className="grid min-w-0 gap-4">
				<TextField
					id="pick-list-transaction-no"
					label="Pick List ID"
					isRequired
					readOnly={isReadonly}
					value={values.transactionNo}
					onChange={(value) => onUpdateField("transactionNo", value)}
				/>
				<DateField
					id="pick-list-delivery-date"
					label="Delivery Date"
					readOnly={isReadonly}
					value={values.deliveryDate}
					onChange={(value) => onUpdateField("deliveryDate", value)}
				/>
				<TextField
					id="pick-list-driver-name"
					label="Driver Name"
					readOnly={isReadonly}
					value={values.driverName}
					onChange={(value) => onUpdateField("driverName", value)}
				/>
				<TextField
					id="pick-list-plate-no"
					label="Plate No."
					readOnly={isReadonly}
					value={values.plateNo}
					onChange={(value) => onUpdateField("plateNo", value)}
				/>
			</div>
			<div className="grid min-w-0 content-start gap-4">
				<DateField
					id="pick-list-document-date"
					label="Document Date"
					readOnly={isReadonly}
					value={values.documentDate}
					onChange={(value) => onUpdateField("documentDate", value)}
				/>
				<FieldShell controlId="pick-list-status" label="Status">
					<SelectField
						value={values.status}
						readOnly={isReadonly}
						options={PickListStatusOptions}
						placeholder="Select status"
						onChange={(value) => onUpdateField("status", value)}
					/>
				</FieldShell>
				<FieldShell controlId="pick-list-cluster" label="Cluster">
					<SelectField
						value={values.cluster}
						readOnly={isReadonly}
						options={PickListClusterOptions}
						placeholder="Select cluster"
						onChange={(value) => onUpdateField("cluster", value)}
					/>
				</FieldShell>
				<FieldShell controlId="pick-list-remarks" label="Remarks">
					<AppLimitedTextarea
						id="pick-list-remarks"
						value={values.remarks}
						readOnly={isReadonly}
						onChange={(event) => onUpdateField("remarks", event.target.value)}
						className={`${FieldClassName} min-h-24 py-3`}
						counterMode="remaining"
						maxLength={250}
					/>
				</FieldShell>
			</div>
		</div>
	);
}

const PickListStatusOptions = PickListStatusFilterOptions.filter(
	(option) => option.value !== "all",
).map((option) => ({
	name: option.label,
	value: option.value,
}));
