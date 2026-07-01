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

export type AiAssistantTermManagementPrefill = {
	name?: string;
	description?: string;
	datemode?: "Day" | "Month" | "Year";
	period?: string;
	status?: "Active" | "Inactive";
};

export type AiAssistantTermManagementAction = {
	type: "term_management";
	moduleCode: "TM";
	command:
		| "open"
		| "search"
		| "filter_status"
		| "prepare_add"
		| "preview_edit";
	label?: string;
	query?: string;
	status?: "Active" | "Inactive";
	prefill?: AiAssistantTermManagementPrefill;
	targetTermName?: string;
};

export type AiAssistantAction =
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
	| AiAssistantTermManagementAction;

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
