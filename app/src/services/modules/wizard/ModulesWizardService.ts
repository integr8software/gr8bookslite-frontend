import type { ModulesWizardValues } from "@/app/src/data/modules/wizard/ModulesWizardData";

const ModulesWizardDraftKey = "gr8bookslite.modulesWizardDraft";

export function LoadModulesWizardDraft() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawDraft = window.localStorage.getItem(ModulesWizardDraftKey);

  if (!rawDraft) {
    return null;
  }

  try {
    return JSON.parse(rawDraft) as Partial<ModulesWizardValues>;
  } catch {
    window.localStorage.removeItem(ModulesWizardDraftKey);
    return null;
  }
}

export function SaveModulesWizardDraft(values: ModulesWizardValues) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ModulesWizardDraftKey, JSON.stringify(values));
}

export function ClearModulesWizardDraft() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ModulesWizardDraftKey);
}

export async function SubmitModulesWizard(values: ModulesWizardValues) {
  SaveModulesWizardDraft(values);

  return {
    reference: `MW-${Date.now().toString().slice(-6)}`,
    savedAt: new Date().toISOString(),
  };
}
