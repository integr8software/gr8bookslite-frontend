import {
  AiAssistantNavigationStartEvent,
  AiAssistantTermsMaintenanceActionEvent,
} from "@/app/src/constants/shared/ai-assistant/AiAssistantConstants";
import {
  SaveAiAssistantPurchaseRequestPrefill,
  SaveAiAssistantTermsMaintenancePendingAction,
} from "@/app/src/data/shared/ai-assistant/AiAssistantData";
import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { AiAssistantAction } from "@/app/src/types/shared/ai-assistant/AiAssistantTypes";

type DispatchAiAssistantActionParams = {
  action: AiAssistantAction | null;
  currentPath: string;
  navigate: (route: string) => void;
};

export function DispatchAiAssistantAction({
  action,
  currentPath,
  navigate,
}: DispatchAiAssistantActionParams) {
  if (!action) {
    return;
  }

  if (action.type === "module_command") {
    startNavigation(getModuleRoute(action.moduleCode), navigate);
    return;
  }

  if (action.type === "navigate") {
    startNavigation(action.route, navigate);
    return;
  }

  if (action.type === "open_form") {
    if (action.target === "purchase_request" && action.prefill) {
      SaveAiAssistantPurchaseRequestPrefill(action.prefill);
    }

    startNavigation(action.route, navigate);
    return;
  }

  const route = getModuleRoute(action.moduleCode);

  SaveAiAssistantTermsMaintenancePendingAction(action);

  if (currentPath === route) {
    window.dispatchEvent(
      new CustomEvent(AiAssistantTermsMaintenanceActionEvent, {
        detail: action,
      }),
    );
    return;
  }

  startNavigation(route, navigate);
}

function startNavigation(route: string, navigate: (route: string) => void) {
  window.dispatchEvent(new Event(AiAssistantNavigationStartEvent));
  navigate(route);
}

