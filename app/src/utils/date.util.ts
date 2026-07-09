type FormatDateTimeOptions = {
	emptyValue?: string;
	invalidValue?: string;
	locale?: string;
};

export function formatDateTime(
	value?: Date | string,
	{
		emptyValue = "",
		invalidValue,
		locale = "en-PH",
	}: FormatDateTimeOptions = {},
) {
	if (!value) {
		return emptyValue;
	}

	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) {
		return invalidValue ?? (typeof value === "string" ? value : emptyValue);
	}

	return new Intl.DateTimeFormat(locale, {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(date);
}
