"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
	WorkspaceBillingPaymentMethods,
	createWorkspaceBillingCompanyAccounts,
	findWorkspaceBillingPromotionByCode,
	getWorkspaceBillingDefaultPaymentMethodId,
	getWorkspaceBillingSummary,
} from "@/app/src/data/workspace/billing-and-subscription/WorkspaceBillingSubscriptionData";
import { validateWorkspacePromotionCode } from "@/app/src/validations/workspace/billing-and-subscription/WorkspaceBillingSubscriptionValidation";

export function useWorkspaceBillingSubscriptionPage() {
	const [selectedPaymentMethodIdsByCompany, setSelectedPaymentMethodIdsByCompany] =
		useState<Record<string, string>>({});
	const [appliedPromotionIdsByCompany, setAppliedPromotionIdsByCompany] =
		useState<Record<string, string | undefined>>({});
	const [codeValuesByCompany, setCodeValuesByCompany] = useState<
		Record<string, string>
	>({});
	const [codeErrorsByCompany, setCodeErrorsByCompany] = useState<
		Record<string, string | undefined>
	>({});
	const accounts = useMemo(
		() => createWorkspaceBillingCompanyAccounts(appliedPromotionIdsByCompany),
		[appliedPromotionIdsByCompany],
	);
	const summary = useMemo(() => getWorkspaceBillingSummary(accounts), [accounts]);
	const defaultPaymentMethodId = getWorkspaceBillingDefaultPaymentMethodId();

	function getSelectedPaymentMethodId(companyId: string) {
		return selectedPaymentMethodIdsByCompany[companyId] ?? defaultPaymentMethodId;
	}

	function updatePaymentMethod(companyId: string, paymentMethodId: string) {
		setSelectedPaymentMethodIdsByCompany((current) => ({
			...current,
			[companyId]: paymentMethodId,
		}));
	}

	function updatePromotionCode(companyId: string, value: string) {
		setCodeValuesByCompany((current) => ({
			...current,
			[companyId]: value,
		}));
		setCodeErrorsByCompany((current) => ({
			...current,
			[companyId]: undefined,
		}));
	}

	function applyPromotionCode(companyId: string) {
		const account = accounts.find((current) => current.id === companyId);
		const code = codeValuesByCompany[companyId] ?? "";
		const validation = validateWorkspacePromotionCode({ code });

		if (!account) {
			return;
		}

		if (validation.errors.code) {
			setCodeErrorsByCompany((current) => ({
				...current,
				[companyId]: validation.errors.code,
			}));
			return;
		}

		const promotion = findWorkspaceBillingPromotionByCode({
			account,
			code: validation.values?.code ?? code,
		});

		if (!promotion) {
			setCodeErrorsByCompany((current) => ({
				...current,
				[companyId]: "This code is not available for this company.",
			}));
			return;
		}

		applyPromotion(companyId, promotion.id);
		setCodeValuesByCompany((current) => ({
			...current,
			[companyId]: "",
		}));
	}

	function applyPromotion(companyId: string, promotionId: string) {
		const account = accounts.find((current) => current.id === companyId);
		const promotion = account?.eligiblePromotions.find(
			(current) => current.id === promotionId,
		);

		if (!account || !promotion) {
			return;
		}

		setAppliedPromotionIdsByCompany((current) => ({
			...current,
			[companyId]: promotionId,
		}));
		setCodeErrorsByCompany((current) => ({
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

	function payCompany(companyId: string) {
		const account = accounts.find((current) => current.id === companyId);
		const paymentMethod = WorkspaceBillingPaymentMethods.find(
			(method) => method.id === getSelectedPaymentMethodId(companyId),
		);

		if (!account || !paymentMethod) {
			return;
		}

		toast.success(
			`${account.name} payment is ready on ${paymentMethod.brand} ending ${paymentMethod.last4}.`,
		);
	}

	return {
		accounts,
		codeErrorsByCompany,
		codeValuesByCompany,
		getSelectedPaymentMethodId,
		paymentMethods: WorkspaceBillingPaymentMethods,
		summary,
		applyPromotion,
		applyPromotionCode,
		clearPromotion,
		payCompany,
		updatePaymentMethod,
		updatePromotionCode,
	};
}

