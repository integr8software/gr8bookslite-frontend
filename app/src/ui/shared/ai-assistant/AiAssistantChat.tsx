"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, Menu, SendHorizontal, X } from "lucide-react";
import {
	AiAssistantInputPlaceholder,
	AiAssistantLogoSrc,
	AiAssistantName,
	AiAssistantSubtitle,
} from "@/app/src/constants/shared/ai-assistant/AiAssistantConstants";
import { useAiAssistantChat } from "@/app/src/hooks/shared/ai-assistant/useAiAssistantChat";

export function AiAssistantChat() {
	const moduleDrawerAssistant = useModuleDrawerAssistant();
	const {
		closeChat,
		input,
		inputRef,
		isOpen,
		isSending,
		messages,
		messagesContainerRef,
		openChat,
		saveMessagesScroll,
		setInput,
		submitMessage,
	} = useAiAssistantChat();
	const isModuleDrawerOpen = moduleDrawerAssistant.isOpen;
	const panelClassName = isModuleDrawerOpen
		? "neo-ai-panel neo-ai-panel-drawer fixed z-70 flex flex-col rounded-lg bg-[var(--background)] text-[var(--foreground)] shadow-[0_24px_80px_rgba(0,0,0,0.24)]"
		: "neo-ai-panel fixed bottom-20 right-4 z-60 flex h-[min(28rem,calc(100dvh-7rem))] w-[min(25rem,calc(100vw-2rem))] flex-col rounded-lg bg-[var(--background)] text-[var(--foreground)] shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:bottom-4 sm:right-[6.5rem] sm:h-[min(32rem,calc(100dvh-4rem))] sm:w-[min(25rem,calc(100vw-8.5rem))]";

	if (isModuleDrawerOpen && !isOpen) {
		return (
			<AiAssistantDrawerLauncherButton
				style={moduleDrawerAssistant.launcherStyle}
				onClick={openChat}
			/>
		);
	}

	if (!isOpen) {
		return <AiAssistantLauncherButton onClick={openChat} />;
	}

	return (
		<>
			<section
				aria-label="AI assistant"
				className={panelClassName}
				style={
					isModuleDrawerOpen
						? moduleDrawerAssistant.panelStyle
						: undefined
				}
			>
				<div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg">
					<header className="flex min-h-14 items-center justify-between border-b border-[color-mix(in_srgb,var(--skyblue)_24%,transparent)] px-4">
						<div className="flex min-w-0 items-center gap-3">
							<span className="inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[color-mix(in_srgb,var(--skyblue)_38%,transparent)] bg-[color-mix(in_srgb,var(--skyblue)_12%,var(--background))]">
								<Image
									src={AiAssistantLogoSrc}
									alt=""
									width={30}
									height={30}
									aria-hidden="true"
									className="h-7.5 w-7.5 object-contain"
								/>
							</span>
							<div className="min-w-0">
								<h2 className="truncate text-sm font-semibold text-[var(--foreground)]">
									{AiAssistantName}
								</h2>
								<p className="truncate text-xs text-[color-mix(in_srgb,var(--foreground)_58%,transparent)]">
									{AiAssistantSubtitle}
								</p>
							</div>
						</div>
						<button
							type="button"
							onClick={closeChat}
							aria-label={`Close ${AiAssistantName}`}
							className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[color-mix(in_srgb,var(--foreground)_58%,transparent)] transition hover:bg-[color-mix(in_srgb,var(--skyblue)_12%,transparent)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
						>
							<X className="h-4.5 w-4.5" aria-hidden="true" />
						</button>
					</header>

					<div
						ref={messagesContainerRef}
						onScroll={(event) => saveMessagesScroll(event.currentTarget)}
						className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
					>
						{messages.map((message, index) => (
							<div
								key={`${message.role}-${index}`}
								className={
									message.role === "user"
										? "flex justify-end"
										: "flex justify-start"
								}
							>
								<p
									className={
										message.role === "user"
											? "theme-accent-contrast-text max-w-[85%] rounded-lg bg-skyblue px-3 py-2 text-sm leading-5"
											: "max-w-[85%] rounded-lg border border-[color-mix(in_srgb,var(--skyblue)_24%,transparent)] bg-[color-mix(in_srgb,var(--skyblue)_10%,var(--background))] px-3 py-2 text-sm leading-5 text-[var(--foreground)]"
									}
								>
									{message.content}
								</p>
							</div>
						))}
						{isSending ? (
							<div className="flex justify-start">
								<p className="inline-flex items-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--skyblue)_24%,transparent)] bg-[color-mix(in_srgb,var(--skyblue)_10%,var(--background))] px-3 py-2 text-sm text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
									<Loader2
										className="h-4 w-4 animate-spin text-skyblue"
										aria-hidden="true"
									/>
									Thinking
								</p>
							</div>
						) : null}
					</div>

					<form
						onSubmit={submitMessage}
						className="border-t border-[color-mix(in_srgb,var(--skyblue)_24%,transparent)] p-3"
					>
						<div className="flex items-center gap-2">
							<input
								ref={inputRef}
								value={input}
								onChange={(event) => setInput(event.target.value)}
								placeholder={AiAssistantInputPlaceholder}
								className="app-theme-field min-h-10 min-w-0 flex-1 rounded-md border px-3 text-sm outline-none transition focus:border-skyblue focus:ring-2 focus:ring-skyblue/20"
							/>
							<button
								type="submit"
								disabled={isSending || !input.trim()}
								aria-label="Send message"
								className="theme-accent-contrast-text inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-skyblue transition hover:bg-skyblue/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/50 disabled:cursor-not-allowed disabled:opacity-45"
							>
								<SendHorizontal className="h-4.5 w-4.5" aria-hidden="true" />
							</button>
						</div>
					</form>
				</div>
			</section>
			{isModuleDrawerOpen ? (
				<AiAssistantDrawerLauncherButton
					isOpen
					style={moduleDrawerAssistant.launcherStyle}
					onClick={closeChat}
				/>
			) : (
				<AiAssistantLauncherButton
					ariaLabel={`Close ${AiAssistantName}`}
					isOpen
					onClick={closeChat}
				/>
			)}
		</>
	);
}

function useModuleDrawerAssistant() {
	const [assistantState, setAssistantState] = useState<{
		isOpen: boolean;
		launcherStyle: CSSProperties | undefined;
		panelStyle: CSSProperties | undefined;
	}>({
		isOpen: false,
		launcherStyle: undefined,
		panelStyle: undefined,
	});

	useEffect(() => {
		function syncModuleDrawerState() {
			const drawer = document.querySelector<HTMLElement>(
				"[data-module-drawer='true']",
			);

			if (!drawer) {
				setAssistantState({
					isOpen: false,
					launcherStyle: undefined,
					panelStyle: undefined,
				});
				return;
			}

			const rect = drawer.getBoundingClientRect();
			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;
			const panelWidth = Math.min(360, Math.max(288, viewportWidth - 32));
			const panelHeight = Math.min(448, Math.max(320, viewportHeight - 112));
			const gap = 12;
			const hasSpaceBesideDrawer = rect.left >= panelWidth + gap + 16;
			const panelLeft = hasSpaceBesideDrawer
				? rect.left - panelWidth - gap
				: 16;
			const panelTop = Math.max(
				16,
				Math.min(rect.top + 72, viewportHeight - panelHeight - 16),
			);
			const launcherLeft = hasSpaceBesideDrawer
				? rect.left - 46
				: Math.max(16, rect.left + 16);

			setAssistantState({
				isOpen: true,
				launcherStyle: {
					left: `${Math.round(launcherLeft)}px`,
					top: `${Math.round(rect.top + 88)}px`,
				},
				panelStyle: {
					height: `${Math.round(panelHeight)}px`,
					left: `${Math.round(panelLeft)}px`,
					top: `${Math.round(panelTop)}px`,
					width: `${Math.round(panelWidth)}px`,
				},
			});
		}

		syncModuleDrawerState();

		const observer = new MutationObserver(syncModuleDrawerState);
		observer.observe(document.body, { childList: true, subtree: true });
		window.addEventListener("resize", syncModuleDrawerState);

		return () => {
			observer.disconnect();
			window.removeEventListener("resize", syncModuleDrawerState);
		};
	}, []);

	return assistantState;
}

function AiAssistantDrawerLauncherButton({
	isOpen = false,
	onClick,
	style,
}: {
	isOpen?: boolean;
	onClick: () => void;
	style?: CSSProperties;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={`${isOpen ? "Close" : "Open"} ${AiAssistantName}`}
			className="neo-ai-drawer-launcher fixed z-70 inline-flex h-11 w-11 items-center justify-center rounded-md border border-[color-mix(in_srgb,var(--skyblue)_36%,transparent)] bg-[var(--background)] text-[var(--foreground)] shadow-[0_14px_34px_rgba(0,0,0,0.22)] transition hover:bg-[color-mix(in_srgb,var(--skyblue)_14%,var(--background))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/45"
			style={style}
		>
			<span className="relative inline-flex h-7 w-7 items-center justify-center">
				<Image
					src={AiAssistantLogoSrc}
					alt=""
					width={24}
					height={24}
					aria-hidden="true"
					className="absolute h-6 w-6 rounded-full object-contain opacity-90"
				/>
				<Menu className="relative h-4 w-4 translate-x-2 translate-y-2 text-skyblue" aria-hidden="true" />
			</span>
		</button>
	);
}

function AiAssistantLauncherButton({
	ariaLabel = `Open ${AiAssistantName}`,
	isOpen = false,
	onClick,
}: {
	ariaLabel?: string;
	isOpen?: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={ariaLabel}
			data-state={isOpen ? "open" : "closed"}
			className="neo-ai-launcher fixed bottom-4 right-4 z-60 inline-flex h-13 w-13 items-center justify-center overflow-hidden rounded-full border-2 border-skyblue bg-[var(--background)] shadow-[0_18px_45px_rgba(0,0,0,0.24)] transition hover:border-skyblue/70 hover:bg-[color-mix(in_srgb,var(--skyblue)_22%,var(--background))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/50"
		>
			<span className="inline-flex h-9 w-9 items-center justify-center rounded-full">
				<Image
					src={AiAssistantLogoSrc}
					alt=""
					width={36}
					height={36}
					aria-hidden="true"
					className="h-9 w-9 rounded-full object-contain"
				/>
			</span>
		</button>
	);
}
