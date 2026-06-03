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
	  };

export type AiAssistantChatResponse = {
	message: string;
	action: AiAssistantAction | null;
};
