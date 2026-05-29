import {
	getMasterPromotionById,
	formatMasterPromotionDate,
	formatMasterPromotionValue,
} from "@/app/src/data/master/promotions/MasterPromotionData";
import {
	MasterSubscriptionCompanies,
	MasterSubscriptionVolumeRules,
	calculateMasterSubscriptionAmountLeft,
	calculateMasterSubscriptionQuote,
	formatMasterSubscriptionCurrency,
	formatMasterSubscriptionDate,
	getMasterSubscriptionPlanById,
} from "@/app/src/data/master/subscriptions/MasterSubscriptionData";
import { MasterSubscriberPromotionRecords } from "@/app/src/data/master/subscriber-promotions/MasterSubscriberPromotionData";
import type { MasterPromotionRecord } from "@/app/src/types/master/promotions/MasterPromotionTypes";
import type { MasterSubscriberPromotionRecord } from "@/app/src/types/master/subscriber-promotions/MasterSubscriberPromotionTypes";
import type {
	WorkspaceBillingCompanyAccount,
	WorkspaceBillingPaymentMethodRecord,
	WorkspaceBillingPromotionOption,
} from "@/app/src/types/workspace/billing-and-subscription/WorkspaceBillingSubscriptionTypes";

export const WorkspaceBillingPaymentMethods: WorkspaceBillingPaymentMethodRecord[] =
	[
		{
			brand: "Visa",
			expiryLabel: "08/2028",
			holderName: "John Dela Cruz",
			id: "pm_workspace_visa_4242",
			isDefault: true,
			label: "Treasury Visa",
			last4: "4242",
		},
		{
			brand: "Mastercard",
			expiryLabel: "11/2029",
			holderName: "Emily Lim",
			id: "pm_workspace_mastercard_5588",
			isDefault: false,
			label: "Operations Mastercard",
			last4: "5588",
		},
		{
			brand: "Visa",
			expiryLabel: "02/2030",
			holderName: "Jane Santos",
			id: "pm_workspace_visa_1881",
			isDefault: false,
			label: "Trial Conversion Visa",
			last4: "1881",
		},
	];

export function createWorkspaceBillingCompanyAccounts(
	appliedPromotionIdsByCompany: Record<string, string | undefined>,
): WorkspaceBillingCompanyAccount[] {
	return MasterSubscriptionCompanies.map((company) => {
		const plan = getMasterSubscriptionPlanById(company.planId);
		const quote = plan
			? calculateMasterSubscriptionQuote({
					plan,
					rules: MasterSubscriptionVolumeRules,
					values: {
						branches: company.branchCount,
						companies: company.companyCount,
						users: company.userCount,
					},
				})
			: null;
		const subtotal = quote
			? calculateMasterSubscriptionAmountLeft({
					billingCycle: company.billingCycle,
					monthlyTotal: quote.total,
				})
			: 0;
		const eligiblePromotions = getWorkspaceBillingEligiblePromotions({
			planId: company.planId,
			subscriberId: company.id,
			subtotal,
		});
		const appliedPromotion =
			eligiblePromotions.find(
				(promotion) =>
					promotion.id === appliedPromotionIdsByCompany[company.id],
			) ?? null;
		const discountAmount = appliedPromotion?.discountAmount ?? 0;

		const baseAmount = quote
			? calculateMasterSubscriptionAmountLeft({
					billingCycle: company.billingCycle,
					monthlyTotal: quote.basePrice,
				})
			: 0;

		return {
			appliedPromotion,
			baseAmount,
			billingCycle: company.billingCycle,
			branchCount: company.branchCount,
			companyCount: company.companyCount,
			discountAmount,
			durationMonths: company.durationMonths,
			eligiblePromotions,
			id: company.id,
			name: company.name,
			ownerName: company.ownerName,
			overageAmount: subtotal - baseAmount,
			planId: company.planId,
			planName: plan?.name ?? "Unknown plan",
			quote,
			renewalDate: company.renewalDate,
			status: company.status,
			subtotal,
			totalDue: Math.max(0, subtotal - discountAmount),
			userCount: company.userCount,
		};
	});
}

export function findWorkspaceBillingPromotionByCode({
	account,
	code,
}: {
	account: WorkspaceBillingCompanyAccount;
	code: string;
}) {
	const normalizedCode = code.trim().toUpperCase();

	return account.eligiblePromotions.find(
		(promotion) => promotion.code.toUpperCase() === normalizedCode,
	);
}

