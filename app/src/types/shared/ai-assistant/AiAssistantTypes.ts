export type AiAssistantChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AiAssistantPurchaseRequestPrefill = {
  purchaseType?: string;
  supplierName?: string;
  department?: string;
  remarks?: string;
  items?: Array<{
    description?: string;
    quantity?: number;
    uom?: string;
    cost?: number;
  }>;
};

export type AiAssistantSalesQuotationPrefill = {
  partyName?: string;
  department?: string;
  remarks?: string;
  items?: Array<{
    description?: string;
    quantity?: number;
    uom?: string;
    itemPrice?: number;
  }>;
};

export type AiAssistantTermsMaintenancePrefill = {
  name?: string;
  description?: string;
  datemode?: "Day" | "Month" | "Year";
  period?: string;
  status?: "Active" | "Inactive";
};

export type AiAssistantTermsMaintenanceAction = {
  type: "terms_maintenance";
  moduleCode: "TM";
  command: "open" | "search" | "filter_status" | "prepare_add" | "preview_edit";
  label?: string;
  query?: string;
  status?: "Active" | "Inactive";
  prefill?: AiAssistantTermsMaintenancePrefill;
  targetTermName?: string;
};

export type AiAssistantAction =
  | {
      type: "module_command";
      moduleCode: string;
      command: "open";
      label?: string;
    }
  | {
      type: "navigate";
      route: string;
      label?: string;
    }
  | {
      type: "open_form";
      target: "purchase_request";
      route: string;
      label?: string;
      prefill?: AiAssistantPurchaseRequestPrefill;
    }
  | AiAssistantTermsMaintenanceAction;

export type AiAssistantChatResponse = {
  message: string;
  action: AiAssistantAction | null;
};

export type AiAssistantSpeechInputProvider = "native" | "recording";

export type AiAssistantVoiceInputMode = "manual" | "auto";

export type AiAssistantSpeechControls = {
  isAutomaticModeEnabled: boolean;
  isListening: boolean;
  isNativeSpeechRecognitionSupported: boolean;
  isSpeechRecognitionSupported: boolean;
  isSpeechSynthesisSupported: boolean;
  isTranscribing: boolean;
  isVoiceReplyEnabled: boolean;
  speechError: string | null;
  speechInputProvider: AiAssistantSpeechInputProvider | null;
  toggleAutomaticMode: () => void;
  toggleListening: () => void;
  toggleVoiceReply: () => void;
};
