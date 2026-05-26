import type {
	MasterCouponPromotionFormValues,
	MasterCouponPromotionRecord,
} from "@/app/src/types/master/coupons-promotions/MasterCouponPromotionTypes";

export const MasterCouponPromotionRecords: MasterCouponPromotionRecord[] = [
	{
		code: "WELCOME20",
		discountKind: "Percent",
		expiresAt: "2026-12-31",
		id: "promo-welcome20",
		name: "Welcome Launch",
		redemptions: 184,
		status: "Active",
		target: "All Plans",
		type: "Promo",
		value: 20,
	},
	{
		code: "ACCOUNTING100",
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
		code: "FULLSUITE15",
		discountKind: "Percent",
		expiresAt: "2026-10-15",
		id: "promo-fullsuite15",
		name: "Full Suite Upgrade",
		redemptions: 67,
		status: "Inactive",
		target: "Accounting + Inventory",
		type: "Promo",
		value: 15,
	},
];

export const InitialMasterCouponPromotionFormValues: MasterCouponPromotionFormValues =
	{
		code: "",
		discountKind: "Percent",
		expiresAt: "",
		name: "",
		status: "Active",
		target: "All Plans",
		type: "Promo",
		value: 0,
	};

export function createMasterCouponPromotionFormValues(
	record: MasterCouponPromotionRecord,
): MasterCouponPromotionFormValues {
	return {
		code: record.code,
		discountKind: record.discountKind,
		expiresAt: record.expiresAt,
		name: record.name,
		status: record.status,
		target: record.target,
		type: record.type,
		value: record.value,
	};
}

export function createMasterCouponPromotionRecord(
	values: MasterCouponPromotionFormValues,
): MasterCouponPromotionRecord {
	const trimmedValues = trimMasterCouponPromotionValues(values);

	return {
		...trimmedValues,
		code: trimmedValues.code.toUpperCase(),
		id: `${trimmedValues.type.toLowerCase()}-${Date.now()}`,
		redemptions: 0,
	};
}

export function updateMasterCouponPromotionRecord({
	record,
	values,
}: {
	record: MasterCouponPromotionRecord;
	values: MasterCouponPromotionFormValues;
}): MasterCouponPromotionRecord {
	const trimmedValues = trimMasterCouponPromotionValues(values);

	return {
		...record,
		...trimmedValues,
		code: trimmedValues.code.toUpperCase(),
	};
}

export function formatMasterCouponPromotionValue(
	record: Pick<MasterCouponPromotionRecord, "discountKind" | "value">,
) {
	if (record.discountKind === "Percent") {
		return `${record.value}%`;
	}

	return `PHP ${record.value.toLocaleString("en-PH", {
		maximumFractionDigits: 2,
		minimumFractionDigits: 2,
	})}`;
}

export function formatMasterCouponPromotionDate(value: string) {
	return new Intl.DateTimeFormat("en-US", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(new Date(`${value}T00:00:00`));
}

function trimMasterCouponPromotionValues(
	values: MasterCouponPromotionFormValues,
): MasterCouponPromotionFormValues {
	return {
		...values,
		code: values.code.trim(),
		expiresAt: values.expiresAt.trim(),
		name: values.name.trim(),
	};
}
