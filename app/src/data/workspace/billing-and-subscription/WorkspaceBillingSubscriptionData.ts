import {
	MasterPromotionRecords,
	formatMasterPromotionDate,
	formatMasterPromotionValue,
	getMasterPromotionById,
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
import type {
	MasterSubscriptionCompanyStatus,
	MasterSubscriptionUnit,
	MasterSubscriptionUnitQuote,
	MasterSubscriptionVolumeRuleRecord,
} from "@/app/src/types/master/subscriptions/MasterSubscriptionTypes";
import type {
	WorkspaceBillingAddOnQuote,
	WorkspaceBillingCompanyAccount,
	WorkspaceBillingPaymentMethodRecord,
	WorkspaceBillingPromotionApplicationMode,
	WorkspaceBillingPromotionOption,
	WorkspaceBillingPromotionType,
	WorkspaceBillingRenewalState,
	WorkspaceBillingSubscriberAccount,
} from "@/app/src/types/workspace/billing-and-subscription/WorkspaceBillingSubscriptionTypes";

export const WorkspaceCurrentBillingSubscriberId = "sub-gr8books";

type WorkspaceBillingCompanyUsageRecord = {
	baseMonthlyAmount: number;
	baseMonthlyListAmount: number;
	branchCount: number;
	id: string;
	name: string;
	planDisplayName: string;
	planId: string;
	renewalDate: string;
	status: MasterSubscriptionCompanyStatus;
	trialEndsAt?: string;
	userCount: number;
};

type WorkspaceBillingPromotionPossessionSeed = {
	assignedAt: string;
	assignmentId: string;
	expiresAt: string | null;
	promotionId: string;
};

const CurrentSubscriberFallback =
	MasterSubscriptionCompanies.find(
		(subscriber) => subscriber.id === WorkspaceCurrentBillingSubscriberId,
	) ?? MasterSubscriptionCompanies[0];

const WorkspaceBillingCompanyUsageRecords: WorkspaceBillingCompanyUsageRecord[] =
	[
		{
			baseMonthlyAmount: 599,
			baseMonthlyListAmount: 798,
			branchCount: 8,
			id: "company-gr8books-hq",
			name: "Gr8Books HQ",
			planDisplayName: "Accounting + Inventory",
			planId: "plan-launch-upgrade",
			renewalDate: "2026-06-01",
			status: "Active",
			userCount: 18,
		},
		{
			baseMonthlyAmount: 399,
			baseMonthlyListAmount: 399,
			branchCount: 2,
			id: "company-gr8books-bgc",
			name: "BGC Sales Office",
			planDisplayName: "Accounting",
			planId: "plan-accounting-monthly",
			renewalDate: "2026-06-05",
			status: "Trial",
			trialEndsAt: "2026-06-05",
			userCount: 7,
		},
		{
			baseMonthlyAmount: 399,
			baseMonthlyListAmount: 399,
			branchCount: 1,
			id: "company-gr8books-cebu",
			name: "Cebu Services",
			planDisplayName: "Inventory",
			planId: "plan-inventory-quarter",
			renewalDate: "2026-06-12",
			status: "Active",
			userCount: 4,
		},
		{
			baseMonthlyAmount: 399,
			baseMonthlyListAmount: 399,
			branchCount: 1,
			id: "company-gr8books-davao",
			name: "Davao Demo Books",
			planDisplayName: "Accounting",
			planId: "plan-accounting-monthly",
			renewalDate: "2026-05-24",
			status: "Past Due",
			userCount: 3,
		},
		{
			baseMonthlyAmount: 399,
			baseMonthlyListAmount: 399,
			branchCount: 3,
			id: "company-gr8books-north",
			name: "North Luzon Trading",
			planDisplayName: "Inventory",
			planId: "plan-inventory-quarter",
			renewalDate: "2026-06-18",
			status: "Scheduled",
			userCount: 6,
		},
	];

const WorkspaceBillingPromotionPossessionSeeds: WorkspaceBillingPromotionPossessionSeed[] =
	[
		{
			assignedAt: "2026-05-18",
			assignmentId: "workspace-gr8books-coupon-accounting100",
			expiresAt: "2026-08-31",
			promotionId: "coupon-accounting100",
		},
		{
			assignedAt: "2026-05-20",
			assignmentId: "workspace-gr8books-voucher-addon-credit",
			expiresAt: null,
			promotionId: "voucher-addon-credit",
		},
		{
			assignedAt: "2026-05-24",
			assignmentId: "workspace-gr8books-voucher-loyalty25",
			expiresAt: "2026-09-30",
			promotionId: "voucher-loyalty25",
		},
	];

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
			holderName: "John Dela Cruz",
			id: "pm_workspace_mastercard_5588",
			isDefault: false,
			label: "Operations Mastercard",
			last4: "5588",
		},
		{
			brand: "Visa",
			expiryLabel: "02/2030",
			holderName: "Billing Team",
			id: "pm_workspace_visa_1881",
			isDefault: false,
			label: "Renewals Visa",
			last4: "1881",
		},
	];

