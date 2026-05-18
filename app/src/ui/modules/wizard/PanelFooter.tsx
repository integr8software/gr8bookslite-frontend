"use client";

import { ArrowLeft, ArrowRight, Check, LoaderCircle } from "lucide-react";
import { useModulesWizard } from "@/app/src/hooks/modules/wizard/useModulesWizard";

type PanelFooterProps = {
  wizard: ReturnType<typeof useModulesWizard>;
};

export function PanelFooter({ wizard }: PanelFooterProps) {
  return (
    <div className="mt-6 flex flex-col-reverse gap-3 border-t border-darknavy/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={wizard.goBack}
        disabled={wizard.isFirstStep}
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy transition hover:bg-darknavy/3 disabled:cursor-not-allowed disabled:opacity-45"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>Back</span>
      </button>
      {wizard.isLastStep ? (
        <button
          type="button"
          onClick={wizard.submitWizard}
          disabled={wizard.isSubmitting}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-darknavy px-4 text-sm font-semibold text-offwhite transition hover:bg-darknavy/90 disabled:cursor-not-allowed disabled:bg-darknavy/55"
        >
          {wizard.isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          <span>{wizard.isSubmitting ? "Saving" : "Finish wizard"}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={wizard.goNext}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-darknavy px-4 text-sm font-semibold text-offwhite transition hover:bg-darknavy/90"
        >
          <span>Continue</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
