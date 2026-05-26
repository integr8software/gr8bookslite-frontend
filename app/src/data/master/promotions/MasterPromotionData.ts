import type {
	MasterPromotionFormValues,
	MasterPromotionRecord,
} from "@/app/src/types/master/promotions/MasterPromotionTypes";
import { normalizeMasterPromotionTargetPlanIds } from "@/app/src/constants/master/promotions/MasterPromotionConstants";

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
		redemptionLimit: null,
		status: "Active",
		targetPlanIds: ["all-plans"],
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
		redemptionLimit: 500,
		status: "Active",
		targetPlanIds: ["plan-accounting-monthly"],
		type: "Coupon",
		value: 100,
	},
	{
		code: "ADDON-VCHR",
		description:
			"Voucher credit for additional users, branches, satellites, or company add-ons.",
		discountKind: "Fixed",
		expiresAt: null,
		id: "voucher-addon-credit",
		name: "Add-on Credit",
		redemptions: 42,
		redemptionLimit: 150,
		status: "Draft",
		targetPlanIds: ["plan-full-suite-annual", "plan-launch-upgrade"],
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
		redemptionLimit: 250,
		status: "Inactive",
		targetPlanIds: [
			"plan-accounting-monthly",
			"plan-inventory-quarter",
			"plan-launch-upgrade",
		],
		type: "Event Promo",
		value: 25,
	},
];

export const InitialMasterPromotionFormValues: MasterPromotionFormValues = {
	code: "",
	description: "",
	discountKind: "Percent",
	expirationMode: "With expiration",
	expiresAt: "",
	limitMode: "Unlimited",
	name: "",
	redemptionLimit: 0,
	status: "Active",
	targetPlanIds: ["all-plans"],
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
		expirationMode: record.expiresAt ? "With expiration" : "No expiration",
		expiresAt: record.expiresAt ?? "",
		id: record.id,
		limitMode: record.redemptionLimit === null ? "Unlimited" : "Limited",
		name: record.name,
		redemptionLimit: record.redemptionLimit ?? 0,
		status: record.status,
		targetPlanIds: [...record.targetPlanIds],
		type: record.type,
		value: record.value,
	};
}

export function createMasterPromotionRecord(
	values: MasterPromotionFormValues,
): MasterPromotionRecord {
	const trimmedValues = trimMasterPromotionValues(values);
	const id =
		trimmedValues.id ??
		`${trimmedValues.type.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${
			Date.now()
		}`;

	return {
		code: trimmedValues.code.toUpperCase(),
		description: trimmedValues.description,
		discountKind: trimmedValues.discountKind,
		expiresAt:
			trimmedValues.expirationMode === "With expiration"
				? trimmedValues.expiresAt
				: null,
		id,
		name: trimmedValues.name,
		redemptions: 0,
		redemptionLimit:
			trimmedValues.limitMode === "Limited"
				? Math.floor(trimmedValues.redemptionLimit)
				: null,
		status: trimmedValues.status,
		targetPlanIds: normalizeMasterPromotionTargetPlanIds(
			trimmedValues.targetPlanIds,
		),
		type: trimmedValues.type,
		value: trimmedValues.value,
	};
}

export function generateMasterPromotionCode(
	values: Pick<MasterPromotionFormValues, "name" | "type">,
) {
	const source = values.name.trim() || values.type;
	const prefix =
		source
			.replace(/[^a-z0-9]+/gi, "")
			.slice(0, 8)
			.toUpperCase() || "PROMO";
	const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();

	return `${prefix}${suffix}`;
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

export function formatMasterPromotionDate(value: string | null) {
	if (!value) {
		return "No expiration";
	}

	return new Intl.DateTimeFormat("en-US", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(new Date(`${value}T00:00:00`));
}

export function formatMasterPromotionLimit(
	record: Pick<MasterPromotionRecord, "redemptionLimit">,
) {
	return record.redemptionLimit === null
		? "Unlimited"
		: record.redemptionLimit.toLocaleString("en-US");
}

export function formatMasterPromotionUsage(
	record: Pick<MasterPromotionRecord, "redemptions" | "redemptionLimit">,
) {
	const usedCount = record.redemptions.toLocaleString("en-US");

	if (record.redemptionLimit === null) {
		return `${usedCount} used`;
	}

	return `${usedCount} / ${record.redemptionLimit.toLocaleString("en-US")}`;
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
		targetPlanIds: normalizeMasterPromotionTargetPlanIds(
			values.targetPlanIds.map((targetPlanId) => targetPlanId.trim()),
		),
	};
}