export const WorkspaceBillingCurrentSubscriber: WorkspaceBillingSubscriberAccount =
	{
		billingCycle: CurrentSubscriberFallback.billingCycle,
		id: CurrentSubscriberFallback.id,
		name: CurrentSubscriberFallback.name,
		ownerName: CurrentSubscriberFallback.ownerName,
		planName: "Mixed company plans",
		renewalDate: CurrentSubscriberFallback.renewalDate,
		status: CurrentSubscriberFallback.status,
	};

export function createWorkspaceBillingCompanyAccounts(
	appliedPromotionIdsByCompany: Record<string, string | undefined>,
): WorkspaceBillingCompanyAccount[] {
	const subscriber = CurrentSubscriberFallback;

	return WorkspaceBillingCompanyUsageRecords.map((company) => {
		const plan = getMasterSubscriptionPlanById(company.planId);
		const planPrice = createWorkspaceBillingPlanPrice({
			billingCycle: subscriber.billingCycle,
			company,
		});
		const quote = plan
			? calculateMasterSubscriptionQuote({
					plan,
					rules: MasterSubscriptionVolumeRules,
					values: {
						branches: company.branchCount,
						companies: 1,
						users: company.userCount,
					},
				})
			: null;
		const baseAmount = planPrice.netAmount;
		const addOns =
			quote && plan
				? createWorkspaceBillingAddOns({
						billingCycle: subscriber.billingCycle,
						company,
						plan,
						quote,
					})
				: [];
		const addOnTotal = addOns.reduce(
			(total, addOn) => total + addOn.billingAmount,
			0,
		);
		const subtotal = baseAmount + addOnTotal;
		const possessedPromotions = getWorkspaceBillingPossessedPromotions({
			planId: company.planId,
			subtotal,
		});
		const promoCodePromotions = getWorkspaceBillingPromoCodePromotions({
			companyId: company.id,
			planId: company.planId,
			subtotal,
		});
		const eligiblePromotions = [
			...possessedPromotions,
			...promoCodePromotions,
		];
		const appliedPromotion =
			eligiblePromotions.find(
				(promotion) =>
					promotion.assignmentId === appliedPromotionIdsByCompany[company.id],
			) ?? null;
		const discountAmount = appliedPromotion?.discountAmount ?? 0;
		const renewal = getWorkspaceBillingRenewalState(company.renewalDate);
		const trial = getWorkspaceBillingTrialState(company.trialEndsAt);

		return {
			addOnTotal,
			addOns,
			appliedPromotion,
			baseAmount,
			billingCycle: subscriber.billingCycle,
			branchCount: company.branchCount,
			companyCount: 1,
			discountAmount,
			durationMonths: subscriber.durationMonths,
			eligiblePromotions,
			id: company.id,
			name: company.name,
			ownerName: subscriber.ownerName,
			overageAmount: addOnTotal,
			paymentActionLabel: getWorkspaceBillingPaymentActionLabel({
				renewalState: renewal.state,
				status: company.status,
			}),
			planId: company.planId,
			planListAmount: planPrice.listAmount,
			planName: company.planDisplayName,
			planPrice,
			possessedPromotions,
			quote,
			renewalDate: company.renewalDate,
			renewalState: renewal.state,
			renewalStatusLabel: renewal.label,
			status: company.status,
			subscriberId: subscriber.id,
			subscriberName: subscriber.name,
			subtotal,
			totalDue: Math.max(0, subtotal - discountAmount),
			trialDaysRemaining: trial?.daysRemaining ?? null,
			trialEndsAt: company.trialEndsAt ?? null,
			trialStatusLabel: trial?.label ?? null,
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
	const promotion = MasterPromotionRecords.find(
		(record) =>
			record.type === "Promo Code" &&
			record.code.toUpperCase() === normalizedCode,
	);

	if (!promotion) {
		return null;
	}

	return createWorkspaceBillingPromotionOption({
		applicationMode: "Typed code",
		assignmentId: `promo-code-${account.id}-${promotion.id}`,
		expiresAt: promotion.expiresAt,
		planId: account.planId,
		promotion,
		subtotal: account.subtotal,
	});
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
			addOnTotal: summary.addOnTotal + account.addOnTotal,
			availablePromotions:
				summary.availablePromotions + account.possessedPromotions.length,
			discountTotal: summary.discountTotal + account.discountAmount,
			dueTotal: summary.dueTotal + account.totalDue,
			pastDueCompanies:
				summary.pastDueCompanies + (account.status === "Past Due" ? 1 : 0),
			renewalAlerts:
				summary.renewalAlerts +
				(account.renewalState === "Overdue" ||
				account.renewalState === "Due today" ||
				account.renewalState === "Due soon"
					? 1
					: 0),
			subscriberCount: summary.subscriberCount + 1,
		}),
		{
			addOnTotal: 0,
			availablePromotions: 0,
			discountTotal: 0,
			dueTotal: 0,
			pastDueCompanies: 0,
			renewalAlerts: 0,
			subscriberCount: 0,
		},
	);
}

