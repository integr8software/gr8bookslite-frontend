"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import type { BillingMode, BillingPaymentFormValues } from "@/app/src/data/billing/BillingTypes";
import {
  findWorkspaceBillingPromotionByCode,
  formatWorkspaceBillingCurrency,
  getWorkspaceBillingInvoicesForCompany,
  getWorkspaceBillingOutstandingAmount,
  getWorkspaceBillingPaymentsForCompany,
  WorkspaceBillingPaymentMethods,
  WorkspaceBillingCurrentSubscriber,
  createWorkspaceBillingCompanyAccounts,
  getWorkspaceBillingDefaultPaymentMethodId,
  getWorkspaceBillingSummary,
} from "@/app/src/data/workspace/billing-and-subscription/WorkspaceBillingSubscriptionData";
import { CreateManualCheckout } from "@/app/src/services/billing/ManualBillingApi";
import { CreatePaymongoCardPaymentMethod } from "@/app/src/services/billing/PaymongoClient";
import type {
  WorkspaceBillingCompanyTab,
  WorkspaceBillingInvoiceRecord,
  WorkspaceBillingPaymentMethodRecord,
  WorkspaceBillingRecordStatus,
} from "@/app/src/types/workspace/billing-and-subscription/WorkspaceBillingSubscriptionTypes";
import { NewPayMongoCardPaymentMethodId } from "@/app/src/ui/workspace/billing-and-subscription/WorkspaceBillingSubscriptionParts";
import { validateWorkspacePromotionCode } from "@/app/src/validations/workspace/billing-and-subscription/WorkspaceBillingSubscriptionValidation";

const AutoBillingMode: BillingMode = "AUTO";
const ManualBillingMode: BillingMode = "MANUAL";
type WorkspaceBillingRenewalFilter = "All" | "Needs attention" | "Scheduled";

