import type { WorkspaceCompanyFormValues } from "@/app/src/types/workspace/WorkspaceCompanyTypes";

const PendingAdditionalCompanyManualCheckoutKey = "gr8booksneo:workspace:add-company:manual-checkout-draft";

type PendingAdditionalCompanyManualCheckoutDraft = {
  paymentAttemptId?: string | number;
  values: WorkspaceCompanyFormValues;
};

export function SavePendingAdditionalCompanyManualCheckoutDraft(draft: PendingAdditionalCompanyManualCheckoutDraft) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    PendingAdditionalCompanyManualCheckoutKey,
    JSON.stringify({
      ...draft,
      values: {
        ...draft.values,
        logoFile: null,
        logoName: "",
        logoUrl: "",
      },
    }),
  );
}

export function ReadPendingAdditionalCompanyManualCheckoutDraft() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.sessionStorage.getItem(PendingAdditionalCompanyManualCheckoutKey);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as PendingAdditionalCompanyManualCheckoutDraft;
  } catch {
    return null;
  }
}

export function ClearPendingAdditionalCompanyManualCheckoutDraft() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(PendingAdditionalCompanyManualCheckoutKey);
}
