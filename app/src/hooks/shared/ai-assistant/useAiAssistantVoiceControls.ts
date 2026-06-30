"use client";

import { useEffect, useRef, useState } from "react";
import type {
	AiAssistantSpeechControls,
	AiAssistantVoiceInputMode,
} from "@/app/src/types/shared/ai-assistant/AiAssistantTypes";

export function useAiAssistantVoiceControls(
	speech: AiAssistantSpeechControls,
) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [selectedMode, setSelectedMode] =
		useState<AiAssistantVoiceInputMode>("manual");
	const effectiveMode = speech.isAutomaticModeEnabled ? "auto" : selectedMode;
	const primaryLabel = getVoicePrimaryLabel(effectiveMode, speech);
	const primaryTitle = getVoicePrimaryTitle(effectiveMode, speech);

	useEffect(() => {
		if (!isMenuOpen) {
			return;
		}

		function handlePointerDown(event: PointerEvent) {
			const target = event.target as Node;

			if (containerRef.current?.contains(target)) {
				return;
			}

			setIsMenuOpen(false);
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setIsMenuOpen(false);
			}
		}

		document.addEventListener("pointerdown", handlePointerDown);
		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isMenuOpen]);

	function toggleMenu() {
		setIsMenuOpen((current) => !current);
	}

	function runSelectedMode() {
		if (effectiveMode === "auto") {
			speech.toggleAutomaticMode();
			return;
		}

		speech.toggleListening();
	}

	function selectMode(mode: AiAssistantVoiceInputMode) {
		setSelectedMode(mode);
		setIsMenuOpen(false);

		if (mode === "manual" && speech.isAutomaticModeEnabled) {
			speech.toggleAutomaticMode();
			return;
		}

		if (mode === "auto" && !speech.isAutomaticModeEnabled) {
			speech.toggleAutomaticMode();
		}
	}

	return {
		containerRef,
		isMenuOpen,
		primaryLabel,
		primaryTitle,
		runSelectedMode,
		selectMode,
		selectedMode: effectiveMode,
		toggleMenu,
	};
}

function getVoicePrimaryLabel(
	mode: AiAssistantVoiceInputMode,
	speech: AiAssistantSpeechControls,
) {
	if (mode === "auto") {
		return speech.isAutomaticModeEnabled
			? "Turn off automatic voice mode"
			: "Turn on automatic voice mode";
	}

	return speech.isListening ? "Stop recording" : "Start recording";
}

function getVoicePrimaryTitle(
	mode: AiAssistantVoiceInputMode,
	speech: AiAssistantSpeechControls,
) {
	if (mode === "auto") {
		return speech.isNativeSpeechRecognitionSupported
			? "Automatic voice mode"
			: "Automatic voice mode with recorded transcription";
	}

	return "Record voice";
}
