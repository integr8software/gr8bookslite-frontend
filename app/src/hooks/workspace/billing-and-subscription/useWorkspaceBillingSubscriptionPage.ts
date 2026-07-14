"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import type { BillingMode } from "@/app/src/data/billing/BillingTypes";
import {
	findWorkspaceBillingPromotionByCode,
	formatWorkspaceBillingCurrency,
	WorkspaceBillingPaymentMethods,
	WorkspaceBillingCurrentSubscriber,
	createWorkspaceBillingCompanyAccounts,
	getWorkspaceBillingDefaultPaymentMethodId,
	getWorkspaceBillingSummary,
} from "@/app/src/data/workspace/billing-and-subscription/WorkspaceBillingSubscriptionData";
import { CreateManualCheckout } from "@/app/src/services/billing/ManualBillingApi";
import { validateWorkspacePromotionCode } from "@/app/src/validations/workspace/billing-and-subscription/WorkspaceBillingSubscriptionValidation";

type WorkspaceBillingRenewalFilter =
	| "All"
	| "Needs attention"
	| "Scheduled";

export function useWorkspaceBillingSubscriptionPage() {
	const [selectedPaymentMethodIdsByCompany, setSelectedPaymentMethodIdsByCompany] =
		useState<Record<string, string>>({});
	const [selectedBillingModesByCompany, setSelectedBillingModesByCompany] =
		useState<Record<string, BillingMode>>({});
	const [appliedPromotionIdsByCompany, setAppliedPromotionIdsByCompany] =
		useState<Record<string, string | undefined>>({});
	const [promotionCodesByCompany, setPromotionCodesByCompany] =
		useState<Record<string, string>>({});
	const [promotionCodeErrorsByCompany, setPromotionCodeErrorsByCompany] =
		useState<Record<string, string | undefined>>({});
	const [query, setQuery] = useState("");
	const [renewalFilter, setRenewalFilter] =
		useState<WorkspaceBillingRenewalFilter>("All");
	const [expandedCompanyId, setExpandedCompanyId] = useState<string | null>(
		null,
	);
	const accounts = useMemo(
		() => createWorkspaceBillingCompanyAccounts(appliedPromotionIdsByCompany),
		[appliedPromotionIdsByCompany],
	);
	const filteredAccounts = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return accounts.filter((account) => {
			const matchesQuery =
				!normalizedQuery ||
				[
					account.name,
					account.planName,
					account.status,
					account.renewalState,
					account.renewalStatusLabel,
					account.appliedPromotion?.code,
				]
					.filter(Boolean)
					.join(" ")
					.toLowerCase()
					.includes(normalizedQuery);
			const matchesRenewal =
				renewalFilter === "All" ||
				(renewalFilter === "Needs attention" &&
					(account.renewalState === "Overdue" ||
						account.renewalState === "Due today" ||
						account.renewalState === "Due soon")) ||
				(renewalFilter === "Scheduled" &&
					account.renewalState === "Scheduled");

			return matchesQuery && matchesRenewal;
		});
	}, [accounts, query, renewalFilter]);
	const summary = useMemo(() => getWorkspaceBillingSummary(accounts), [accounts]);
	const defaultPaymentMethodId = getWorkspaceBillingDefaultPaymentMethodId();

	function getSelectedPaymentMethodId(companyId: string) {
		return selectedPaymentMethodIdsByCompany[companyId] ?? defaultPaymentMethodId;
	}

	function getSelectedBillingMode(companyId: string) {
		const account = accounts.find((current) => current.id === companyId);

		return selectedBillingModesByCompany[companyId] ?? account?.billingMode ?? "MANUAL";
	}

	function updateBillingMode(companyId: string, billingMode: BillingMode) {
		setSelectedBillingModesByCompany((current) => ({
			...current,
			[companyId]: billingMode,
		}));
	}

	function updatePaymentMethod(companyId: string, paymentMethodId: string) {
		setSelectedPaymentMethodIdsByCompany((current) => ({
			...current,
			[companyId]: paymentMethodId,
		}));
	}

	function getPromotionCodeValue(companyId: string) {
		return promotionCodesByCompany[companyId] ?? "";
	}

	function getPromotionCodeError(companyId: string) {
		return promotionCodeErrorsByCompany[companyId];
	}

	function updatePromotionCode(companyId: string, code: string) {
		setPromotionCodesByCompany((current) => ({
			...current,
			[companyId]: code,
		}));
		setPromotionCodeErrorsByCompany((current) => ({
			...current,
			[companyId]: undefined,
		}));
	}

	function addPaymentMethod() {
		toast.success("Add card flow is ready to open.");
	}

	function applyPromotion(companyId: string, assignmentId: string) {
		const account = accounts.find((current) => current.id === companyId);
		const promotion = account?.eligiblePromotions.find(
			(current) => current.assignmentId === assignmentId,
		);

		if (!account || !promotion) {
			return;
		}

		const existingCompanyEntry =
			promotion.applicationMode === "Possession"
				? Object.entries(appliedPromotionIdsByCompany).find(
						([currentCompanyId, currentAssignmentId]) =>
							currentCompanyId !== companyId &&
							currentAssignmentId === promotion.assignmentId,
					)
				: undefined;

		if (existingCompanyEntry) {
			const existingAccount = accounts.find(
				(current) => current.id === existingCompanyEntry[0],
			);

			toast.error(
				`${promotion.code} is already reserved for ${
					existingAccount?.name ?? "another company"
				}.`,
			);
			return;
		}

		setAppliedPromotionIdsByCompany((current) => ({
			...current,
			[companyId]: promotion.assignmentId,
		}));
		toast.success(`${promotion.code} applied to ${account.name}.`);
	}

	function applyPromotionCode(companyId: string) {
		const account = accounts.find((current) => current.id === companyId);

		if (!account) {
			return;
		}

		const validation = validateWorkspacePromotionCode({
			code: getPromotionCodeValue(companyId),
		});

		if (validation.errors.code || !validation.values) {
			setPromotionCodeErrorsByCompany((current) => ({
				...current,
				[companyId]: validation.errors.code,
			}));
			return;
		}

		const promotion = findWorkspaceBillingPromotionByCode({
			account,
			code: validation.values.code,
		});

		if (!promotion) {
			setPromotionCodeErrorsByCompany((current) => ({
				...current,
				[companyId]: "Promo code is not valid for this company.",
			}));
			toast.error("Promo code is not valid for this company.");
			return;
		}

		setAppliedPromotionIdsByCompany((current) => ({
			...current,
			[companyId]: promotion.assignmentId,
		}));
		setPromotionCodesByCompany((current) => ({
			...current,
			[companyId]: "",
		}));
		setPromotionCodeErrorsByCompany((current) => ({
			...current,
			[companyId]: undefined,
		}));
		toast.success(`${promotion.code} applied to ${account.name}.`);
	}

	function clearPromotion(companyId: string) {
		setAppliedPromotionIdsByCompany((current) => ({
			...current,
			[companyId]: undefined,
		}));
	}

	function cancelSubscription(companyId: string) {
		const account = accounts.find((current) => current.id === companyId);

		if (!account) {
			return;
		}

		toast.success(`${account.name} cancellation review is ready.`);
	}

	async function payCompany(companyId: string) {
		const account = accounts.find((current) => current.id === companyId);
		const paymentMethod = WorkspaceBillingPaymentMethods.find(
			(method) => method.id === getSelectedPaymentMethodId(companyId),
		);

		if (!account) {
			return;
		}

		if (getSelectedBillingMode(companyId) === "MANUAL") {
			const session = await CreateManualCheckout({
				amountLabel: formatWorkspaceBillingCurrency(account.totalDue),
				billingCycle: account.billingCycle === "Annual" ? "YEARLY" : "MONTHLY",
				companyId: account.id,
				companyName: account.name,
				planCode: account.planId,
				planName: account.planName,
				purpose: account.status === "Scheduled" ? "ADDITIONAL_COMPANY" : "RENEWAL",
				returnTo: "/workspace/billing-and-subscription",
			});

			toast.success(`Opening PayMongo hosted checkout for ${account.name}.`);
			window.location.assign(session.checkoutUrl);
			return;
		}

		if (!paymentMethod) {
			return;
		}

		toast.success(
			`${account.name} ${account.paymentActionLabel.toLowerCase()} is ready on ${paymentMethod.brand} ending ${paymentMethod.last4}.`,
		);
	}

	return {
		accounts,
		expandedCompanyId,
		filteredAccounts,
		getPromotionCodeError,
		getPromotionCodeValue,
		getSelectedBillingMode,
		getSelectedPaymentMethodId,
		paymentMethods: WorkspaceBillingPaymentMethods,
		query,
		renewalFilter,
		renewalFilterOptions: [
			"All",
			"Needs attention",
			"Scheduled",
		] as const satisfies readonly WorkspaceBillingRenewalFilter[],
		subscriber: WorkspaceBillingCurrentSubscriber,
		summary,
		addPaymentMethod,
		applyPromotion,
		applyPromotionCode,
		cancelSubscription,
		clearPromotion,
		payCompany,
		setExpandedCompanyId,
		setQuery,
		setRenewalFilter,
		updatePromotionCode,
		updateBillingMode,
		updatePaymentMethod,
	};
}