function createWorkspaceBillingAddOns({
	billingCycle,
	company,
	plan,
	quote,
}: {
	billingCycle: WorkspaceBillingCompanyAccount["billingCycle"];
	company: WorkspaceBillingCompanyUsageRecord;
	plan: NonNullable<ReturnType<typeof getMasterSubscriptionPlanById>>;
	quote: NonNullable<WorkspaceBillingCompanyAccount["quote"]>;
}): WorkspaceBillingAddOnQuote[] {
	const actualCountByUnit: Record<MasterSubscriptionUnit, number> = {
		branch: company.branchCount,
		company: 1,
		user: company.userCount,
	};
	const includedCountByUnit: Record<MasterSubscriptionUnit, number> = {
		branch: plan.includedBranches,
		company: plan.includedCompanies,
		user: plan.includedUsers,
	};
	const labelByUnit: Record<MasterSubscriptionUnit, string> = {
		branch: "Branches",
		company: "Companies",
		user: "Users",
	};

	return quote.unitQuotes
		.filter((unitQuote) => unitQuote.unit !== "company")
		.map((unitQuote) => {
			const actualCount = actualCountByUnit[unitQuote.unit];
			const grossMonthlyAmount = unitQuote.extraCount * unitQuote.rate;
			const grossBillingAmount = calculateMasterSubscriptionAmountLeft({
				billingCycle,
				monthlyTotal: grossMonthlyAmount,
			});
			const billingAmount = calculateMasterSubscriptionAmountLeft({
				billingCycle,
				monthlyTotal: unitQuote.charge,
			});
			const reductionAmount = Math.max(0, grossBillingAmount - billingAmount);
			const reductionPercent = grossBillingAmount
				? Math.round((reductionAmount / grossBillingAmount) * 100)
				: 0;
			const reductionRules = MasterSubscriptionVolumeRules.filter(
				(rule) => rule.planId === plan.id && rule.unit === unitQuote.unit,
			);

			return {
				actualCount,
				billingAmount,
				extraCount: unitQuote.extraCount,
				grossBillingAmount,
				grossMonthlyAmount,
				includedCount: includedCountByUnit[unitQuote.unit],
				key: unitQuote.unit,
				label: labelByUnit[unitQuote.unit],
				monthlyAmount: unitQuote.charge,
				monthlyRate: unitQuote.rate,
				reductionAmount,
				reductionPercent,
				reductionTooltip: createWorkspaceBillingAddOnReductionTooltip({
					actualCount,
					billingCycle,
					grossBillingAmount,
					grossMonthlyAmount,
					reductionAmount,
					reductionPercent,
					reductionRules,
					unitQuote,
				}),
			};
		});
}

