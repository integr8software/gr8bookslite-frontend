"use client";

import { useEffect, useRef, useState } from "react";
import {
	AiAssistantAutomaticModeUnsupportedMessage,
	AiAssistantAutomaticRestartDelayMs,
	AiAssistantDuplicateTranscriptWindowMs,
	AiAssistantMicrophoneAccessBlockedMessage,
	AiAssistantRecordingInitialGraceMs,
	AiAssistantRecordingMaxDurationMs,
	AiAssistantRecordingSilenceDurationMs,
	AiAssistantRecordingSilenceRmsThreshold,
	AiAssistantSpeechRecognitionUnsupportedMessage,
	AiAssistantVoiceReplyUnsupportedMessage,
} from "@/app/src/constants/shared/ai-assistant/AiAssistantConstants";
import { TranscribeAiAssistantAudio } from "@/app/src/services/shared/ai-assistant/AiAssistantApi";
import {
	getNativeSpeechRecognitionErrorMessage,
	getSpeechInputProvider,
	getSpeechRecognitionConstructor,
	getSupportedRecordingMimeType,
	hasMediaRecorder,
	hasNativeSpeechRecognition,
	requestMicrophoneAccess,
	type BrowserSpeechRecognition,
	type BrowserSpeechRecognitionErrorEvent,
} from "@/app/src/services/shared/ai-assistant/AiAssistantSpeechSupport";
import type {
	AiAssistantChatMessage,
	AiAssistantSpeechControls,
	AiAssistantSpeechInputProvider,
} from "@/app/src/types/shared/ai-assistant/AiAssistantTypes";

declare global {
	interface Window {
		webkitAudioContext?: typeof AudioContext;
	}
}

type UseAiAssistantSpeechParams = {
	isSending: boolean;
	messages: AiAssistantChatMessage[];
	setInput: (value: string) => void;
	submitCommand: (value: string) => Promise<void>;
};

