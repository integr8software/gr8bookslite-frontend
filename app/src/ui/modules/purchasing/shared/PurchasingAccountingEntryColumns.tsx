import type {
	PurchasingAccountingColumnId,
	PurchasingAccountingEntry,
} from "@/app/src/types/modules/purchasing/PurchasingAccountingTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import {
	MoneyNumberField,
	parseMoneyNumberInput,
} from "@/app/src/ui/shared/money/MoneyNumberField";

const DebitColumnId = "debit";
const CreditColumnId = "credit";

export const PurchasingAccountingColumnIds = [
	"accountCode",
	"accountTitle",
	DebitColumnId,
	CreditColumnId,
	"partyCode",
	"partyName",
	"particulars",
	"vatType",
	"atcCode",
	"responsibilityCenter",
	"refNo",
] as const;

export const PurchasingAccountingDefaultVisibleColumnIds = [
	"accountTitle",
	DebitColumnId,
	CreditColumnId,
	"particulars",
] as const satisfies readonly PurchasingAccountingColumnId[];

export const PurchasingAccountingProtectedColumnIds =
	new Set<PurchasingAccountingColumnId>([
		"accountTitle",
		DebitColumnId,
		CreditColumnId,
	]);

type PurchasingAccountingEntryUpdater = (
	rowId: string,
	updates: Partial<Omit<PurchasingAccountingEntry, "id">>,
) => void;

export function createPurchasingAccountingEntryColumns(
	isReadonly: boolean,
	onUpdateEntry: PurchasingAccountingEntryUpdater,
): ModuleDataEntryColumn<PurchasingAccountingEntry>[] {
	return PurchasingAccountingColumnIds.map((columnId) => ({
		header: PurchasingAccountingColumnLabels[columnId],
		id: columnId,
		width: PurchasingAccountingColumnWidths[columnId],
		widthClassName: getColumnWidthClassName(columnId),
		widthMode: "fixed",
		renderCell: (entry, _index, context) =>
			renderAccountingCell(entry, columnId, context, isReadonly, onUpdateEntry),
	}));
}

function renderAccountingCell(
	entry: PurchasingAccountingEntry,
	columnId: PurchasingAccountingColumnId,
	context: { fieldId: string; fieldName: string },
	isReadonly: boolean,
	onUpdateEntry: PurchasingAccountingEntryUpdater,
) {
	if (columnId === DebitColumnId || columnId === CreditColumnId) {
		return (
			<MoneyNumberField
				id={context.fieldId}
				name={context.fieldName}
				value={entry[columnId] > 0 ? String(entry[columnId]) : ""}
				readOnly={isReadonly}
				onValueChange={(value) => {
					const amount = parseMoneyNumberInput(value);
					const oppositeColumnId =
						columnId === DebitColumnId ? CreditColumnId : DebitColumnId;

					onUpdateEntry(entry.id, {
						[columnId]: amount,
						[oppositeColumnId]:
							amount > 0 ? 0 : entry[oppositeColumnId],
					});
				}}
				className={entryCellControlClassName("text-right tabular-nums")}
			/>
		);
	}

	if (
		columnId === "vatType" ||
		columnId === "atcCode" ||
		columnId === "responsibilityCenter"
	) {
		const options =
			columnId === "responsibilityCenter"
				? ResponsibilityCenterOptions
				: columnId === "vatType"
					? VatTypeOptions
					: TaxTypeOptions;

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
		<input
			id={context.fieldId}
			name={context.fieldName}
			type="text"
			value={String(entry[columnId])}
			readOnly={isReadonly}
			onChange={(event) =>
				onUpdateEntry(entry.id, { [columnId]: event.target.value })
			}
			className={entryCellControlClassName()}
		/>
	);
}

export const PurchasingAccountingColumnLabels: Record<
	PurchasingAccountingColumnId,
	string
> = {
	accountCode: "Account Code",
	accountTitle: "Account Title",
	atcCode: "EWT Code",
	[CreditColumnId]: "Credit",
	[DebitColumnId]: "Debit",
	partyCode: "Party Code",
	partyName: "Party Name",
	particulars: "Particulars",
	refNo: "Reference No",
	responsibilityCenter: "Responsibility Center",
	vatType: "VAT Type",
};

const PurchasingAccountingColumnWidths: Record<PurchasingAccountingColumnId, number> = {
	accountCode: 160,
	accountTitle: 260,
	atcCode: 140,
	[CreditColumnId]: 160,
	[DebitColumnId]: 160,
	partyCode: 150,
	partyName: 220,
	particulars: 320,
	refNo: 160,
	responsibilityCenter: 220,
	vatType: 150,
};

const VatTypeOptions = [
	{ name: "VATable", value: "VATable" },
	{ name: "Zero Rated", value: "Zero Rated" },
	{ name: "Exempt", value: "Exempt" },
];

const TaxTypeOptions = [
	{ name: "None", value: "" },
	{ name: "WI010", value: "WI010", label: "Professional fees" },
	{ name: "WC158", value: "WC158", label: "Goods" },
];

const ResponsibilityCenterOptions = [
	{ name: "Main Office", value: "Main Office" },
	{ name: "Warehouse", value: "Warehouse" },
	{ name: "Operations", value: "Operations" },
];

const EntryDropdownClassName =
	"[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";

function entryCellControlClassName(extraClassName?: string) {
	return joinClasses(
		"h-10 w-full rounded-none border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 disabled:cursor-not-allowed disabled:bg-offwhite/45 disabled:text-darknavy/35",
		extraClassName,
	);
}

function getColumnWidthClassName(columnId: PurchasingAccountingColumnId) {
	switch (columnId) {
		case "accountCode":
		case CreditColumnId:
		case DebitColumnId:
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
