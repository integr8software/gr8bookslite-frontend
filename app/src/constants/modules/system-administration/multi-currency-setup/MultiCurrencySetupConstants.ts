import type {
	MultiCurrencySetupActionMode,
	MultiCurrencySetupTableColumnKey,
	MultiCurrencyStatus,
} from "@/app/src/types/modules/system-administration/multi-currency-setup/MultiCurrencySetupTypes";

export const MultiCurrencySetupHref =
	"/system-administration/multi-currency-setup";

export const MultiCurrencySetupTablePaginationStorageKey =
	"system-administration:multi-currency-setup";

export const MultiCurrencySetupStatusOptions: MultiCurrencyStatus[] = [
	"Active",
	"Inactive",
];

export const MultiCurrencySetupTableColumns: Array<
	| {
			className: string;
			key: MultiCurrencySetupTableColumnKey;
			label: string;
	  }
	| {
			className: string;
			label: string;
	  }
> = [
	{
		key: "targetCurrencyLabel",
		label: "Currency",
		className: "w-[22%]",
	},
	{
		key: "currentExchangeRateDisplay",
		label: "API Rate",
		className: "w-[18%]",
	},
	{
		key: "originalExchangeRateDisplay",
		label: "Configured Rate",
		className: "w-[18%]",
	},
	{
		key: "varianceDisplay",
		label: "Variance",
		className: "w-[14%]",
	},
	{
		key: "status",
		label: "Status",
		className: "w-[12%]",
	},
	{
		label: "Actions",
		className: "w-[16%] text-right",
	},
];

export const MultiCurrencySetupActionCopy: Record<
	MultiCurrencySetupActionMode,
	{
		description: string;
		title: string;
	}
> = {
	add: {
		title: "Add Multi-Currency Setup",
		description:
			"Capture the preferred base currency and the wanted currency rate at the time of setup.",
	},
	edit: {
		title: "Edit Multi-Currency Setup",
		description:
			"Update the currency pair while preserving the original exchange rate used as the baseline.",
	},
	view: {
		title: "View Multi-Currency Setup",
		description:
			"Review the base currency, original rate, and latest fetched rate for this currency pair.",
	},
};