function createWorkspaceBillingPlanPrice({
	billingCycle,
	company,
}: {
	billingCycle: WorkspaceBillingCompanyAccount["billingCycle"];
	company: WorkspaceBillingCompanyUsageRecord;
}) {
	const listAmount = calculateMasterSubscriptionAmountLeft({
		billingCycle,
		monthlyTotal: company.baseMonthlyListAmount,
	});
	const netAmount = calculateMasterSubscriptionAmountLeft({
		billingCycle,
		monthlyTotal: company.baseMonthlyAmount,
	});
	const discountAmount = Math.max(0, listAmount - netAmount);
	const discountPercent = listAmount
		? Math.round((discountAmount / listAmount) * 100)
		: 0;

	return {
		discountAmount,
		discountPercent,
		listAmount,
		netAmount,
		tooltip:
			discountPercent > 0
				? `${company.planDisplayName}: ${formatWorkspaceBillingCurrency(
						listAmount,
					)} regular price less ${formatWorkspaceBillingCurrency(
						discountAmount,
					)} bundle savings (${discountPercent}%) = ${formatWorkspaceBillingCurrency(
						netAmount,
					)}.`
				: `${company.planDisplayName}: ${formatWorkspaceBillingCurrency(
						netAmount,
					)} with no plan discount.`,
	};
}

function createWorkspaceBillingAddOnReductionTooltip({
	actualCount,
	billingCycle,
	grossBillingAmount,
	grossMonthlyAmount,
	reductionAmount,
	reductionPercent,
	reductionRules,
	unitQuote,
}: {
	actualCount: number;
	billingCycle: WorkspaceBillingCompanyAccount["billingCycle"];
	grossBillingAmount: number;
	grossMonthlyAmount: number;
	reductionAmount: number;
	reductionPercent: number;
	reductionRules: MasterSubscriptionVolumeRuleRecord[];
	unitQuote: MasterSubscriptionUnitQuote;
}) {
	const unitLabel = unitQuote.unit === "branch" ? "branches" : "users";
	const ruleLabel =
		reductionRules.length > 0
			? reductionRules.map(formatWorkspaceBillingReductionRule).join("; ")
			: "No reduction tiers.";
	const grossLabel = `${unitQuote.extraCount} add-on x ${formatWorkspaceBillingCurrency(
		unitQuote.rate,
	)} = ${formatWorkspaceBillingCurrency(grossMonthlyAmount)} monthly`;
	const billingLabel =
		billingCycle === "Monthly"
			? formatWorkspaceBillingCurrency(grossBillingAmount)
			: `${formatWorkspaceBillingCurrency(grossBillingAmount)} per ${billingCycle}`;

	if (reductionAmount <= 0) {
		return `${actualCount} active ${unitLabel}. Original add-on price: ${grossLabel}. Billing amount: ${billingLabel}. Reduction conditions: ${ruleLabel}`;
	}

	return `${actualCount} active ${unitLabel}. Original add-on price: ${grossLabel}. Reduction: ${formatWorkspaceBillingCurrency(
		reductionAmount,
	)} (${reductionPercent}% effective). Reduction conditions: ${ruleLabel}`;
}

function formatWorkspaceBillingReductionRule(
	rule: MasterSubscriptionVolumeRuleRecord,
) {
	const endLabel = rule.endsAt ? `-${rule.endsAt}` : "+";

	return `${rule.discountPercent}% off at ${rule.startsAt}${endLabel}`;
}

function getWorkspaceBillingPossessedPromotions({
	planId,
	subtotal,
}: {
	planId: string;
	subtotal: number;
}) {
	const masterSubscriberPossessions = MasterSubscriberPromotionRecords.filter(
		(record) =>
			record.subscriberId === WorkspaceCurrentBillingSubscriberId &&
			record.status === "Available",
	).map((record) => ({
		assignmentId: record.id,
		expiresAt: record.expiresAt,
		promotionId: record.promotionId,
	}));
	const allPossessions = [
		...WorkspaceBillingPromotionPossessionSeeds,
		...masterSubscriberPossessions,
	];
	const seenAssignmentIds = new Set<string>();

	return allPossessions
		.map((possession) => {
			if (seenAssignmentIds.has(possession.assignmentId)) {
				return null;
			}

			seenAssignmentIds.add(possession.assignmentId);

			const promotion = getMasterPromotionById(possession.promotionId);

			if (
				!promotion ||
				(promotion.type !== "Coupon" && promotion.type !== "Voucher")
			) {
				return null;
			}

			return createWorkspaceBillingPromotionOption({
				applicationMode: "Possession",
				assignmentId: possession.assignmentId,
				expiresAt: possession.expiresAt ?? promotion.expiresAt,
				planId,
				promotion,
				subtotal,
			});
		})
		.filter(
			(
				promotion,
			): promotion is WorkspaceBillingPromotionOption => promotion !== null,
		);
}

