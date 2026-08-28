export const AiAssistantPurchaseRequestPrefillStorageKey =
  "gr8books.aiAssistant.purchaseRequestPrefill";

export const AiAssistantSalesQuotationPrefillStorageKey =
  "gr8books.aiAssistant.salesQuotationPrefill";

export const AiAssistantTermsMaintenancePendingActionStorageKey =
	"gr8books.aiAssistant.TermsMaintenancePendingAction";

export const AiAssistantTermsMaintenanceActionEvent =
	"gr8books:ai-assistant:terms-maintenance-action";

export const AiAssistantChatMessagesStorageKey =
  "gr8books.aiAssistant.chatMessages";

export const AiAssistantChatOpenStorageKey = "gr8books.aiAssistant.isOpen";

export const AiAssistantLauncherPositionStorageKey =
  "gr8books.aiAssistant.launcherPosition";

export const AiAssistantChatStorageVersionKey =
  "gr8books.aiAssistant.chatStorageVersion";

export const AiAssistantChatStorageVersion = "neo-ai-organized-modules-v5";

export const AiAssistantMaxStoredMessages = 20;

export const AiAssistantLogoSrc = "/logo/logo-64x64.png";

export const AiAssistantName = "Neo AI";

export const AiAssistantSubtitle = "Guide, explain, open modules";

export const AiAssistantWelcomeMessage =
  "Hi, I'm Neo AI. I can explain Gr8Books Neo modules and open the right page for you. How can I help?";

export const AiAssistantInputPlaceholder = "Ask: Open Charts of Accounts";

export const AiAssistantFallbackErrorMessage =
  "Neo AI can't process this at the moment, but I can still help you find and understand modules. Try asking me to open or explain a module.";

export const AiAssistantChatInputFocusDelayMs = 50;

export const AiAssistantChatScrollBottomThresholdPx = 24;

export const AiAssistantNavigationStartEvent = "gr8books:navigation-start";

export const AiAssistantVoiceRepliesEnabled = false;

export const AiAssistantVoiceModeOptions = [
	{ label: "Manual", value: "manual" },
	{ label: "Auto", value: "auto" },
] as const;

export const AiAssistantRecordingSilenceDurationMs = 1500;

export const AiAssistantRecordingInitialGraceMs = 1200;

export const AiAssistantRecordingMaxDurationMs = 15000;

export const AiAssistantRecordingSilenceRmsThreshold = 0.018;

export const AiAssistantAutomaticRestartDelayMs = 650;

export const AiAssistantDuplicateTranscriptWindowMs = 4000;

export const AiAssistantSpeechRecognitionUnsupportedMessage =
	"Voice input is not supported in this browser.";

export const AiAssistantAutomaticModeUnsupportedMessage =
	"Automatic voice mode is not supported in this browser.";

export const AiAssistantVoiceReplyUnsupportedMessage =
	"Voice replies are not supported in this browser.";

export const AiAssistantMicrophoneAccessBlockedMessage =
	"Microphone access is blocked. Allow microphone permission for this site, then try again.";

export const AiAssistantLauncherSizePx = 52;

export const AiAssistantLauncherMarginPx = 16;

export const AiAssistantLauncherDragClickThresholdPx = 6;

export const AiAssistantLauncherDragId = "ai-assistant-launcher";
