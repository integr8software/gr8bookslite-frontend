"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  InitialPlanPackageAddOns,
  InitialPlanPackageBillingPreviewValues,
  InitialPlanPackageDiscountFormValues,
  InitialPlanPackageDiscounts,
  InitialPlanPackagePlans,
  calculateBillingPreview,
  createPlanPackageDiscountFormValues,
  createPlanPackageDiscountFromForm,
  createPlanPackagePlanFormValues,
  updatePlanPackageDiscountFromForm,
  updatePlanPackagePlanFromForm,
} from "@/app/src/data/modules/workspace/plans-packages/PlanPackageData";
import type {
  PlanPackageAddOnCode,
  PlanPackageAddOnPricingRecord,
  PlanPackageBillingPreviewValues,
  PlanPackageDiscountFormErrors,
  PlanPackageDiscountFormValues,
  PlanPackageDiscountRecord,
  PlanPackagePlanFormErrors,
  PlanPackagePlanFormValues,
  PlanPackagePricingFormErrors,
} from "@/app/src/types/modules/workspace/plans-packages/PlanPackageTypes";
import {
  validatePlanPackageDiscountForm,
  validatePlanPackagePlanForm,
  validatePlanPackagePricingForm,
} from "@/app/src/validations/modules/workspace/plans-packages/PlanPackageValidation";