export function useAiAssistantSpeech({
	isSending,
	messages,
	setInput,
	submitCommand,
}: UseAiAssistantSpeechParams): AiAssistantSpeechControls {
	const audioContextRef = useRef<AudioContext | null>(null);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const mediaStreamRef = useRef<MediaStream | null>(null);
	const audioChunksRef = useRef<Blob[]>([]);
	const nativeRecognitionRef = useRef<BrowserSpeechRecognition | null>(null);
	const silenceAnimationFrameRef = useRef<number | null>(null);
	const automaticRestartTimeoutRef = useRef<number | null>(null);
	const recordingStartedAtRef = useRef(0);
	const lastAudibleAtRef = useRef(0);
	const lastSpokenMessageRef = useRef("");
	const isAutomaticModeEnabledRef = useRef(false);
	const isSendingRef = useRef(isSending);
	const isTranscribingRef = useRef(false);
	const recordingAutoSubmitRef = useRef(false);
	const lastSubmittedTranscriptRef = useRef("");
	const shouldRestartAutomaticModeRef = useRef(false);
	const isSubmittingAutomaticTranscriptRef = useRef(false);
	const ignoreNextNativeRecognitionErrorRef = useRef(false);
	const [isListening, setIsListening] = useState(false);
	const [isTranscribing, setIsTranscribing] = useState(false);
	const [isAutomaticModeEnabled, setIsAutomaticModeEnabled] = useState(false);
	const [speechInputProvider, setSpeechInputProvider] =
		useState<AiAssistantSpeechInputProvider | null>(() =>
			getSpeechInputProvider(),
		);
	const [isNativeSpeechRecognitionSupported] = useState(() =>
		hasNativeSpeechRecognition(),
	);
	const [isSpeechSynthesisSupported] = useState(() =>
		typeof window === "undefined" ? false : "speechSynthesis" in window,
	);
	const [isVoiceReplyEnabled, setIsVoiceReplyEnabled] = useState(false);
	const [speechError, setSpeechError] = useState<string | null>(null);
	const isSpeechRecognitionSupported = speechInputProvider !== null;

	useEffect(() => {
		return () => {
			const recognition = nativeRecognitionRef.current;
			nativeRecognitionRef.current = null;

			try {
				recognition?.abort();
			} catch {
				// The browser may already have ended recognition during unmount.
			}

			const recorder = mediaRecorderRef.current;
			mediaRecorderRef.current = null;

			try {
				if (recorder && recorder.state !== "inactive") {
					recorder.onstop = null;
					recorder.stop();
				}
			} catch {
				// The recorder may already be stopped during browser teardown.
			}

			if (silenceAnimationFrameRef.current !== null) {
				window.cancelAnimationFrame(silenceAnimationFrameRef.current);
				silenceAnimationFrameRef.current = null;
			}

			const audioContext = audioContextRef.current;
			audioContextRef.current = null;

			if (audioContext && audioContext.state !== "closed") {
				void audioContext.close();
			}

			mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
			mediaStreamRef.current = null;

			if (automaticRestartTimeoutRef.current !== null) {
				window.clearTimeout(automaticRestartTimeoutRef.current);
				automaticRestartTimeoutRef.current = null;
			}

			window.speechSynthesis?.cancel();
		};
	}, []);

	function speak(message: string) {
		window.speechSynthesis.cancel();

		const utterance = new SpeechSynthesisUtterance(message);
		utterance.lang = "en-US";
		utterance.rate = 1;
		utterance.pitch = 1;

		window.speechSynthesis.speak(utterance);
	}

	useEffect(() => {
		if (!isVoiceReplyEnabled || !isSpeechSynthesisSupported) {
			return;
		}

		const latestMessage = messages.at(-1);

		if (
			!latestMessage ||
			latestMessage.role !== "assistant" ||
			latestMessage.content === lastSpokenMessageRef.current
		) {
			return;
		}

		lastSpokenMessageRef.current = latestMessage.content;
		speak(latestMessage.content);
	}, [isSpeechSynthesisSupported, isVoiceReplyEnabled, messages]);

	async function toggleListening() {
		if (!isSpeechRecognitionSupported) {
			setSpeechError(AiAssistantSpeechRecognitionUnsupportedMessage);
			return;
		}

		if (isAutomaticModeEnabledRef.current) {
			disableAutomaticMode();
			return;
		}

		if (isListening) {
			stopNativeRecognition("stop");
			stopRecording();
			return;
		}

		await startSpeechInput({ autoSubmit: false });
	}

	async function toggleAutomaticMode() {
		if (!isSpeechRecognitionSupported) {
			setSpeechError(AiAssistantAutomaticModeUnsupportedMessage);
			return;
		}

		if (isAutomaticModeEnabledRef.current) {
			disableAutomaticMode();
			return;
		}

		isAutomaticModeEnabledRef.current = true;
		setIsAutomaticModeEnabled(true);
		await startSpeechInput({ autoSubmit: true });
	}

	function disableAutomaticMode() {
		isAutomaticModeEnabledRef.current = false;
		setIsAutomaticModeEnabled(false);
		setSpeechError(null);
		shouldRestartAutomaticModeRef.current = false;
		clearAutomaticRestart();
		stopNativeRecognition("abort", { ignoreError: true });
		stopRecording();
	}

	async function startSpeechInput({ autoSubmit }: { autoSubmit: boolean }) {
		setSpeechError(null);
		clearAutomaticRestart();

		if (hasNativeSpeechRecognition()) {
			setSpeechInputProvider("native");
			startNativeRecognition({ autoSubmit });
			return;
		}

		if (!hasMediaRecorder()) {
			setSpeechInputProvider(null);
			setSpeechError(AiAssistantSpeechRecognitionUnsupportedMessage);
			return;
		}

		setSpeechInputProvider("recording");

		const microphoneAccess = await requestMicrophoneAccess();

		if (!microphoneAccess.isAllowed) {
			setSpeechError(
				microphoneAccess.message ??
					AiAssistantMicrophoneAccessBlockedMessage,
			);
			disableAutomaticMode();
			return;
		}

		if (!microphoneAccess.stream) {
			setSpeechError("Microphone access did not return an audio stream.");
			disableAutomaticMode();
			return;
		}

		startRecording(microphoneAccess.stream, autoSubmit);
	}

	function startNativeRecognition({ autoSubmit }: { autoSubmit: boolean }) {
		const SpeechRecognitionConstructor = getSpeechRecognitionConstructor();

		if (!SpeechRecognitionConstructor) {
			setSpeechError("Native speech recognition is not supported here.");
			return;
		}

		stopNativeRecognition("abort", { ignoreError: true });

		const recognition = new SpeechRecognitionConstructor();
		nativeRecognitionRef.current = recognition;
		recognition.continuous = autoSubmit;
		recognition.interimResults = true;
		recognition.maxAlternatives = 1;
		recognition.lang = "";

		recognition.onresult = (event) => {
			let finalTranscript = "";
			let interimTranscript = "";

			for (let index = event.resultIndex; index < event.results.length; index += 1) {
				const result = event.results[index];
				const transcript = result[0]?.transcript ?? "";

				if (result.isFinal) {
					finalTranscript += transcript;
				} else {
					interimTranscript += transcript;
				}
			}

			const normalizedFinalTranscript = finalTranscript.trim();
			const visibleTranscript =
				normalizedFinalTranscript || interimTranscript.trim();

			if (visibleTranscript) {
				setInput(visibleTranscript);
			}

			if (!normalizedFinalTranscript) {
				return;
			}

			if (autoSubmit) {
				void submitRecognizedTranscript(normalizedFinalTranscript);
			} else {
				setInput(normalizedFinalTranscript);
			}
		};

		recognition.onerror = (event) => {
			if (
				ignoreNextNativeRecognitionErrorRef.current ||
				event.error === "aborted" ||
				(autoSubmit &&
					isAutomaticModeEnabledRef.current &&
					event.error === "no-speech")
			) {
				ignoreNextNativeRecognitionErrorRef.current = false;
				return;
			}

			setSpeechError(getNativeSpeechRecognitionErrorMessage(event));
		};

		recognition.onend = () => {
			if (nativeRecognitionRef.current === recognition) {
				nativeRecognitionRef.current = null;
			}

			setIsListening(false);

			if (autoSubmit && isAutomaticModeEnabledRef.current) {
				scheduleAutomaticRestart();
			}
		};

		try {
			setSpeechError(null);
			setIsListening(true);
			recognition.start();
		} catch (error) {
			nativeRecognitionRef.current = null;
			setIsListening(false);
			setSpeechError(
				error instanceof DOMException
					? getNativeSpeechRecognitionErrorMessage({
							error: error.name,
						} as BrowserSpeechRecognitionErrorEvent)
					: "Neo AI could not start voice recognition.",
			);
		}
	}

	function stopNativeRecognition(
		action: "abort" | "stop",
		options: { ignoreError?: boolean } = {},
	) {
		const recognition = nativeRecognitionRef.current;
		nativeRecognitionRef.current = null;

		if (!recognition) {
			setIsListening(false);
			return;
		}

		try {
			ignoreNextNativeRecognitionErrorRef.current = Boolean(options.ignoreError);

			if (action === "abort") {
				recognition.abort();
			} else {
				recognition.stop();
			}
		} catch {
			ignoreNextNativeRecognitionErrorRef.current = false;
			setIsListening(false);
		}
	}

	function startRecording(stream: MediaStream, autoSubmit: boolean) {
		const mimeType = getSupportedRecordingMimeType();
		const mediaRecorder = new MediaRecorder(
			stream,
			mimeType ? { mimeType } : undefined,
		);

		audioChunksRef.current = [];
		mediaStreamRef.current = stream;
		mediaRecorderRef.current = mediaRecorder;
		recordingAutoSubmitRef.current = autoSubmit;

		mediaRecorder.ondataavailable = (event) => {
			if (event.data.size > 0) {
				audioChunksRef.current.push(event.data);
			}
		};

		mediaRecorder.onstop = () => {
			const shouldAutoSubmit = recordingAutoSubmitRef.current;

			setIsListening(false);
			stopSilenceDetection();
			stopMediaStream();
			void transcribeRecording({ autoSubmit: shouldAutoSubmit });
		};

		setSpeechError(null);
		setIsListening(true);
		mediaRecorder.start();
		startSilenceDetection(stream);
	}

	function stopRecording() {
		const recorder = mediaRecorderRef.current;

		if (!recorder || recorder.state === "inactive") {
			setIsListening(false);
			stopMediaStream();
			return;
		}

		recorder.stop();
	}

	async function transcribeRecording({ autoSubmit }: { autoSubmit: boolean }) {
		const audioChunks = audioChunksRef.current;

		if (audioChunks.length === 0) {
			setSpeechError("No audio was recorded.");
			restartAutomaticRecordingIfNeeded(autoSubmit);
			return;
		}

		const audio = new Blob(audioChunks, {
			type: mediaRecorderRef.current?.mimeType || "audio/webm",
		});

		try {
			setIsTranscribing(true);
			setSpeechError(null);

			const response = await TranscribeAiAssistantAudio(audio);
			const transcript = response.transcript.trim();

			if (!transcript) {
				setSpeechError("Neo AI could not hear clear speech in that recording.");
				return;
			}

			if (autoSubmit) {
				await submitRecognizedTranscript(transcript);
			} else {
				setInput(transcript);
			}
		} catch (error) {
			setSpeechError(
				error instanceof Error
					? error.message
					: "Neo AI could not transcribe that recording.",
			);
		} finally {
			setIsTranscribing(false);
			audioChunksRef.current = [];
			if (autoSubmit && !isAutomaticModeEnabledRef.current) {
				return;
			}

			if (autoSubmit && isSendingRef.current) {
				shouldRestartAutomaticModeRef.current = true;
				return;
			}

			restartAutomaticRecordingIfNeeded(autoSubmit);
		}
	}

	async function submitRecognizedTranscript(transcript: string) {
		const normalizedTranscript = transcript.trim();

		if (!normalizedTranscript) {
			restartAutomaticRecordingIfNeeded(true);
			return;
		}

		if (isSendingRef.current) {
			shouldRestartAutomaticModeRef.current = true;
			return;
		}

		if (normalizedTranscript === lastSubmittedTranscriptRef.current) {
			restartAutomaticRecordingIfNeeded(true);
			return;
		}

		lastSubmittedTranscriptRef.current = normalizedTranscript;
		window.setTimeout(() => {
			if (lastSubmittedTranscriptRef.current === normalizedTranscript) {
				lastSubmittedTranscriptRef.current = "";
			}
		}, AiAssistantDuplicateTranscriptWindowMs);
		setInput("");

		if (isAutomaticModeEnabledRef.current) {
			shouldRestartAutomaticModeRef.current = true;
			isSubmittingAutomaticTranscriptRef.current = true;
			stopNativeRecognition("abort", { ignoreError: true });
			stopRecording();
		}

		try {
			await submitCommand(normalizedTranscript);
		} finally {
			isSubmittingAutomaticTranscriptRef.current = false;
		}

		if (
			isAutomaticModeEnabledRef.current &&
			!isSendingRef.current &&
			!isTranscribingRef.current &&
			!isSubmittingAutomaticTranscriptRef.current
		) {
			shouldRestartAutomaticModeRef.current = false;
			scheduleAutomaticRestart();
		}
	}

	function restartAutomaticRecordingIfNeeded(autoSubmit: boolean) {
		if (!autoSubmit || !isAutomaticModeEnabledRef.current) {
			return;
		}

		scheduleAutomaticRestart();
	}

	function scheduleAutomaticRestart() {
		clearAutomaticRestart();

		if (
			!isAutomaticModeEnabledRef.current ||
			isSendingRef.current ||
			isTranscribingRef.current ||
			isSubmittingAutomaticTranscriptRef.current
		) {
			if (isAutomaticModeEnabledRef.current) {
				shouldRestartAutomaticModeRef.current = true;
			}
			return;
		}

		automaticRestartTimeoutRef.current = window.setTimeout(() => {
			if (!isAutomaticModeEnabledRef.current) {
				return;
			}

			void startSpeechInput({ autoSubmit: true });
		}, AiAssistantAutomaticRestartDelayMs);
	}

	function clearAutomaticRestart() {
		if (automaticRestartTimeoutRef.current !== null) {
			window.clearTimeout(automaticRestartTimeoutRef.current);
			automaticRestartTimeoutRef.current = null;
		}
	}

	useEffect(() => {
		isSendingRef.current = isSending;
		isTranscribingRef.current = isTranscribing;

		if (
			!isSending &&
			!isTranscribing &&
			shouldRestartAutomaticModeRef.current &&
			isAutomaticModeEnabledRef.current &&
			!isSubmittingAutomaticTranscriptRef.current
		) {
			shouldRestartAutomaticModeRef.current = false;
			scheduleAutomaticRestart();
		}
	}, [isSending, isTranscribing]);

	function toggleVoiceReply() {
		if (!isSpeechSynthesisSupported) {
			setSpeechError(AiAssistantVoiceReplyUnsupportedMessage);
			return;
		}

		setIsVoiceReplyEnabled((current) => {
			const next = !current;

			if (!next) {
				window.speechSynthesis.cancel();
			}

			return next;
		});
	}

	return {
		isAutomaticModeEnabled,
		isListening,
		isNativeSpeechRecognitionSupported,
		isSpeechRecognitionSupported,
		isSpeechSynthesisSupported,
		isTranscribing,
		isVoiceReplyEnabled,
		speechError,
		speechInputProvider,
		toggleAutomaticMode,
		toggleListening,
		toggleVoiceReply,
	};

	function startSilenceDetection(stream: MediaStream) {
		stopSilenceDetection();

		const AudioContextConstructor =
			window.AudioContext ?? window.webkitAudioContext;

		if (!AudioContextConstructor) {
			return;
		}

		const audioContext = new AudioContextConstructor();
		const analyser = audioContext.createAnalyser();
		const source = audioContext.createMediaStreamSource(stream);

		analyser.fftSize = 1024;
		source.connect(analyser);
		audioContextRef.current = audioContext;
		recordingStartedAtRef.current = window.performance.now();
		lastAudibleAtRef.current = recordingStartedAtRef.current;

		const samples = new Uint8Array(analyser.fftSize);

		function checkSilence() {
			const now = window.performance.now();
			const recorder = mediaRecorderRef.current;

			if (!recorder || recorder.state !== "recording") {
				return;
			}

			analyser.getByteTimeDomainData(samples);

			let sumSquares = 0;

			for (const sample of samples) {
				const normalizedSample = (sample - 128) / 128;
				sumSquares += normalizedSample * normalizedSample;
			}

			const rms = Math.sqrt(sumSquares / samples.length);

			if (rms > AiAssistantRecordingSilenceRmsThreshold) {
				lastAudibleAtRef.current = now;
			}

			const isPastGracePeriod =
				now - recordingStartedAtRef.current >
				AiAssistantRecordingInitialGraceMs;
			const isSilentLongEnough =
				now - lastAudibleAtRef.current >
				AiAssistantRecordingSilenceDurationMs;
			const isTooLong =
				now - recordingStartedAtRef.current >
				AiAssistantRecordingMaxDurationMs;

			if ((isPastGracePeriod && isSilentLongEnough) || isTooLong) {
				stopRecording();
				return;
			}

			silenceAnimationFrameRef.current =
				window.requestAnimationFrame(checkSilence);
		}

		silenceAnimationFrameRef.current =
			window.requestAnimationFrame(checkSilence);
	}

	function stopSilenceDetection() {
		if (silenceAnimationFrameRef.current !== null) {
			window.cancelAnimationFrame(silenceAnimationFrameRef.current);
			silenceAnimationFrameRef.current = null;
		}

		const audioContext = audioContextRef.current;
		audioContextRef.current = null;

		if (audioContext && audioContext.state !== "closed") {
			void audioContext.close();
		}
	}

	function stopMediaStream() {
		mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
		mediaStreamRef.current = null;
	}
}
