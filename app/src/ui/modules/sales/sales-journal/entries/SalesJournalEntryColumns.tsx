import {
	formatSalesJournalAmount,
} from "@/app/src/data/modules/sales/sales-journal/SalesJournalData";
import {
	getSalesJournalItemVatInclusiveAmount,
} from "@/app/src/data/modules/sales/sales-journal/SalesJournalEntryData";
import type {
	SalesJournalItemEntry,
	SalesJournalItemEntryField,
	SalesJournalItemEntryUpdater,
	SalesJournalEntryUpdater,
	SalesJournalLine,
	SalesJournalLineField,
} from "@/app/src/types/modules/sales/sales-journal/SalesJournalTypes";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";
import type {
	ModuleDataEntryColumn,
	ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

const AmountColumnKind = "amount";
const ReadonlyAmountColumnKind = "readonlyAmount";
const TextColumnKind = "text";

type SalesJournalItemColumnKind =
	| typeof AmountColumnKind
	| typeof ReadonlyAmountColumnKind
	| typeof TextColumnKind;

type SalesJournalItemColumnConfig = {
	header: string;
	id: SalesJournalItemEntryField | "vatInclusiveAmount";
	kind: SalesJournalItemColumnKind;
	width: number;
	widthClassName: string;
};

type SalesJournalColumnKind = typeof AmountColumnKind | typeof TextColumnKind;

type SalesJournalColumnConfig = {
	header: string;
	id: SalesJournalLineField;
	kind: SalesJournalColumnKind;
	width: number;
	widthClassName: string;
};

export function createSalesJournalItemColumns(
	isReadonly: boolean,
	onUpdateEntry: SalesJournalItemEntryUpdater,
): ModuleDataEntryColumn<SalesJournalItemEntry>[] {
	return SalesJournalItemColumnConfigs.map((column) => ({
		header: column.header,
		id: column.id,
		width: column.width,
		widthClassName: column.widthClassName,
		renderCell: (row) => {
			if (column.id === "vatInclusiveAmount") {
				return (
					<EntryAmountInput
						value={formatSalesJournalAmount(
							getSalesJournalItemVatInclusiveAmount(row),
						)}
						readOnly
						onValueChange={() => undefined}
					/>
				);
			}

			if (
				column.kind === AmountColumnKind ||
				column.kind === ReadonlyAmountColumnKind
			) {
				return (
					<EntryAmountInput
						value={String(row[column.id])}
						readOnly={isReadonly || column.kind === ReadonlyAmountColumnKind}
						onValueChange={(value) => onUpdateEntry(row.id, { [column.id]: value })}
					/>
				);
			}

			return (
				<EntryInput
					value={String(row[column.id])}
					readOnly={isReadonly}
					onChange={(value) => onUpdateEntry(row.id, { [column.id]: value })}
				/>
			);
		},
	}));
}

export function createSalesJournalAccountColumns(
	isReadonly: boolean,
	onUpdateEntry: SalesJournalEntryUpdater,
): ModuleDataEntryColumn<SalesJournalLine>[] {
	return SalesJournalColumnConfigs.map((column) => ({
		header: column.header,
		id: column.id,
		width: column.width,
		widthClassName: column.widthClassName,
		renderCell: (row) => (
			<SalesJournalEntryCell
				column={column}
				isReadonly={isReadonly}
				row={row}
				onUpdateEntry={onUpdateEntry}
			/>
		),
	}));
}

export function createSalesJournalColumnOptions<TRow>(
	columns: ModuleDataEntryColumn<TRow>[],
): ModuleDataEntryColumnOption[] {
	return columns.map((column) => ({
		id: column.id,
		isHideable: false,
		isVisible: true,
		label: column.header,
		width: column.width,
		widthMode: column.widthMode,
	}));
}

function SalesJournalEntryCell({
	column,
	isReadonly,
	onUpdateEntry,
	row,
}: {
	column: SalesJournalColumnConfig;
	isReadonly: boolean;
	onUpdateEntry: SalesJournalEntryUpdater;
	row: SalesJournalLine;
}) {
	const value = String(row[column.id]);

	if (column.kind === AmountColumnKind) {
		return (
			<EntryAmountInput
				value={formatSalesJournalAmount(Number(row[column.id] || 0))}
				readOnly={isReadonly}
				onValueChange={(nextValue) => onUpdateEntry(row.id, column.id, nextValue)}
			/>
		);
	}

	return (
		<EntryInput
			value={value}
			readOnly={isReadonly}
			onChange={(nextValue) => onUpdateEntry(row.id, column.id, nextValue)}
		/>
	);
}

function EntryInput({
	onChange,
	readOnly,
	value,
}: {
	onChange: (value: string) => void;
	readOnly: boolean;
	value: string;
}) {
	return (
		<input
			type="text"
			value={value}
			readOnly={readOnly}
			onChange={(event) => onChange(event.target.value)}
			className={entryCellControlClassName()}
		/>
	);
}

function EntryAmountInput({
	onValueChange,
	readOnly,
	value,
}: {
	onValueChange: (value: string) => void;
	readOnly: boolean;
	value: string;
}) {
	return (
		<MoneyNumberField
			value={value}
			readOnly={readOnly}
			onValueChange={onValueChange}
			className={entryCellControlClassName("text-right tabular-nums")}
		/>
	);
}

function entryCellControlClassName(extraClassName?: string) {
	return joinClasses(
		"h-10 w-full rounded-none border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 disabled:cursor-not-allowed disabled:bg-offwhite/45 disabled:text-darknavy/35",
		extraClassName,
	);
}

function salesJournalColumn(
	header: string,
	id: SalesJournalLineField,
	kind: SalesJournalColumnKind,
	width: number,
	widthClassName: string,
): SalesJournalColumnConfig {
	return {
		header,
		id,
		kind,
		width,
		widthClassName,
	};
}

function salesJournalItemColumn(
	header: string,
	id: SalesJournalItemColumnConfig["id"],
	kind: SalesJournalItemColumnKind,
	width: number,
	widthClassName: string,
): SalesJournalItemColumnConfig {
	return {
		header,
		id,
		kind,
		width,
		widthClassName,
	};
}

const SalesJournalColumnConfigs = [
	salesJournalColumn("Acct Code", "accountCode", TextColumnKind, 150, "w-[9.5rem]"),
	salesJournalColumn("Acct Title", "accountTitle", TextColumnKind, 260, "w-[16rem]"),
	salesJournalColumn("Debit", "debit", AmountColumnKind, 140, "w-[8.75rem]"),
	salesJournalColumn("Credit", "credit", AmountColumnKind, 140, "w-[8.75rem]"),
];

const SalesJournalItemColumnConfigs = [
	salesJournalItemColumn(
		"Professional Service Type",
		"professionalServiceType",
		TextColumnKind,
		260,
		"w-[16rem]",
	),
	salesJournalItemColumn("Rate", "rate", AmountColumnKind, 140, "w-[8.75rem]"),
	salesJournalItemColumn("Qty", "quantity", AmountColumnKind, 100, "w-[6.25rem]"),
	salesJournalItemColumn(
		"Amount",
		"amount",
		ReadonlyAmountColumnKind,
		140,
		"w-[8.75rem]",
	),
	salesJournalItemColumn("VAT", "vatAmount", AmountColumnKind, 130, "w-[8.125rem]"),
	salesJournalItemColumn(
		"VAT Inc.",
		"vatInclusiveAmount",
		ReadonlyAmountColumnKind,
		140,
		"w-[8.75rem]",
	),
	salesJournalItemColumn(
		"Disct",
		"discountAmount",
		AmountColumnKind,
		130,
		"w-[8.125rem]",
	),
	salesJournalItemColumn(
		"Net Amt",
		"netAmount",
		ReadonlyAmountColumnKind,
		150,
		"w-[9.375rem]",
	),
];
