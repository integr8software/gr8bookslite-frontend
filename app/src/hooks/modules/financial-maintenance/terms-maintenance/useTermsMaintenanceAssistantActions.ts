"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";
import { AiAssistantTermsMaintenanceActionEvent } from "@/app/src/constants/shared/ai-assistant/AiAssistantConstants";
import {
  ClearAiAssistantTermsMaintenancePendingAction,
  LoadAiAssistantTermsMaintenancePendingAction,
} from "@/app/src/data/shared/ai-assistant/AiAssistantData";
import type { useTermsMaintenanceListPage } from "@/app/src/hooks/modules/financial-maintenance/terms-maintenance/useTermsMaintenanceListPage";
import type { AiAssistantTermsMaintenanceAction } from "@/app/src/types/shared/ai-assistant/AiAssistantTypes";
import type {
  TermsMaintenance,
  TermsMaintenanceDrawerState,
  TermsMaintenanceFormValues,
} from "@/app/src/types/modules/financial-maintenance/terms-maintenance/TermsMaintenanceTypes";

type UseTermsMaintenanceAssistantActionsParams = {
  closeDrawer: () => void;
  openDrawer: (state: TermsMaintenanceDrawerState) => void;
  page: ReturnType<typeof useTermsMaintenanceListPage>;
};

export function useTermsMaintenanceAssistantActions({ closeDrawer, openDrawer, page }: UseTermsMaintenanceAssistantActionsParams) {
  useEffect(() => {
    function handleAssistantAction(action: AiAssistantTermsMaintenanceAction) {
      return ApplyTermsMaintenanceAssistantAction({
        action,
        closeDrawer,
        openDrawer,
        page,
      });
    }

    const pendingAction = LoadAiAssistantTermsMaintenancePendingAction();

    if (pendingAction && handleAssistantAction(pendingAction)) {
      ClearAiAssistantTermsMaintenancePendingAction();
    }

    function handleEvent(event: Event) {
      const action = (event as CustomEvent<AiAssistantTermsMaintenanceAction>).detail;

      if (action?.type !== "terms_maintenance") {
        return;
      }

      if (handleAssistantAction(action)) {
        ClearAiAssistantTermsMaintenancePendingAction();
      }
    }

    window.addEventListener(AiAssistantTermsMaintenanceActionEvent, handleEvent);

    return () => {
      window.removeEventListener(AiAssistantTermsMaintenanceActionEvent, handleEvent);
    };
  }, [closeDrawer, openDrawer, page]);
}

function ApplyTermsMaintenanceAssistantAction({
  action,
  closeDrawer,
  openDrawer,
  page,
}: UseTermsMaintenanceAssistantActionsParams & {
  action: AiAssistantTermsMaintenanceAction;
}) {
  if (page.isLoading) {
    return false;
  }

  if (!page.permissions.canView) {
    toast.error("You do not have access to view terms.");
    return true;
  }

  if (action.command === "open") {
    closeDrawer();
    return true;
  }

  if (action.command === "search") {
    page.setQuery(action.query ?? "");
    page.setDatemodeFilter("All");
    return true;
  }

  if (action.command === "filter_status") {
    page.setStatusFilter(action.status ?? "Active");
    page.setDatemodeFilter("All");
    return true;
  }

  if (action.command === "prepare_add") {
    if (!page.permissions.canCreate) {
      toast.error("You do not have access to create terms.");
      return true;
    }

    openDrawer({
      initialValues: CreateAssistantTermInitialValues(action),
      mode: "add",
    });
    return true;
  }

  if (action.command === "preview_edit") {
    if (!page.permissions.canUpdate) {
      toast.error("You do not have access to edit terms.");
      return true;
    }

    const matchingTerms = FindAssistantTargetTerms(page.terms, action.targetTermName);

    if (matchingTerms.length === 1) {
      openDrawer({ mode: "edit", term: matchingTerms[0] });
      return true;
    }

    if (matchingTerms.length > 1) {
      toast("Please choose a more specific term to edit.");
      return true;
    }

    toast("Please choose which term you want to edit.");
  }

  return true;
}

function CreateAssistantTermInitialValues(action: AiAssistantTermsMaintenanceAction): TermsMaintenanceFormValues {
  return {
    name: action.prefill?.name ?? "",
    description: action.prefill?.description ?? "",
    datemode: action.prefill?.datemode ?? "Month",
    period: action.prefill?.period ?? "",
    status: action.prefill?.status ?? "Active",
  };
}

function FindAssistantTargetTerms(terms: TermsMaintenance[], targetTermName?: string) {
  const normalizedTargetTermName = targetTermName?.trim().toLowerCase();

  if (!normalizedTargetTermName) {
    return [];
  }

  const exactMatches = terms.filter((term) => term.name.trim().toLowerCase() === normalizedTargetTermName);

  return exactMatches.length > 0 ? exactMatches : terms.filter((term) => term.name.trim().toLowerCase().includes(normalizedTargetTermName));
}
