"use client";

import { useEffect, useRef, useState } from "react";
import { TranscribeAiAssistantAudio } from "@/app/src/services/shared/ai-assistant/AiAssistantApi";
import type { AiAssistantChatMessage } from "@/app/src/types/shared/ai-assistant/AiAssistantTypes";

declare global {
	interface Window {
		webkitAudioContext?: typeof AudioContext;
	}
}

type UseAiAssistantSpeechParams = {
	messages: AiAssistantChatMessage[];
	setInput: (value: string) => void;
};

type MicrophoneAccessResult = {
	diagnostics?: MicrophoneDiagnostics;
	isAllowed: boolean;
	message?: string;
};

export type MicrophoneDiagnostics = {
	deviceSummary: string;
	errorName: string | null;
	hasGetUserMedia: boolean;
	isEmbedded: boolean;
	isMicrophonePolicyAllowed: boolean | null;
	isSecureContext: boolean;
	permissionState: PermissionState | null;
};

const RecordingSilenceDurationMs = 3000;
const RecordingInitialGraceMs = 1200;
const RecordingMaxDurationMs = 15000;
const RecordingSilenceRmsThreshold = 0.018;

export function useAiAssistantSpeech({
	messages,
	setInput,
}: UseAiAssistantSpeechParams) {
	const audioContextRef = useRef<AudioContext | null>(null);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const mediaStreamRef = useRef<MediaStream | null>(null);
	const audioChunksRef = useRef<Blob[]>([]);
	const silenceAnimationFrameRef = useRef<number | null>(null);
	const recordingStartedAtRef = useRef(0);
	const lastAudibleAtRef = useRef(0);
	const lastSpokenMessageRef = useRef("");
	const [isListening, setIsListening] = useState(false);
	const [isTranscribing, setIsTranscribing] = useState(false);
	const [isSpeechRecognitionSupported] = useState(() =>
		typeof window === "undefined" ? false : Boolean(window.MediaRecorder),
	);
	const [isSpeechSynthesisSupported] = useState(() =>
		typeof window === "undefined" ? false : "speechSynthesis" in window,
	);
	const [isVoiceReplyEnabled, setIsVoiceReplyEnabled] = useState(false);
	const [microphoneDiagnostics, setMicrophoneDiagnostics] =
		useState<MicrophoneDiagnostics | null>(null);
	const [speechError, setSpeechError] = useState<string | null>(null);

	useEffect(() => {
		return () => {
			mediaRecorderRef.current?.stop();
			stopSilenceDetection();
			stopMediaStream();
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
			setSpeechError("Voice recording is not supported in this browser.");
			return;
		}

		if (isListening) {
			stopRecording();
			return;
		}

		const microphoneAccess = await requestMicrophoneAccess();

		if (!microphoneAccess.isAllowed) {
			setMicrophoneDiagnostics(microphoneAccess.diagnostics ?? null);
			setSpeechError(
				microphoneAccess.message ??
					"Microphone access is blocked. Allow microphone permission for this site, then try again.",
			);
			return;
		}

		if (!microphoneAccess.stream) {
			setSpeechError("Microphone access did not return an audio stream.");
			return;
		}

		startRecording(microphoneAccess.stream);
	}

	function startRecording(stream: MediaStream) {
		const mimeType = getSupportedRecordingMimeType();
		const mediaRecorder = new MediaRecorder(
			stream,
			mimeType ? { mimeType } : undefined,
		);

		audioChunksRef.current = [];
		mediaStreamRef.current = stream;
		mediaRecorderRef.current = mediaRecorder;

		mediaRecorder.ondataavailable = (event) => {
			if (event.data.size > 0) {
				audioChunksRef.current.push(event.data);
			}
		};

		mediaRecorder.onstop = () => {
			setIsListening(false);
			stopSilenceDetection();
			stopMediaStream();
			void transcribeRecording();
		};

		setSpeechError(null);
		setMicrophoneDiagnostics(null);
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

	async function transcribeRecording() {
		const audioChunks = audioChunksRef.current;

		if (audioChunks.length === 0) {
			setSpeechError("No audio was recorded.");
			return;
		}

		const audio = new Blob(audioChunks, {
			type: mediaRecorderRef.current?.mimeType || "audio/webm",
		});

		try {
			setIsTranscribing(true);
			setSpeechError(null);
			setMicrophoneDiagnostics(null);

			const response = await TranscribeAiAssistantAudio(audio);
			const transcript = response.transcript.trim();

			if (!transcript) {
				setSpeechError("Neo AI could not hear clear speech in that recording.");
				return;
			}

			setInput(transcript);
		} catch (error) {
			setSpeechError(
				error instanceof Error
					? error.message
					: "Neo AI could not transcribe that recording.",
			);
		} finally {
			setIsTranscribing(false);
			audioChunksRef.current = [];
		}
	}

	function toggleVoiceReply() {
		if (!isSpeechSynthesisSupported) {
			setSpeechError("Voice replies are not supported in this browser.");
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
		isListening,
		isSpeechRecognitionSupported,
		isSpeechSynthesisSupported,
		isTranscribing,
		isVoiceReplyEnabled,
		microphoneDiagnostics,
		speechError,
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

			if (rms > RecordingSilenceRmsThreshold) {
				lastAudibleAtRef.current = now;
			}

			const isPastGracePeriod =
				now - recordingStartedAtRef.current > RecordingInitialGraceMs;
			const isSilentLongEnough =
				now - lastAudibleAtRef.current > RecordingSilenceDurationMs;
			const isTooLong =
				now - recordingStartedAtRef.current > RecordingMaxDurationMs;

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

async function requestMicrophoneAccess(): Promise<
	MicrophoneAccessResult & { stream?: MediaStream }
> {
	const baseDiagnostics = await collectMicrophoneDiagnostics();

	if (!window.isSecureContext) {
		return {
			diagnostics: baseDiagnostics,
			isAllowed: false,
			message: "Voice input needs a secure browser context. Use HTTPS or localhost.",
		};
	}

	if (!navigator.mediaDevices?.getUserMedia) {
		return {
			diagnostics: baseDiagnostics,
			isAllowed: false,
			message: "This browser does not expose microphone recording to the app.",
		};
	}

	if (baseDiagnostics.isMicrophonePolicyAllowed === false) {
		return {
			diagnostics: baseDiagnostics,
			isAllowed: false,
			message:
				"Microphone access is blocked by the page container or browser permissions policy.",
		};
	}

	try {
		const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		return { diagnostics: baseDiagnostics, isAllowed: true, stream };
	} catch (error) {
		const diagnostics = {
			...baseDiagnostics,
			errorName: error instanceof DOMException ? error.name : "Unknown",
		};

		console.info("Neo AI microphone access failed", diagnostics);

		return {
			diagnostics,
			isAllowed: false,
			message: GetMicrophoneAccessErrorMessage(error, diagnostics),
		};
	}
}

function getSupportedRecordingMimeType() {
	const mimeTypes = [
		"audio/webm;codecs=opus",
		"audio/webm",
		"audio/ogg;codecs=opus",
		"audio/ogg",
	];

	return mimeTypes.find((mimeType) => MediaRecorder.isTypeSupported(mimeType));
}

function GetMicrophoneAccessErrorMessage(
	error: unknown,
	diagnostics: MicrophoneDiagnostics,
) {
	if (!(error instanceof DOMException)) {
		return "Microphone access is blocked. Allow microphone permission for this site, then try again.";
	}

	switch (error.name) {
		case "NotAllowedError":
		case "PermissionDeniedError":
			return diagnostics.permissionState === "denied"
				? "The browser still reports microphone permission as blocked for this site. Reset the site permission or open the app in a regular Chrome/Edge tab."
				: "Microphone permission was denied or blocked. Check the browser site settings for this page.";
		case "NotFoundError":
		case "DevicesNotFoundError":
			return "No microphone was found on this device.";
		case "NotReadableError":
		case "TrackStartError":
			return "The microphone is already in use by another app.";
		case "SecurityError":
			return "Microphone access is blocked by browser security or embedded app settings.";
		default:
			return "Microphone access is blocked. Allow microphone permission for this site, then try again.";
	}
}

async function collectMicrophoneDiagnostics(): Promise<MicrophoneDiagnostics> {
	const [permissionState, deviceSummary] = await Promise.all([
		readMicrophonePermissionState(),
		readMicrophoneDeviceSummary(),
	]);

	return {
		deviceSummary,
		errorName: null,
		hasGetUserMedia: Boolean(navigator.mediaDevices?.getUserMedia),
		isEmbedded: window.top !== window.self,
		isMicrophonePolicyAllowed: readMicrophonePolicyAllowed(),
		isSecureContext: window.isSecureContext,
		permissionState,
	};
}

async function readMicrophonePermissionState() {
	if (!navigator.permissions?.query) {
		return null;
	}

	try {
		const status = await navigator.permissions.query({
			name: "microphone" as PermissionName,
		});

		return status.state;
	} catch {
		return null;
	}
}

async function readMicrophoneDeviceSummary() {
	if (!navigator.mediaDevices?.enumerateDevices) {
		return "unavailable";
	}

	try {
		const devices = await navigator.mediaDevices.enumerateDevices();
		const audioInputs = devices.filter((device) => device.kind === "audioinput");

		if (audioInputs.length === 0) {
			return "no audio input found";
		}

		const hasLabels = audioInputs.some((device) => device.label.trim().length > 0);

		return `${audioInputs.length} audio input${audioInputs.length === 1 ? "" : "s"}${hasLabels ? " visible" : " hidden until permission"}`;
	} catch (error) {
		return error instanceof DOMException ? error.name : "read failed";
	}
}

function readMicrophonePolicyAllowed() {
	const documentWithPolicy = document as Document & {
		featurePolicy?: {
			allowsFeature: (feature: string) => boolean;
		};
		permissionsPolicy?: {
			allowsFeature: (feature: string) => boolean;
		};
	};

	try {
		return (
			documentWithPolicy.permissionsPolicy?.allowsFeature("microphone") ??
			documentWithPolicy.featurePolicy?.allowsFeature("microphone") ??
			null
		);
	} catch {
		return null;
	}
}
