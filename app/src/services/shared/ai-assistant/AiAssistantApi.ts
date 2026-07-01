import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import {
	AppMaxFileUploadSizeBytes,
	AppMaxFileUploadSizeLabel,
} from "@/app/src/constants/shared/app/AppConstants";
import type {
	AiAssistantChatMessage,
	AiAssistantChatResponse,
} from "@/app/src/types/shared/ai-assistant/AiAssistantTypes";

const AiAssistantTranscriptionRequestTimeoutMs = 30000;
const AiAssistantTranscriptionPollIntervalMs = 1500;
const AiAssistantTranscriptionPollTimeoutMs = 120000;

type AiAssistantTranscriptionStatus =
	| { jobId: string; status: "queued" | "processing" }
	| { jobId?: string; status: "completed"; transcript: string }
	| { error: string; jobId: string; status: "failed" };

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
	if (audio.size > AppMaxFileUploadSizeBytes) {
		throw new Error(
			`Audio recording must be ${AppMaxFileUploadSizeLabel} or smaller.`,
		);
	}

	const formData = new FormData();
	const extension = audio.type.includes("ogg")
		? "ogg"
		: audio.type.includes("wav")
			? "wav"
			: "webm";

	formData.append("audio", audio, `neo-ai-recording.${extension}`);

	const response = await ApiClient.post<AiAssistantTranscriptionStatus>(
		"/ai-assistant/transcribe",
		formData,
		{
			headers: {
				"Content-Type": "multipart/form-data",
			},
			timeout: AiAssistantTranscriptionRequestTimeoutMs,
		},
	);

	if (response.data.status === "completed") {
		return { transcript: response.data.transcript };
	}

	if (response.data.status === "failed") {
		throw new Error(response.data.error);
	}

	return PollAiAssistantTranscription(response.data.jobId);
}

async function PollAiAssistantTranscription(jobId: string) {
	const deadline = Date.now() + AiAssistantTranscriptionPollTimeoutMs;

	while (Date.now() < deadline) {
		await Wait(AiAssistantTranscriptionPollIntervalMs);

		const response = await ApiClient.get<AiAssistantTranscriptionStatus>(
			`/ai-assistant/transcribe/${encodeURIComponent(jobId)}`,
			{ timeout: AiAssistantTranscriptionRequestTimeoutMs },
		);

		if (response.data.status === "completed") {
			return { transcript: response.data.transcript };
		}

		if (response.data.status === "failed") {
			throw new Error(response.data.error);
		}
	}

	throw new Error("Neo AI transcription took too long. Please try again.");
}

function Wait(durationMs: number) {
	return new Promise<void>((resolve) => window.setTimeout(resolve, durationMs));
}
