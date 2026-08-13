type FormatDateTimeOptions = {
	emptyValue?: string;
	invalidValue?: string;
	locale?: string;
};

export function todayDateValue() {
	return new Date().toISOString().slice(0, 10);
}

export function parseIsoDate(value: string) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return null;
	}

	const [year, month, day] = value.split("-").map(Number);
	const date = new Date(year, month - 1, day);

	if (
		date.getFullYear() !== year ||
		date.getMonth() !== month - 1 ||
		date.getDate() !== day
	) {
		return null;
	}

	return date;
}

export function coerceDate(value: Date | string | undefined) {
	if (!value) {
		return null;
	}

	if (value instanceof Date) {
		return startOfDay(value);
	}

	return parseIsoDate(value);
}

export function toIsoDate(date: Date) {
	const year = date.getFullYear();
	const month = `${date.getMonth() + 1}`.padStart(2, "0");
	const day = `${date.getDate()}`.padStart(2, "0");

	return `${year}-${month}-${day}`;
}

export function startOfDay(date: Date) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function startOfWeek(date: Date) {
	const day = startOfDay(date);

	return addDays(day, -day.getDay());
}

export function endOfWeek(date: Date) {
	return addDays(startOfWeek(date), 6);
}

export function startOfMonth(date: Date) {
	return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date) {
	return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function startOfYear(date: Date) {
	return new Date(date.getFullYear(), 0, 1);
}

export function endOfYear(date: Date) {
	return new Date(date.getFullYear(), 11, 31);
}

export function addDays(date: Date, days: number) {
	const nextDate = startOfDay(date);
	nextDate.setDate(nextDate.getDate() + days);

	return nextDate;
}

export function addMonths(date: Date, months: number) {
	return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export function formatDate(
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
	}).format(date);
}

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
