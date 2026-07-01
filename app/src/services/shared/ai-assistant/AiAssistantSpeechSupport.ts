import type { AiAssistantSpeechInputProvider } from "@/app/src/types/shared/ai-assistant/AiAssistantTypes";

export type BrowserSpeechRecognitionAlternative = {
	confidence: number;
	transcript: string;
};

export type BrowserSpeechRecognitionResult = {
	isFinal: boolean;
	[index: number]: BrowserSpeechRecognitionAlternative;
};

export type BrowserSpeechRecognitionResultList = {
	length: number;
	[index: number]: BrowserSpeechRecognitionResult;
};

export type BrowserSpeechRecognitionEvent = Event & {
	resultIndex: number;
	results: BrowserSpeechRecognitionResultList;
};

export type BrowserSpeechRecognitionErrorEvent = Event & {
	error: string;
	message?: string;
};

export type BrowserSpeechRecognition = {
	continuous: boolean;
	interimResults: boolean;
	lang: string;
	maxAlternatives: number;
	abort: () => void;
	start: () => void;
	stop: () => void;
	onend: (() => void) | null;
	onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null;
	onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
};

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

declare global {
	interface Window {
		SpeechRecognition?: BrowserSpeechRecognitionConstructor;
		webkitAudioContext?: typeof AudioContext;
		webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
	}
}

export type MicrophoneDiagnostics = {
	deviceSummary: string;
	errorName: string | null;
	hasGetUserMedia: boolean;
	isEmbedded: boolean;
	isMicrophonePolicyAllowed: boolean | null;
	isSecureContext: boolean;
	permissionState: PermissionState | null;
};

type MicrophoneAccessResult = {
	diagnostics?: MicrophoneDiagnostics;
	isAllowed: boolean;
	message?: string;
};

export async function requestMicrophoneAccess(): Promise<
	MicrophoneAccessResult & { stream?: MediaStream }
> {
	const baseDiagnostics = await collectMicrophoneDiagnostics();

	if (!window.isSecureContext) {
		return {
			diagnostics: baseDiagnostics,
			isAllowed: false,
			message:
				"Voice input needs a secure browser context. Use HTTPS or localhost.",
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
			message: getMicrophoneAccessErrorMessage(error, diagnostics),
		};
	}
}

export function getSpeechInputProvider(): AiAssistantSpeechInputProvider | null {
	if (hasNativeSpeechRecognition()) {
		return "native";
	}

	if (hasMediaRecorder()) {
		return "recording";
	}

	return null;
}

export function getSpeechRecognitionConstructor() {
	if (typeof window === "undefined") {
		return null;
	}

	return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

export function hasNativeSpeechRecognition() {
	return Boolean(getSpeechRecognitionConstructor());
}

export function hasMediaRecorder() {
	return typeof window === "undefined" ? false : Boolean(window.MediaRecorder);
}

export function getSupportedRecordingMimeType() {
	const mimeTypes = [
		"audio/webm;codecs=opus",
		"audio/webm",
		"audio/ogg;codecs=opus",
		"audio/ogg",
	];

	return mimeTypes.find((mimeType) => MediaRecorder.isTypeSupported(mimeType));
}

export function getNativeSpeechRecognitionErrorMessage(
	error: BrowserSpeechRecognitionErrorEvent,
) {
	switch (error.error) {
		case "not-allowed":
		case "service-not-allowed":
			return "Microphone or speech recognition permission is blocked for this site.";
		case "audio-capture":
			return "No microphone was found on this device.";
		case "network":
			return "Browser speech recognition is unavailable right now. Try again or use recorded voice input.";
		case "no-speech":
			return "Neo AI could not hear clear speech.";
		default:
			return error.message || "Neo AI could not recognize that speech.";
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

function getMicrophoneAccessErrorMessage(
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
		const audioInputs = devices.filter(
			(device) => device.kind === "audioinput",
		);

		if (audioInputs.length === 0) {
			return "no audio input found";
		}

		const hasLabels = audioInputs.some(
			(device) => device.label.trim().length > 0,
		);

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