function getWorkspaceBillingPromoCodePromotions({
	companyId,
	planId,
	subtotal,
}: {
	companyId: string;
	planId: string;
	subtotal: number;
}) {
	return MasterPromotionRecords.filter(
		(promotion) => promotion.type === "Promo Code",
	)
		.map((promotion) =>
			createWorkspaceBillingPromotionOption({
				applicationMode: "Typed code",
				assignmentId: `promo-code-${companyId}-${promotion.id}`,
				expiresAt: promotion.expiresAt,
				planId,
				promotion,
				subtotal,
			}),
		)
		.filter(
			(
				promotion,
			): promotion is WorkspaceBillingPromotionOption => promotion !== null,
		);
}

function createWorkspaceBillingPromotionOption({
	applicationMode,
	assignmentId,
	expiresAt,
	planId,
	promotion,
	subtotal,
}: {
	applicationMode: WorkspaceBillingPromotionApplicationMode;
	assignmentId: string;
	expiresAt: string | null;
	planId: string;
	promotion: MasterPromotionRecord;
	subtotal: number;
}): WorkspaceBillingPromotionOption | null {
	if (!isWorkspaceBillingPromotionType(promotion.type)) {
		return null;
	}

	if (!isPromotionAvailableForPlan({ expiresAt, planId, promotion })) {
		return null;
	}

	const discountAmount = calculateWorkspaceBillingDiscountAmount({
		promotion,
		subtotal,
	});

	return {
		applicationMode,
		assignmentId,
		code: promotion.code,
		description: promotion.description,
		discountAmount,
		discountKind: promotion.discountKind,
		expiresAt,
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
	expiresAt,
	planId,
	promotion,
}: {
	expiresAt: string | null;
	planId: string;
	promotion: MasterPromotionRecord;
}) {
	if (promotion.status === "Inactive") {
		return false;
	}

	if (!isDateWithinPromotionWindow(promotion.startsAt, expiresAt)) {
		return false;
	}

	return (
		promotion.targetPlanIds.includes("all-plans") ||
		promotion.targetPlanIds.includes(planId)
	);
}

function isWorkspaceBillingPromotionType(
	value: MasterPromotionRecord["type"],
): value is WorkspaceBillingPromotionType {
	return value === "Coupon" || value === "Voucher" || value === "Promo Code";
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

function getWorkspaceBillingPaymentActionLabel({
	renewalState,
	status,
}: {
	renewalState: WorkspaceBillingRenewalState;
	status: MasterSubscriptionCompanyStatus;
}): WorkspaceBillingCompanyAccount["paymentActionLabel"] {
	if (
		status === "Past Due" ||
		renewalState === "Overdue" ||
		renewalState === "Due today"
	) {
		return "Pay";
	}

	return "Pay ahead";
}

function getWorkspaceBillingTrialState(value?: string): {
	daysRemaining: number;
	label: string;
} | null {
	if (!value) {
		return null;
	}

	const today = new Date();
	const trialEndDate = new Date(`${value}T00:00:00`);
	const todayDate = new Date(
		today.getFullYear(),
		today.getMonth(),
		today.getDate(),
	);
	const daysRemaining = Math.max(
		0,
		Math.round((trialEndDate.getTime() - todayDate.getTime()) / 86_400_000),
	);

	return {
		daysRemaining,
		label:
			daysRemaining === 0
				? "Trial ends today"
				: `${daysRemaining} trial days left`,
	};
}

function getWorkspaceBillingRenewalState(value: string): {
	label: string;
	state: WorkspaceBillingRenewalState;
} {
	const today = new Date();
	const renewalDate = new Date(`${value}T00:00:00`);
	const todayDate = new Date(
		today.getFullYear(),
		today.getMonth(),
		today.getDate(),
	);
	const daysUntilRenewal = Math.round(
		(renewalDate.getTime() - todayDate.getTime()) / 86_400_000,
	);

	if (daysUntilRenewal < 0) {
		return {
			label: `${Math.abs(daysUntilRenewal)} days overdue`,
			state: "Overdue",
		};
	}

	if (daysUntilRenewal === 0) {
		return {
			label: "Due today",
			state: "Due today",
		};
	}

	if (daysUntilRenewal <= 7) {
		return {
			label: `Renews in ${daysUntilRenewal} days`,
			state: "Due soon",
		};
	}

	return {
		label: `Renews in ${daysUntilRenewal} days`,
		state: "Scheduled",
	};
}
