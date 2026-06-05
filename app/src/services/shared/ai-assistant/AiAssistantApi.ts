import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
	AiAssistantChatMessage,
	AiAssistantChatResponse,
} from "@/app/src/types/shared/ai-assistant/AiAssistantTypes";

export type SendAiAssistantMessageParams = {
	message: string;
	currentPath: string;
	history: AiAssistantChatMessage[];
};

export async function SendAiAssistantMessage({
	currentPath,
	history,
	message,
}: SendAiAssistantMessageParams) {
	const response = await ApiClient.post<AiAssistantChatResponse>(
		"/ai-assistant/chat",
		{
			currentPath,
			history,
			message,
		},
	);

	return response.data;
}