export function usePlansPackagesPage() {
  const [plans, setPlans] = useState(InitialPlanPackagePlans);
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id ?? "");
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? plans[0];
  const [planDraft, setPlanDraft] = useState<PlanPackagePlanFormValues>(
    selectedPlan
      ? createPlanPackagePlanFormValues(selectedPlan)
      : InitialPlanPackagePlans[0]
        ? createPlanPackagePlanFormValues(InitialPlanPackagePlans[0])
        : {
            description: "",
            enabledModuleKeys: [],
            includedUsers: 1,
            monthlyPrice: 0,
            status: "Draft",
            yearlyPrice: 0,
          },
  );
  const [planErrors, setPlanErrors] = useState<PlanPackagePlanFormErrors>({});
  const [addOns, setAddOns] = useState(InitialPlanPackageAddOns);
  const [pricingErrors, setPricingErrors] =
    useState<PlanPackagePricingFormErrors>({});
  const [discounts, setDiscounts] = useState(InitialPlanPackageDiscounts);
  const [discountDraft, setDiscountDraft] =
    useState<PlanPackageDiscountFormValues>(
      InitialPlanPackageDiscountFormValues,
    );
  const [discountErrors, setDiscountErrors] =
    useState<PlanPackageDiscountFormErrors>({});
  const [editingDiscountId, setEditingDiscountId] = useState<string | null>(null);
  const [billingPreviewValues, setBillingPreviewValues] =
    useState<PlanPackageBillingPreviewValues>(
      InitialPlanPackageBillingPreviewValues,
    );
  const selectedDiscount =
    discounts.find((discount) => discount.id === billingPreviewValues.discountId) ??
    null;
  const billingPreview = useMemo(
    () =>
      selectedPlan
        ? calculateBillingPreview({
            addOns,
            discount: selectedDiscount,
            plan: selectedPlan,
            values: billingPreviewValues,
          })
        : null,
    [addOns, billingPreviewValues, selectedDiscount, selectedPlan],
  );
  const summary = useMemo(() => {
    const activePlans = plans.filter((plan) => plan.status === "Active").length;
    const activeDiscounts = discounts.filter(
      (discount) => discount.status === "Active",
    ).length;
    const activeAddOns = addOns.filter((addOn) => addOn.isActive).length;
    const enabledModules = selectedPlan?.enabledModuleKeys.length ?? 0;

    return {
      activeAddOns,
      activeDiscounts,
      activePlans,
      enabledModules,
    };
  }, [addOns, discounts, plans, selectedPlan?.enabledModuleKeys.length]);

  function selectPlan(planId: string) {
    const plan = plans.find((record) => record.id === planId);

    if (!plan) {
      return;
    }

    setSelectedPlanId(planId);
    setPlanDraft(createPlanPackagePlanFormValues(plan));
    setPlanErrors({});
  }

  function updatePlanDraft(values: Partial<PlanPackagePlanFormValues>) {
    setPlanDraft((current) => ({ ...current, ...values }));
  }

  function togglePlanModule(moduleKey: string) {
    setPlanDraft((current) => {
      const hasModule = current.enabledModuleKeys.includes(moduleKey);

      return {
        ...current,
        enabledModuleKeys: hasModule
          ? current.enabledModuleKeys.filter((key) => key !== moduleKey)
          : [...current.enabledModuleKeys, moduleKey],
      };
    });
  }

  function savePlan() {
    if (!selectedPlan) {
      return;
    }

    const errors = validatePlanPackagePlanForm(planDraft);
    setPlanErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const nextPlan = updatePlanPackagePlanFromForm(selectedPlan, planDraft);
    setPlans((current) =>
      current.map((plan) => (plan.id === nextPlan.id ? nextPlan : plan)),
    );
    toast.success("Plan package saved.");
  }

  function updateAddOnPricing(
    addOnCode: PlanPackageAddOnCode,
    values: Partial<PlanPackageAddOnPricingRecord>,
  ) {
    setAddOns((current) =>
      current.map((addOn) =>
        addOn.code === addOnCode ? { ...addOn, ...values } : addOn,
      ),
    );
  }

  function savePricing() {
    const errors = validatePlanPackagePricingForm(addOns);
    setPricingErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    toast.success("Add-on pricing saved.");
  }

  function updateDiscountDraft(values: Partial<PlanPackageDiscountFormValues>) {
    setDiscountDraft((current) => ({ ...current, ...values }));
  }

  function saveDiscount() {
    const errors = validatePlanPackageDiscountForm({
      discounts,
      editingDiscountId,
      values: discountDraft,
    });
    setDiscountErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    if (editingDiscountId) {
      setDiscounts((current) =>
        current.map((discount) =>
          discount.id === editingDiscountId
            ? updatePlanPackageDiscountFromForm(discount, discountDraft)
            : discount,
        ),
      );
      toast.success("Discount updated.");
    } else {
      setDiscounts((current) => [
        createPlanPackageDiscountFromForm(discountDraft),
        ...current,
      ]);
      toast.success("Discount created.");
    }

    resetDiscountDraft();
  }

  function editDiscount(discount: PlanPackageDiscountRecord) {
    setEditingDiscountId(discount.id);
    setDiscountDraft(createPlanPackageDiscountFormValues(discount));
    setDiscountErrors({});
  }

  function resetDiscountDraft() {
    setEditingDiscountId(null);
    setDiscountDraft(InitialPlanPackageDiscountFormValues);
    setDiscountErrors({});
  }

  function toggleDiscountStatus(discountId: string) {
    setDiscounts((current) =>
      current.map((discount) =>
        discount.id === discountId
          ? {
              ...discount,
              status: discount.status === "Active" ? "Archived" : "Active",
            }
          : discount,
      ),
    );
  }

  function updateBillingPreview(values: Partial<PlanPackageBillingPreviewValues>) {
    setBillingPreviewValues((current) => ({ ...current, ...values }));
  }

  return {
    addOns,
    billingPreview,
    billingPreviewValues,
    discountDraft,
    discountErrors,
    discounts,
    editingDiscountId,
    planDraft,
    planErrors,
    plans,
    pricingErrors,
    selectedPlan,
    summary,
    editDiscount,
    resetDiscountDraft,
    saveDiscount,
    savePlan,
    savePricing,
    selectPlan,
    toggleDiscountStatus,
    togglePlanModule,
    updateAddOnPricing,
    updateBillingPreview,
    updateDiscountDraft,
    updatePlanDraft,
  };
}
