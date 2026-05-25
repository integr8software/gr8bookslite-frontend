import type {
	MasterPromotionFormValues,
	MasterPromotionRecord,
} from "@/app/src/types/master/promotions/MasterPromotionTypes";

export const MasterPromotionRecords: MasterPromotionRecord[] = [
	{
		code: "WELCOME20",
		description:
			"Launch promo code for new subscribers selecting any paid plan.",
		discountKind: "Percent",
		expiresAt: "2026-12-31",
		id: "promo-welcome20",
		name: "Welcome Launch",
		redemptions: 184,
		status: "Active",
		target: "All Plans",
		type: "Promo Code",
		value: 20,
	},
	{
		code: "ACCOUNTING100",
		description:
			"Coupon for accounting-first customers moving from trial to paid onboarding.",
		discountKind: "Fixed",
		expiresAt: "2026-08-31",
		id: "coupon-accounting100",
		name: "Accounting Starter",
		redemptions: 92,
		status: "Active",
		target: "Accounting",
		type: "Coupon",
		value: 100,
	},
	{
		code: "ADDON-VCHR",
		description:
			"Voucher credit for additional users, branches, satellites, or company add-ons.",
		discountKind: "Fixed",
		expiresAt: "2026-09-30",
		id: "voucher-addon-credit",
		name: "Add-on Credit",
		redemptions: 42,
		status: "Draft",
		target: "Add-ons",
		type: "Voucher",
		value: 150,
	},
	{
		code: "SUMMIT25",
		description:
			"Event promo for attendees who subscribed during the annual product summit.",
		discountKind: "Percent",
		expiresAt: "2026-10-15",
		id: "event-summit25",
		name: "Summit Attendee",
		redemptions: 67,
		status: "Inactive",
		target: "Event Attendees",
		type: "Event Promo",
		value: 25,
	},
];

export const InitialMasterPromotionFormValues: MasterPromotionFormValues = {
	code: "",
	description: "",
	discountKind: "Percent",
	expiresAt: "",
	name: "",
	status: "Active",
	target: "All Plans",
	type: "Promo Code",
	value: 0,
};

export function getMasterPromotionById(recordId: string) {
	return MasterPromotionRecords.find((record) => record.id === recordId);
}

export function createMasterPromotionFormValues(
	record: MasterPromotionRecord,
): MasterPromotionFormValues {
	return {
		code: record.code,
		description: record.description,
		discountKind: record.discountKind,
		expiresAt: record.expiresAt,
		id: record.id,
		name: record.name,
		status: record.status,
		target: record.target,
		type: record.type,
		value: record.value,
	};
}

export function createMasterPromotionRecord(
	values: MasterPromotionFormValues,
): MasterPromotionRecord {
	const trimmedValues = trimMasterPromotionValues(values);

	return {
		...trimmedValues,
		code: trimmedValues.code.toUpperCase(),
		id:
			trimmedValues.id ??
			`${trimmedValues.type.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${
				Date.now()
			}`,
		redemptions: 0,
	};
}

export function formatMasterPromotionValue(
	record: Pick<MasterPromotionRecord, "discountKind" | "value">,
) {
	if (record.discountKind === "Percent") {
		return `${record.value}%`;
	}

	return `PHP ${record.value.toLocaleString("en-PH", {
		maximumFractionDigits: 2,
		minimumFractionDigits: 2,
	})}`;
}

export function formatMasterPromotionDate(value: string) {
	return new Intl.DateTimeFormat("en-US", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(new Date(`${value}T00:00:00`));
}

function trimMasterPromotionValues(
	values: MasterPromotionFormValues,
): MasterPromotionFormValues {
	return {
		...values,
		code: values.code.trim(),
		description: values.description.trim(),
		expiresAt: values.expiresAt.trim(),
		name: values.name.trim(),
	};
}
