import {
  AiAssistantChatMessagesStorageKey,
  AiAssistantChatOpenStorageKey,
  AiAssistantChatStorageVersion,
  AiAssistantChatStorageVersionKey,
  AiAssistantMaxStoredMessages,
  AiAssistantPurchaseRequestPrefillStorageKey,
  AiAssistantTermsMaintenancePendingActionStorageKey,
  AiAssistantWelcomeMessage,
} from "@/app/src/constants/shared/ai-assistant/AiAssistantConstants";
import type {
  AiAssistantChatMessage,
  AiAssistantPurchaseRequestPrefill,
  AiAssistantTermsMaintenanceAction,
} from "@/app/src/types/shared/ai-assistant/AiAssistantTypes";

export const AiAssistantInitialMessages: AiAssistantChatMessage[] = [
  {
    role: "assistant",
    content: AiAssistantWelcomeMessage,
  },
];

export function LoadAiAssistantChatMessages() {
  if (typeof window === "undefined") {
    return AiAssistantInitialMessages;
  }

  try {
    if (!IsAiAssistantStorageCurrent()) {
      ResetAiAssistantStoredMessages();
      return AiAssistantInitialMessages;
    }

    const stored = window.localStorage.getItem(AiAssistantChatMessagesStorageKey);

    if (!stored) {
      return AiAssistantInitialMessages;
    }

    const parsed = JSON.parse(stored) as AiAssistantChatMessage[];

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return AiAssistantInitialMessages;
    }

    const messages = parsed.filter(IsValidAiAssistantMessage);

    return messages.length > 0
      ? messages.slice(-AiAssistantMaxStoredMessages)
      : AiAssistantInitialMessages;
  } catch {
    return AiAssistantInitialMessages;
  }
}

export function SaveAiAssistantChatMessages(messages: AiAssistantChatMessage[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AiAssistantChatStorageVersionKey, AiAssistantChatStorageVersion);
  window.localStorage.setItem(
    AiAssistantChatMessagesStorageKey,
    JSON.stringify(messages.slice(-AiAssistantMaxStoredMessages)),
  );
}

export function LoadAiAssistantChatOpenState() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(AiAssistantChatOpenStorageKey) === "1";
}

export function SaveAiAssistantChatOpenState(isOpen: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AiAssistantChatOpenStorageKey, isOpen ? "1" : "0");
}

export function SaveAiAssistantPurchaseRequestPrefill(
  prefill: AiAssistantPurchaseRequestPrefill | undefined,
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    AiAssistantPurchaseRequestPrefillStorageKey,
    JSON.stringify(prefill ?? {}),
  );
}

export function SaveAiAssistantTermsMaintenancePendingAction(
  action: AiAssistantTermsMaintenanceAction,
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    AiAssistantTermsMaintenancePendingActionStorageKey,
    JSON.stringify(action),
  );
}

export function LoadAiAssistantTermsMaintenancePendingAction() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(AiAssistantTermsMaintenancePendingActionStorageKey);

    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as AiAssistantTermsMaintenanceAction;

    return IsTermsMaintenanceAssistantAction(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function ClearAiAssistantTermsMaintenancePendingAction() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AiAssistantTermsMaintenancePendingActionStorageKey);
}

export function ClearAiAssistantStorage() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AiAssistantChatMessagesStorageKey);
  window.localStorage.removeItem(AiAssistantChatOpenStorageKey);
  window.localStorage.removeItem(AiAssistantChatStorageVersionKey);
  window.localStorage.removeItem(AiAssistantPurchaseRequestPrefillStorageKey);
  window.localStorage.removeItem(AiAssistantTermsMaintenancePendingActionStorageKey);
}

function IsValidAiAssistantMessage(
  message: AiAssistantChatMessage,
): message is AiAssistantChatMessage {
  return (
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" &&
    message.content.trim().length > 0
  );
}

function IsAiAssistantStorageCurrent() {
  return (
    window.localStorage.getItem(AiAssistantChatStorageVersionKey) === AiAssistantChatStorageVersion
  );
}

function IsTermsMaintenanceAssistantAction(
  action: AiAssistantTermsMaintenanceAction,
): action is AiAssistantTermsMaintenanceAction {
  return (
    action?.type === "terms_maintenance" &&
    action.moduleCode === "TM" &&
    ["open", "search", "filter_status", "prepare_add", "preview_edit"].includes(action.command)
  );
}

function ResetAiAssistantStoredMessages() {
  window.localStorage.setItem(AiAssistantChatStorageVersionKey, AiAssistantChatStorageVersion);
  window.localStorage.removeItem(AiAssistantChatMessagesStorageKey);
}