export function useWorkspaceBillingSubscriptionPage() {
  const [customPaymentMethods, setCustomPaymentMethods] = useState<WorkspaceBillingPaymentMethodRecord[]>([]);
  const [selectedPaymentMethodIdsByCompany, setSelectedPaymentMethodIdsByCompany] = useState<Record<string, string>>({});
  const [selectedBillingModesByCompany, setSelectedBillingModesByCompany] = useState<Record<string, BillingMode>>({});
  const [appliedPromotionIdsByCompany, setAppliedPromotionIdsByCompany] = useState<Record<string, string | undefined>>({});
  const [promotionCodesByCompany, setPromotionCodesByCompany] = useState<Record<string, string>>({});
  const [promotionCodeErrorsByCompany, setPromotionCodeErrorsByCompany] = useState<Record<string, string | undefined>>({});
  const [query, setQuery] = useState("");
  const [renewalFilter, setRenewalFilter] = useState<WorkspaceBillingRenewalFilter>("All");
  const [activeTabsByCompany, setActiveTabsByCompany] = useState<Record<string, WorkspaceBillingCompanyTab>>({});
  const [transactionQueriesByCompany, setTransactionQueriesByCompany] = useState<Record<string, string>>({});
  const [transactionStatusFiltersByCompany, setTransactionStatusFiltersByCompany] = useState<
    Record<string, WorkspaceBillingRecordStatus | "all">
  >({});
  const [cancelledCompanyIds, setCancelledCompanyIds] = useState<string[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<WorkspaceBillingInvoiceRecord | null>(null);
  const baseAccounts = useMemo(() => createWorkspaceBillingCompanyAccounts(appliedPromotionIdsByCompany), [appliedPromotionIdsByCompany]);
  const accounts = useMemo(() => {
    return baseAccounts.map((account) => {
      if (cancelledCompanyIds.includes(account.id)) {
        return {
          ...account,
          renewalState: "Scheduled" as const,
          renewalStatusLabel: "Cancels at period end",
        };
      }
      return account;
    });
  }, [baseAccounts, cancelledCompanyIds]);
  const filteredAccounts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return accounts.filter((account) => {
      const matchesQuery =
        !normalizedQuery ||
        [account.name, account.planName, account.status, account.renewalState, account.renewalStatusLabel, account.appliedPromotion?.code]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesRenewal =
        renewalFilter === "All" ||
        (renewalFilter === "Needs attention" &&
          (account.renewalState === "Overdue" || account.renewalState === "Due today" || account.renewalState === "Due soon")) ||
        (renewalFilter === "Scheduled" && account.renewalState === "Scheduled");

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

    return selectedBillingModesByCompany[companyId] ?? account?.billingMode ?? ManualBillingMode;
  }

  function getActiveCompanyTab(companyId: string) {
    return activeTabsByCompany[companyId] ?? "overview";
  }

  function updateActiveCompanyTab(companyId: string, tab: WorkspaceBillingCompanyTab) {
    setActiveTabsByCompany((current) => ({
      ...current,
      [companyId]: tab,
    }));
  }

  function getTransactionQuery(companyId: string) {
    return transactionQueriesByCompany[companyId] ?? "";
  }

  function updateTransactionQuery(companyId: string, query: string) {
    setTransactionQueriesByCompany((current) => ({
      ...current,
      [companyId]: query,
    }));
  }

  function getTransactionStatusFilter(companyId: string) {
    return transactionStatusFiltersByCompany[companyId] ?? "all";
  }

  function updateTransactionStatusFilter(companyId: string, status: WorkspaceBillingRecordStatus | "all") {
    setTransactionStatusFiltersByCompany((current) => ({
      ...current,
      [companyId]: status,
    }));
  }

  function getFilteredInvoices(companyId: string) {
    const query = getTransactionQuery(companyId).trim().toLowerCase();
    const status = getTransactionStatusFilter(companyId);

    return getWorkspaceBillingInvoicesForCompany(companyId).filter((invoice) => {
      const matchesStatus = status === "all" || invoice.status === status;
      const matchesQuery =
        !query ||
        [invoice.invoiceNo, invoice.description, invoice.category, invoice.providerReference]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);

      return matchesStatus && matchesQuery;
    });
  }

  function getFilteredPayments(companyId: string) {
    const query = getTransactionQuery(companyId).trim().toLowerCase();
    const status = getTransactionStatusFilter(companyId);

    return getWorkspaceBillingPaymentsForCompany(companyId).filter((payment) => {
      const matchesStatus = status === "all" || payment.status === status;
      const matchesQuery =
        !query ||
        [payment.paymentReference, payment.invoiceNo, payment.paymentMethodDisplay, payment.providerReference]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);

      return matchesStatus && matchesQuery;
    });
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
    const promotion = account?.eligiblePromotions.find((current) => current.assignmentId === assignmentId);

    if (!account || !promotion) {
      return;
    }

    const existingCompanyEntry =
      promotion.applicationMode === "Possession"
        ? Object.entries(appliedPromotionIdsByCompany).find(
            ([currentCompanyId, currentAssignmentId]) => currentCompanyId !== companyId && currentAssignmentId === promotion.assignmentId,
          )
        : undefined;

    if (existingCompanyEntry) {
      const existingAccount = accounts.find((current) => current.id === existingCompanyEntry[0]);

      toast.error(`${promotion.code} is already reserved for ${existingAccount?.name ?? "another company"}.`);
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

  function isCompanyCancelled(companyId: string) {
    return cancelledCompanyIds.includes(companyId);
  }

  function cancelSubscription(companyId: string) {
    const account = accounts.find((current) => current.id === companyId);

    if (!account) {
      return;
    }

    setCancelledCompanyIds((current) => (current.includes(companyId) ? current : [...current, companyId]));
    setSelectedBillingModesByCompany((current) => ({
      ...current,
      [companyId]: ManualBillingMode,
    }));
    toast.success(`Subscription for ${account.name} cancelled. Access remains active until ${account.renewalDate}.`);
  }

  function reactivateSubscription(companyId: string) {
    const account = accounts.find((current) => current.id === companyId);

    if (!account) {
      return;
    }

    setCancelledCompanyIds((current) => current.filter((id) => id !== companyId));
    toast.success(`Subscription for ${account.name} reactivated.`);
  }

  function unlinkCompanyPaymentMethod(companyId: string) {
    const account = accounts.find((current) => current.id === companyId);

    if (!account) {
      return;
    }

    setSelectedPaymentMethodIdsByCompany((current) => ({
      ...current,
      [companyId]: "",
    }));
    setSelectedBillingModesByCompany((current) => ({
      ...current,
      [companyId]: ManualBillingMode,
    }));
    toast.success(`Payment card unlinked from ${account.name}. Switched to manual billing.`);
  }

  async function renewSubscription(companyId: string) {
    const account = accounts.find((current) => current.id === companyId);

    if (!account) {
      return;
    }

    const currentMode = getSelectedBillingMode(companyId);
    if (currentMode === ManualBillingMode) {
      await payCompany(companyId);
      return;
    }

    const paymentMethodId = getSelectedPaymentMethodId(companyId);
    const paymentMethod = allPaymentMethods.find((method) => method.id === paymentMethodId);

    if (!paymentMethod) {
      toast.error("Please attach a valid payment card first.");
      return;
    }

    setCancelledCompanyIds((current) => current.filter((id) => id !== companyId));
    toast.success(
      `Subscription for ${account.name} renewed successfully. ${formatWorkspaceBillingCurrency(account.totalDue)} charged to ${paymentMethod.brand} ending in ${paymentMethod.last4}.`,
    );
  }

  async function payCompany(companyId: string) {
    const account = accounts.find((current) => current.id === companyId);
    const paymentMethod = WorkspaceBillingPaymentMethods.find((method) => method.id === getSelectedPaymentMethodId(companyId));

    if (!account) {
      return;
    }

    if (getSelectedBillingMode(companyId) === ManualBillingMode) {
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

  const allPaymentMethods = useMemo(
    () => [...customPaymentMethods, ...WorkspaceBillingPaymentMethods],
    [customPaymentMethods],
  );

  async function saveCompanyBillingMethod({
    companyId,
    billingMode,
    paymentMethodId,
    newCardValues,
  }: {
    companyId: string;
    billingMode: BillingMode;
    paymentMethodId?: string;
    newCardValues?: BillingPaymentFormValues;
  }) {
    const account = accounts.find((current) => current.id === companyId);
    if (!account) {
      return;
    }

    if (billingMode === AutoBillingMode) {
      if (paymentMethodId === NewPayMongoCardPaymentMethodId && newCardValues) {
        const result = await CreatePaymongoCardPaymentMethod(newCardValues);
        const cleanCardNumber = newCardValues.cardNumber.replace(/\s+/g, "");
        const last4 = cleanCardNumber.slice(-4) || "0000";
        const newMethod: WorkspaceBillingPaymentMethodRecord = {
          id: result.paymentMethodId,
          brand: "PayMongo Card",
          last4,
          isDefault: false,
          holderName: newCardValues.cardholderName,
          label: `PayMongo card ending ${last4}`,
          expiryLabel: `${newCardValues.expiryMonth}/${newCardValues.expiryYear}`,
        };

        setCustomPaymentMethods((current) => [newMethod, ...current]);
        setSelectedPaymentMethodIdsByCompany((current) => ({
          ...current,
          [companyId]: result.paymentMethodId,
        }));
        setSelectedBillingModesByCompany((current) => ({
          ...current,
          [companyId]: AutoBillingMode,
        }));
        toast.success(`Card ending ${last4} attached and auto renewal activated for ${account.name}.`);
        return;
      }

      if (paymentMethodId) {
        setSelectedPaymentMethodIdsByCompany((current) => ({
          ...current,
          [companyId]: paymentMethodId,
        }));
        setSelectedBillingModesByCompany((current) => ({
          ...current,
          [companyId]: AutoBillingMode,
        }));
        const matched = allPaymentMethods.find((m) => m.id === paymentMethodId);
        toast.success(`Auto renewal activated with ${matched?.label ?? "selected card"} for ${account.name}.`);
        return;
      }
    }

    setSelectedBillingModesByCompany((current) => ({
      ...current,
      [companyId]: ManualBillingMode,
    }));
    toast.success(`Billing mode updated to manual hosted checkout for ${account.name}.`);
  }

  return {
    accounts,
    filteredAccounts,
    getActiveCompanyTab,
    getFilteredInvoices,
    getFilteredPayments,
    getPromotionCodeError,
    getPromotionCodeValue,
    getSelectedBillingMode,
    getSelectedPaymentMethodId,
    getTransactionQuery,
    getTransactionStatusFilter,
    getWorkspaceBillingOutstandingAmount,
    isCompanyCancelled,
    paymentMethods: allPaymentMethods,
    query,
    renewalFilter,
    renewalFilterOptions: ["All", "Needs attention", "Scheduled"] as const satisfies readonly WorkspaceBillingRenewalFilter[],
    subscriber: WorkspaceBillingCurrentSubscriber,
    summary,
    addPaymentMethod,
    applyPromotion,
    applyPromotionCode,
    cancelSubscription,
    clearPromotion,
    payCompany,
    reactivateSubscription,
    renewSubscription,
    saveCompanyBillingMethod,
    selectedInvoice,
    setSelectedInvoice,
    unlinkCompanyPaymentMethod,
    updateActiveCompanyTab,
    setQuery,
    setRenewalFilter,
    updateTransactionQuery,
    updateTransactionStatusFilter,
    updatePromotionCode,
    updateBillingMode,
    updatePaymentMethod,
  };
}
