"use client";

import {
	Check,
	ChevronDown,
	Mic,
	MicOff,
	RadioTower,
	type LucideIcon,
} from "lucide-react";
import { AiAssistantVoiceModeOptions } from "@/app/src/constants/shared/ai-assistant/AiAssistantConstants";
import { useAiAssistantVoiceControls } from "@/app/src/hooks/shared/ai-assistant/useAiAssistantVoiceControls";
import type { AiAssistantSpeechControls } from "@/app/src/types/shared/ai-assistant/AiAssistantTypes";

type AiAssistantVoiceControlProps = {
	isSending: boolean;
	speech: AiAssistantSpeechControls;
};

export function AiAssistantVoiceControl({
	isSending,
	speech,
}: AiAssistantVoiceControlProps) {
	const {
		containerRef,
		isMenuOpen,
		primaryLabel,
		primaryTitle,
		runSelectedMode,
		selectMode,
		selectedMode,
		toggleMenu,
	} = useAiAssistantVoiceControls(speech);

	return (
		<div ref={containerRef} className="relative shrink-0">
			<div className="inline-flex h-10 overflow-hidden rounded-md border border-[color-mix(in_srgb,var(--skyblue)_24%,transparent)]">
				<button
					type="button"
					onClick={runSelectedMode}
					disabled={
						!speech.isSpeechRecognitionSupported ||
						isSending ||
						speech.isTranscribing
					}
					aria-label={primaryLabel}
					title={primaryTitle}
					className="inline-flex h-full w-9 items-center justify-center text-[color-mix(in_srgb,var(--foreground)_66%,transparent)] transition hover:bg-[color-mix(in_srgb,var(--skyblue)_12%,transparent)] hover:text-[var(--foreground)] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35 disabled:cursor-not-allowed disabled:opacity-40"
				>
					<AiAssistantVoiceTriggerIcon speech={speech} />
				</button>
				<button
					type="button"
					onClick={toggleMenu}
					disabled={!speech.isSpeechRecognitionSupported}
					aria-expanded={isMenuOpen}
					aria-haspopup="menu"
					aria-label="Choose voice input mode"
					title="Choose voice input mode"
					className="inline-flex h-full w-5.5 items-center justify-center border-l border-[color-mix(in_srgb,var(--skyblue)_18%,transparent)] text-[color-mix(in_srgb,var(--foreground)_58%,transparent)] transition hover:bg-[color-mix(in_srgb,var(--skyblue)_12%,transparent)] hover:text-[var(--foreground)] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35 disabled:cursor-not-allowed disabled:opacity-40"
				>
					<ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
				</button>
			</div>
			{isMenuOpen ? (
				<div
					role="menu"
					className="absolute bottom-11 right-0 z-[80] grid w-36 gap-1 rounded-lg border border-[color-mix(in_srgb,var(--skyblue)_24%,transparent)] bg-[var(--background)] p-1.5 text-left shadow-[0_18px_46px_rgba(33,39,56,0.18)]"
				>
					{AiAssistantVoiceModeOptions.map((option) => (
						<VoiceModeMenuItem
							key={option.value}
							icon={option.value === "auto" ? RadioTower : Mic}
							isSelected={selectedMode === option.value}
							label={option.label}
							onClick={() => selectMode(option.value)}
						/>
					))}
				</div>
			) : null}
		</div>
	);
}

function AiAssistantVoiceTriggerIcon({
	speech,
}: {
	speech: AiAssistantSpeechControls;
}) {
	if (speech.isAutomaticModeEnabled) {
		return <RadioTower className="h-4 w-4 text-skyblue" aria-hidden="true" />;
	}

	if (speech.isListening) {
		return <MicOff className="h-4 w-4 text-red-600" aria-hidden="true" />;
	}

	return <Mic className="h-4 w-4" aria-hidden="true" />;
}

function VoiceModeMenuItem({
	icon: Icon,
	isSelected,
	label,
	onClick,
}: {
	icon: LucideIcon;
	isSelected: boolean;
	label: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			role="menuitemradio"
			aria-checked={isSelected}
			onClick={onClick}
			className="flex min-h-9 w-full items-center gap-2 rounded-md px-2.5 text-left text-sm font-semibold text-[color-mix(in_srgb,var(--foreground)_76%,transparent)] transition hover:bg-[color-mix(in_srgb,var(--skyblue)_12%,transparent)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
		>
			<Icon
				className="h-4 w-4 shrink-0 text-[color-mix(in_srgb,var(--foreground)_52%,transparent)]"
				aria-hidden="true"
			/>
			<span className="min-w-0 flex-1">{label}</span>
			{isSelected ? (
				<Check className="h-4 w-4 shrink-0 text-skyblue" aria-hidden="true" />
			) : null}
		</button>
	);
}
