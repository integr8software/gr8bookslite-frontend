import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import { GetAccessToken } from "@/app/src/data/auth/AuthSessionStorage";
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
	const accessToken = GetAccessToken();
	const response = await ApiClient.post<AiAssistantChatResponse>(
		"/ai-assistant/chat",
		{
			currentPath,
			history,
			message,
		},
		{
			headers: accessToken
				? {
						Authorization: `Bearer ${accessToken}`,
					}
				: undefined,
		},
	);

	return response.data;
}
