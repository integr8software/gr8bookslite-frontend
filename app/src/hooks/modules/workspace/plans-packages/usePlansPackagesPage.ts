"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  InitialPlanPackageAddOns,
  InitialPlanPackageBillingPreviewValues,
  InitialPlanPackagePlans,
  calculateBillingPreview,
  createPlanPackagePlanFormValues,
  updatePlanPackagePlanFromForm,
} from "@/app/src/data/modules/workspace/plans-packages/PlanPackageData";
import type {
  PlanPackageAddOnCode,
  PlanPackageAddOnPricingRecord,
  PlanPackageBillingPreviewValues,
  PlanPackagePlanFormErrors,
  PlanPackagePlanFormValues,
  PlanPackagePricingFormErrors,
} from "@/app/src/types/modules/workspace/plans-packages/PlanPackageTypes";
import {
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
  const [billingPreviewValues, setBillingPreviewValues] =
    useState<PlanPackageBillingPreviewValues>(
      InitialPlanPackageBillingPreviewValues,
    );
  const billingPreview = useMemo(
    () =>
      selectedPlan
        ? calculateBillingPreview({
            addOns,
            plan: selectedPlan,
            values: billingPreviewValues,
          })
        : null,
    [addOns, billingPreviewValues, selectedPlan],
  );
  const summary = useMemo(() => {
    const activePlans = plans.filter((plan) => plan.status === "Active").length;
    const inactivePlans = plans.filter(
      (plan) => plan.status === "Inactive",
    ).length;
    const activeAddOns = addOns.filter((addOn) => addOn.isActive).length;
    const enabledModules = selectedPlan?.enabledModuleKeys.length ?? 0;

    return {
      activeAddOns,
      activePlans,
      enabledModules,
      inactivePlans,
    };
  }, [addOns, plans, selectedPlan?.enabledModuleKeys.length]);

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

  function updateBillingPreview(values: Partial<PlanPackageBillingPreviewValues>) {
    setBillingPreviewValues((current) => ({ ...current, ...values }));
  }

  function togglePlanStatus(planId: string) {
    const currentPlan = plans.find((plan) => plan.id === planId);

    if (!currentPlan) {
      return;
    }

    const nextStatus =
      currentPlan.status === "Active" ? "Inactive" : "Active";

    setPlans((current) =>
      current.map((plan) =>
        plan.id === planId ? { ...plan, status: nextStatus } : plan,
      ),
    );

    if (selectedPlan?.id === planId) {
      setPlanDraft((current) => ({ ...current, status: nextStatus }));
    }

    toast.success(
      nextStatus === "Active" ? "Plan activated." : "Plan inactivated.",
    );
  }

  return {
    addOns,
    billingPreview,
    billingPreviewValues,
    planDraft,
    planErrors,
    plans,
    pricingErrors,
    selectedPlan,
    summary,
    savePlan,
    savePricing,
    selectPlan,
    togglePlanStatus,
    togglePlanModule,
    updateAddOnPricing,
    updateBillingPreview,
    updatePlanDraft,
  };
}
