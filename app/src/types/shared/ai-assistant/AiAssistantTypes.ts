import type {
  AiAssistantChatMessageDto,
  AiAssistantChatResponseDto,
  AiAssistantPurchaseRequestPrefillDto,
  AiAssistantTermsMaintenanceActionDto,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";

export type AiAssistantChatMessage = AiAssistantChatMessageDto;

export type AiAssistantPurchaseRequestPrefill = AiAssistantPurchaseRequestPrefillDto;

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

export type AiAssistantTermsMaintenanceAction = AiAssistantTermsMaintenanceActionDto;

export type AiAssistantAction = NonNullable<AiAssistantChatResponseDto["action"]>;

export type AiAssistantLauncherCorner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

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
