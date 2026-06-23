import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
	AiAssistantChatMessage,
	AiAssistantChatResponse,
} from "@/app/src/types/shared/ai-assistant/AiAssistantTypes";

const AiAssistantTranscriptionTimeoutMs = 120000;

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

export async function TranscribeAiAssistantAudio(audio: Blob) {
	const formData = new FormData();
	const extension = audio.type.includes("ogg")
		? "ogg"
		: audio.type.includes("wav")
			? "wav"
			: "webm";

	formData.append("audio", audio, `neo-ai-recording.${extension}`);

	const response = await ApiClient.post<{ transcript: string }>(
		"/ai-assistant/transcribe",
		formData,
		{
			headers: {
				"Content-Type": "multipart/form-data",
			},
			timeout: AiAssistantTranscriptionTimeoutMs,
		},
	);

	return response.data;
}
