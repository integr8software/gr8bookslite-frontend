import { AppMaxFileUploadSizeBytes, AppMaxFileUploadSizeLabel } from "@/app/src/constants/shared/app/AppConstants";
import {
  aiAssistantControllerChatV1,
  aiAssistantControllerGetTranscriptionJobV1,
  aiAssistantControllerTranscribeV1,
} from "@/app/src/generated/api/ai-assistant/ai-assistant";
import type { AiAssistantChatDto } from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";

const AiAssistantTranscriptionRequestTimeoutMs = 30000;
const AiAssistantTranscriptionPollIntervalMs = 1500;
const AiAssistantTranscriptionPollTimeoutMs = 120000;

export type SendAiAssistantMessageParams = AiAssistantChatDto;

export async function SendAiAssistantMessage({ currentPath, history, message }: SendAiAssistantMessageParams) {
  return aiAssistantControllerChatV1({
    currentPath,
    history,
    message,
  });
}

export async function TranscribeAiAssistantAudio(audio: Blob) {
  if (audio.size > AppMaxFileUploadSizeBytes) {
    throw new Error(`Audio recording must be ${AppMaxFileUploadSizeLabel} or smaller.`);
  }

  const response = await aiAssistantControllerTranscribeV1({ audio }, {
    timeout: AiAssistantTranscriptionRequestTimeoutMs,
  });

  if (response.status === "completed") {
    return { transcript: response.transcript };
  }

  return PollAiAssistantTranscription(response.jobId);
}

async function PollAiAssistantTranscription(jobId: string) {
  const deadline = Date.now() + AiAssistantTranscriptionPollTimeoutMs;

  while (Date.now() < deadline) {
    await Wait(AiAssistantTranscriptionPollIntervalMs);

    const response = await aiAssistantControllerGetTranscriptionJobV1(jobId, {
      timeout: AiAssistantTranscriptionRequestTimeoutMs,
    });

    if (response.status === "completed") {
      return { transcript: response.transcript };
    }

    if (response.status === "failed") {
      throw new Error(response.error);
    }
  }

  throw new Error("Neo AI transcription took too long. Please try again.");
}

function Wait(durationMs: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, durationMs));
}
