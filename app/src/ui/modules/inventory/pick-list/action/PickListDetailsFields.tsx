import { PickListStatusOptions } from "@/app/src/data/modules/inventory/pick-list/PickListData";
import type { PickListFormValues } from "@/app/src/types/modules/inventory/pick-list/PickListTypes";
import {
	DateField,
	FieldClassName,
	FieldShell,
	TextField,
	type PickListFieldUpdater,
} from "@/app/src/ui/modules/inventory/pick-list/action/PickListFieldControls";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
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
		<div className="grid min-w-0 gap-5 xl:grid-cols-3">
			<TextField
				id="pick-list-party-name"
				label="Party Name"
				isRequired
				readOnly={isReadonly}
				value={values.partyName}
				onChange={(value) => onUpdateField("partyName", value)}
			/>
			<TextField
				id="pick-list-driver-name"
				label="Driver Name"
				readOnly={isReadonly}
				value={values.driverName}
				onChange={(value) => onUpdateField("driverName", value)}
			/>
			<TextField
				id="pick-list-transaction-no"
				label="PL No."
				isRequired
				readOnly={isReadonly}
				value={values.transactionNo}
				onChange={(value) => onUpdateField("transactionNo", value)}
			/>
			<TextField
				id="pick-list-party-code"
				label="Party Code"
				isRequired
				readOnly={isReadonly}
				value={values.partyCode}
				onChange={(value) => onUpdateField("partyCode", value)}
			/>
			<TextField
				id="pick-list-plate-no"
				label="Plate No"
				readOnly={isReadonly}
				value={values.plateNo}
				onChange={(value) => onUpdateField("plateNo", value)}
			/>
			<DateField
				id="pick-list-document-date"
				label="PL Date"
				isRequired
				readOnly={isReadonly}
				value={values.documentDate}
				onChange={(value) => onUpdateField("documentDate", value)}
			/>
			<div className="min-w-0 xl:col-span-2">
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
			<FieldShell controlId="pick-list-status" label="Status">
				<AppAdvancedDropdown
					id="pick-list-status"
					value={values.status}
					readOnly
					options={PickListStatusOptions}
					placeholder="Draft"
					searchPlaceholder="Search status"
					onChange={(value) => onUpdateField("status", String(value))}
				/>
			</FieldShell>
		</div>
	);
}