export function formatWorkspaceBillingCurrency(value: number) {
	return formatMasterSubscriptionCurrency(value);
}

export function formatWorkspaceBillingDate(value: string) {
	return formatMasterSubscriptionDate(value);
}

export function formatWorkspaceBillingPromotionExpiry(value: string | null) {
	return formatMasterPromotionDate(value);
}

export function formatWorkspaceBillingPromotionValue(
	promotion: Pick<WorkspaceBillingPromotionOption, "discountKind" | "value">,
) {
	return formatMasterPromotionValue(promotion);
}

export function getWorkspaceBillingDefaultPaymentMethodId() {
	return (
		WorkspaceBillingPaymentMethods.find((method) => method.isDefault)?.id ??
		WorkspaceBillingPaymentMethods[0]?.id ??
		""
	);
}

export function getWorkspaceBillingSummary(
	accounts: WorkspaceBillingCompanyAccount[],
) {
	return accounts.reduce(
		(summary, account) => ({
			availablePromotions:
				summary.availablePromotions + account.eligiblePromotions.length,
			discountTotal: summary.discountTotal + account.discountAmount,
			dueTotal: summary.dueTotal + account.totalDue,
			pastDueCompanies:
				summary.pastDueCompanies + (account.status === "Past Due" ? 1 : 0),
			subscriberCount: summary.subscriberCount + 1,
		}),
		{
			availablePromotions: 0,
			discountTotal: 0,
			dueTotal: 0,
			pastDueCompanies: 0,
			subscriberCount: 0,
		},
	);
}

function getWorkspaceBillingEligiblePromotions({
	planId,
	subscriberId,
	subtotal,
}: {
	planId: string;
	subscriberId: string;
	subtotal: number;
}): WorkspaceBillingPromotionOption[] {
	return MasterSubscriberPromotionRecords.filter(
		(record) => record.subscriberId === subscriberId,
	)
		.map((record) => {
			const promotion = getMasterPromotionById(record.promotionId);

			if (!promotion || !isPromotionAvailableForPlan({ planId, promotion, record })) {
				return null;
			}

			return createWorkspaceBillingPromotionOption({
				promotion,
				record,
				subtotal,
			});
		})
		.filter(
			(
				promotion,
			): promotion is WorkspaceBillingPromotionOption => promotion !== null,
		);
}

function createWorkspaceBillingPromotionOption({
	promotion,
	record,
	subtotal,
}: {
	promotion: MasterPromotionRecord;
	record: MasterSubscriberPromotionRecord;
	subtotal: number;
}): WorkspaceBillingPromotionOption {
	return {
		assignmentId: record.id,
		code: promotion.code,
		description: promotion.description,
		discountAmount: calculateWorkspaceBillingDiscountAmount({
			promotion,
			subtotal,
		}),
		discountKind: promotion.discountKind,
		expiresAt: record.expiresAt ?? promotion.expiresAt,
		id: promotion.id,
		name: promotion.name,
		type: promotion.type,
		value: promotion.value,
	};
}

function calculateWorkspaceBillingDiscountAmount({
	promotion,
	subtotal,
}: {
	promotion: Pick<MasterPromotionRecord, "discountKind" | "value">;
	subtotal: number;
}) {
	if (promotion.discountKind === "Percent") {
		return Math.min(subtotal, Math.round(subtotal * (promotion.value / 100)));
	}

	return Math.min(subtotal, promotion.value);
}

function isPromotionAvailableForPlan({
	planId,
	promotion,
	record,
}: {
	planId: string;
	promotion: MasterPromotionRecord;
	record: MasterSubscriberPromotionRecord;
}) {
	if (record.status !== "Available" || promotion.status !== "Active") {
		return false;
	}

	if (!isDateWithinPromotionWindow(promotion.startsAt, record.expiresAt)) {
		return false;
	}

	return (
		promotion.targetPlanIds.includes("all-plans") ||
		promotion.targetPlanIds.includes(planId)
	);
}

function isDateWithinPromotionWindow(startsAt: string, expiresAt: string | null) {
	const today = new Date();
	const startDate = new Date(`${startsAt}T00:00:00`);

	if (startDate > today) {
		return false;
	}

	if (!expiresAt) {
		return true;
	}

	const expiryDate = new Date(`${expiresAt}T23:59:59`);

	return expiryDate >= today;
}
