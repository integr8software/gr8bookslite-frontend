import {
	DeliveryReceiptPartyOptions,
	DeliveryReceiptResponsibilityCenterOptions,
} from "@/app/src/data/modules/inventory/delivery-receipt/DeliveryReceiptData";
import type { DeliveryReceiptAccountingEntry } from "@/app/src/types/modules/inventory/delivery-receipt/DeliveryReceiptTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { parseMoneyNumberInput } from "@/app/src/ui/shared/money/MoneyNumberField";
import {
	DeliveryReceiptEntryAmountInput,
	DeliveryReceiptEntryTextInput,
} from "@/app/src/ui/modules/inventory/delivery-receipt/entries/DeliveryReceiptEntryCellControls";

export const DeliveryReceiptAccountingColumnIds = [
	"accountCode",
	"accountTitle",
	"debit",
	"credit",
	"partyCode",
	"partyName",
	"particulars",
	"vatType",
	"atcCode",
	"responsibilityCenter",
	"refNo",
] as const;

export type DeliveryReceiptAccountingColumnId =
	(typeof DeliveryReceiptAccountingColumnIds)[number];

export const DeliveryReceiptAccountingDefaultVisibleColumnIds = [
	"accountTitle",
	"debit",
	"credit",
	"particulars",
] as const satisfies readonly DeliveryReceiptAccountingColumnId[];

export const DeliveryReceiptAccountingProtectedColumnIds =
	new Set<DeliveryReceiptAccountingColumnId>([
		"accountTitle",
		"debit",
		"credit",
	]);

const DeliveryReceiptAccountingColumnLabels: Record<
	DeliveryReceiptAccountingColumnId,
	string
> = {
	accountCode: "Account Code",
	accountTitle: "Account Title",
	atcCode: "EWT Code",
	credit: "Credit",
	debit: "Debit",
	partyCode: "Party Code",
	partyName: "Party Name",
	particulars: "Particulars",
	refNo: "Reference No",
	responsibilityCenter: "Responsibility Center",
	vatType: "VAT Type",
};

const DeliveryReceiptAccountingColumnWidths: Record<
	DeliveryReceiptAccountingColumnId,
	number
> = {
	accountCode: 160,
	accountTitle: 260,
	atcCode: 140,
	credit: 160,
	debit: 160,
	partyCode: 150,
	partyName: 220,
	particulars: 320,
	refNo: 160,
	responsibilityCenter: 220,
	vatType: 150,
};

type DeliveryReceiptAccountingEntryUpdater = (
	rowId: string,
	updates: Partial<Omit<DeliveryReceiptAccountingEntry, "id">>,
) => void;

export function createDeliveryReceiptAccountingEntryColumns(
	isReadonly: boolean,
	onUpdateEntry: DeliveryReceiptAccountingEntryUpdater,
): ModuleDataEntryColumn<DeliveryReceiptAccountingEntry>[] {
	return DeliveryReceiptAccountingColumnIds.map((columnId) => ({
		header: DeliveryReceiptAccountingColumnLabels[columnId],
		id: columnId,
		width: DeliveryReceiptAccountingColumnWidths[columnId],
		widthClassName: getColumnWidthClassName(columnId),
		widthMode: "fixed",
		renderCell: (entry, _index, context) =>
			renderAccountingCell(entry, columnId, context, isReadonly, onUpdateEntry),
	}));
}

function renderAccountingCell(
	entry: DeliveryReceiptAccountingEntry,
	columnId: DeliveryReceiptAccountingColumnId,
	context: { fieldId: string; fieldName: string },
	isReadonly: boolean,
	onUpdateEntry: DeliveryReceiptAccountingEntryUpdater,
) {
	if (columnId === "debit" || columnId === "credit") {
		return (
			<DeliveryReceiptEntryAmountInput
				id={context.fieldId}
				name={context.fieldName}
				value={entry[columnId] > 0 ? String(entry[columnId]) : ""}
				readOnly={isReadonly}
				onValueChange={(value) => {
					const amount = parseMoneyNumberInput(value);

					onUpdateEntry(entry.id, {
						[columnId]: amount,
						[columnId === "debit" ? "credit" : "debit"]:
							amount > 0 ? 0 : entry[columnId === "debit" ? "credit" : "debit"],
					});
				}}
			/>
		);
	}

	if (columnId === "partyName") {
		return (
			<AppAdvancedDropdown
				id={context.fieldId}
				name={context.fieldName}
				className={EntryDropdownClassName}
				value={entry.partyName}
				readOnly={isReadonly}
				options={DeliveryReceiptPartyOptions}
				placeholder=""
				searchPlaceholder="Search party"
				showSelectedDetails
				onChange={(value) => {
					const partyName = String(value);
					const selectedParty = DeliveryReceiptPartyOptions.find(
						(option) => option.value === partyName,
					);

					onUpdateEntry(entry.id, {
						partyCode: selectedParty?.value ?? "",
						partyName,
					});
				}}
			/>
		);
	}

	if (columnId === "vatType" || columnId === "atcCode" || columnId === "responsibilityCenter") {
		const options =
			columnId === "responsibilityCenter"
				? DeliveryReceiptResponsibilityCenterOptions
				: columnId === "vatType"
					? DeliveryReceiptVatTypeOptions
					: DeliveryReceiptTaxTypeOptions;

		return (
			<AppAdvancedDropdown
				id={context.fieldId}
				name={context.fieldName}
				className={EntryDropdownClassName}
				value={String(entry[columnId])}
				readOnly={isReadonly}
				options={options}
				placeholder=""
				onChange={(value) =>
					onUpdateEntry(entry.id, { [columnId]: String(value) })
				}
			/>
		);
	}

	return (
		<DeliveryReceiptEntryTextInput
			id={context.fieldId}
			name={context.fieldName}
			value={String(entry[columnId])}
			readOnly={isReadonly || columnId === "partyCode"}
			onChange={(value) => onUpdateEntry(entry.id, { [columnId]: value })}
		/>
	);
}

const DeliveryReceiptVatTypeOptions = [
	{ name: "VATable", value: "VATable" },
	{ name: "Zero Rated", value: "Zero Rated" },
	{ name: "Exempt", value: "Exempt" },
];

const DeliveryReceiptTaxTypeOptions = [
	{ name: "None", value: "" },
	{ name: "WI010", value: "WI010", label: "Professional fees" },
	{ name: "WC158", value: "WC158", label: "Goods" },
];

const EntryDropdownClassName =
	"[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";

function getColumnWidthClassName(columnId: DeliveryReceiptAccountingColumnId) {
	switch (columnId) {
		case "accountCode":
		case "credit":
		case "debit":
		case "refNo":
			return "w-[10rem]";
		case "accountTitle":
			return "w-[16.25rem]";
		case "particulars":
			return "w-[20rem]";
		case "partyName":
		case "responsibilityCenter":
			return "w-[13.75rem]";
		case "partyCode":
		case "vatType":
			return "w-[9.5rem]";
		case "atcCode":
			return "w-[8.75rem]";
		default:
			return "w-[10rem]";
	}
}
