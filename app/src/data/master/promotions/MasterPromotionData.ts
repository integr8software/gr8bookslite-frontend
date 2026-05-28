import type {
	MasterPromotionFormValues,
	MasterPromotionRecord,
} from "@/app/src/types/master/promotions/MasterPromotionTypes";
import { normalizeMasterPromotionTargetPlanIds } from "@/app/src/constants/master/promotions/MasterPromotionConstants";

export const MasterPromotionRecords: MasterPromotionRecord[] = [
	{
		availabilityMode: "Recurring",
		billingCycle: "3 billing cycles",
		code: "WELCOME20",
		description:
			"Launch promo code for new subscribers selecting any paid plan.",
		discountKind: "Percent",
		expiresAt: "2026-12-31",
		id: "promo-welcome20",
		name: "Welcome Launch",
		redemptions: 184,
		redemptionLimit: null,
		recurringAvailability: "First day of billing cycle",
		status: "Active",
		startsAt: "2026-01-01",
		targetPlanIds: ["all-plans"],
		type: "Promo Code",
		value: 20,
	},
	{
		availabilityMode: "One-time",
		billingCycle: "1 billing cycle",
		code: "ACCOUNTING100",
		description:
			"Coupon for accounting-first customers moving from trial to paid onboarding.",
		discountKind: "Fixed",
		expiresAt: "2026-08-31",
		id: "coupon-accounting100",
		name: "Accounting Starter",
		redemptions: 92,
		redemptionLimit: 500,
		recurringAvailability: "First day of month",
		status: "Active",
		startsAt: "2026-03-01",
		targetPlanIds: ["plan-accounting-monthly"],
		type: "Coupon",
		value: 100,
	},
	{
		availabilityMode: "Recurring",
		billingCycle: "Whole plan",
		code: "ADDON-VCHR",
		description:
			"Voucher credit for additional users, branches, satellites, or company add-ons.",
		discountKind: "Fixed",
		expiresAt: null,
		id: "voucher-addon-credit",
		name: "Add-on Credit",
		redemptions: 42,
		redemptionLimit: 150,
		recurringAvailability: "First month of year",
		status: "Draft",
		startsAt: "2026-04-01",
		targetPlanIds: ["plan-full-suite-annual", "plan-launch-upgrade"],
		type: "Voucher",
		value: 150,
	},
	{
		availabilityMode: "One-time",
		billingCycle: "1 billing cycle",
		code: "SUMMIT25",
		description:
			"Event promo for attendees who subscribed during the annual product summit.",
		discountKind: "Percent",
		expiresAt: "2026-10-15",
		id: "event-summit25",
		name: "Summit Attendee",
		redemptions: 67,
		redemptionLimit: 250,
		recurringAvailability: "First day of billing cycle",
		status: "Inactive",
		startsAt: "2026-09-01",
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
	availabilityMode: "One-time",
	billingCycle: "Whole plan",
	code: "",
	description: "",
	discountKind: "Percent",
	expirationMode: "With expiration",
	expiresAt: "",
	limitMode: "Unlimited",
	name: "",
	redemptionLimit: 0,
	recurringAvailability: "First day of billing cycle",
	status: "Active",
	startsAt: getDefaultMasterPromotionStartDate(),
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
		availabilityMode: record.availabilityMode,
		billingCycle: record.billingCycle,
		code: record.code,
		description: record.description,
		discountKind: record.discountKind,
		expirationMode: record.expiresAt ? "With expiration" : "No expiration",
		expiresAt: record.expiresAt ?? "",
		id: record.id,
		limitMode: record.redemptionLimit === null ? "Unlimited" : "Limited",
		name: record.name,
		redemptionLimit: record.redemptionLimit ?? 0,
		recurringAvailability: record.recurringAvailability,
		status: record.status,
		startsAt: record.startsAt,
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
		availabilityMode: trimmedValues.availabilityMode,
		billingCycle: trimmedValues.billingCycle,
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
		recurringAvailability: trimmedValues.recurringAvailability,
		status: trimmedValues.status,
		startsAt: trimmedValues.startsAt,
		targetPlanIds: normalizeMasterPromotionTargetPlanIds(
			trimmedValues.targetPlanIds,
		),
		type: trimmedValues.type,
		value: trimmedValues.value,
	};
}

export function generateMasterPromotionCode() {
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	const codeLength = 12;
	const createCode = () => {
		const randomValues = new Uint32Array(codeLength);

		if (globalThis.crypto?.getRandomValues) {
			globalThis.crypto.getRandomValues(randomValues);

			return Array.from(
				randomValues,
				(value) => characters[value % characters.length],
			).join("");
		}

		return Array.from(
			{ length: codeLength },
			() => characters[Math.floor(Math.random() * characters.length)],
		).join("");
	};

	let code = createCode();

	while (!/[A-Z]/.test(code) || !/\d/.test(code)) {
		code = createCode();
	}

	return code;
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

export function formatMasterPromotionStartDate(value: string) {
	if (!value) {
		return "Not scheduled";
	}

	return new Intl.DateTimeFormat("en-US", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(new Date(`${value}T00:00:00`));
}

export function formatMasterPromotionAvailability(
	record: Pick<
		MasterPromotionRecord,
		| "availabilityMode"
		| "billingCycle"
		| "recurringAvailability"
		| "startsAt"
	>,
) {
	const startDate = formatMasterPromotionStartDate(record.startsAt);

	if (record.availabilityMode === "Recurring") {
		return `${startDate}; ${record.recurringAvailability}; ${record.billingCycle}`;
	}

	return `${startDate}; ${record.billingCycle}`;
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
		startsAt: values.startsAt.trim(),
		targetPlanIds: normalizeMasterPromotionTargetPlanIds(
			values.targetPlanIds.map((targetPlanId) => targetPlanId.trim()),
		),
	};
}

function getDefaultMasterPromotionStartDate() {
	const today = new Date();
	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, "0");
	const day = String(today.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}
