"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ModulesWizardInitialValues,
  ModulesWizardSteps,
  type ModulesWizardValues,
} from "@/app/src/data/modules/wizard/ModulesWizardData";
import {
  ClearModulesWizardDraft,
  LoadModulesWizardDraft,
  SaveModulesWizardDraft,
  SubmitModulesWizard,
} from "@/app/src/services/modules/wizard/ModulesWizardService";

export function useModulesWizard() {
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<ModulesWizardValues>(
    ModulesWizardInitialValues,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitReference, setSubmitReference] = useState<string | null>(null);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);

  const currentStep = ModulesWizardSteps[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === ModulesWizardSteps.length - 1;

  const completionPercent = useMemo(
    () => Math.round(((stepIndex + 1) / ModulesWizardSteps.length) * 100),
    [stepIndex],
  );

  useEffect(() => {
    const draft = LoadModulesWizardDraft();

    if (draft) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValues((currentValues) => ({
        ...currentValues,
        ...draft,
      }));
    }

    setIsDraftLoaded(true);
  }, []);

  useEffect(() => {
    if (!isDraftLoaded) {
      return;
    }

    SaveModulesWizardDraft(values);
  }, [values, isDraftLoaded]);

  function updateValue<Key extends keyof ModulesWizardValues>(
    key: Key,
    value: ModulesWizardValues[Key],
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
    setSubmitReference(null);
  }

  function goToStep(nextStepIndex: number) {
    setStepIndex(
      Math.min(Math.max(nextStepIndex, 0), ModulesWizardSteps.length - 1),
    );
  }

  function goBack() {
    goToStep(stepIndex - 1);
  }

  function goNext() {
    goToStep(stepIndex + 1);
  }

  function resetWizard() {
    ClearModulesWizardDraft();
    setValues(ModulesWizardInitialValues);
    setStepIndex(0);
    setSubmitReference(null);
  }

  async function submitWizard() {
    setIsSubmitting(true);

    try {
      const result = await SubmitModulesWizard(values);
      setSubmitReference(result.reference);
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    completionPercent,
    currentStep,
    goBack,
    goNext,
    goToStep,
    isFirstStep,
    isLastStep,
    isSubmitting,
    resetWizard,
    stepIndex,
    submitReference,
    submitWizard,
    updateValue,
    values,
  };
}
