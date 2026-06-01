"use client";

import Image from "next/image";
import { Loader2, Send, X } from "lucide-react";
import {
	AiAssistantInputPlaceholder,
	AiAssistantLogoSrc,
	AiAssistantName,
	AiAssistantSubtitle,
} from "@/app/src/constants/shared/ai-assistant/AiAssistantConstants";
import { useAiAssistantChat } from "@/app/src/hooks/shared/ai-assistant/useAiAssistantChat";

export function AiAssistantChat() {
	const {
		closeChat,
		input,
		inputRef,
		isOpen,
		isSending,
		messages,
		openChat,
		setInput,
		submitMessage,
	} = useAiAssistantChat();

	if (!isOpen) {
		return <AiAssistantLauncherButton onClick={openChat} />;
	}

	return (
		<>
			<section
				aria-label="AI assistant"
				className="neo-ai-panel fixed bottom-20 right-4 z-60 flex h-[min(28rem,calc(100dvh-7rem))] w-[min(25rem,calc(100vw-2rem))] flex-col rounded-lg border border-skyblue/35 bg-white shadow-[0_24px_80px_rgba(33,39,56,0.22)] sm:bottom-5 sm:right-[5.25rem] sm:h-[min(32rem,calc(100dvh-4rem))] sm:w-[min(25rem,calc(100vw-7rem))]"
			>
				<div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg">
					<header className="flex min-h-14 items-center justify-between border-b border-skyblue/20 px-4">
						<div className="flex min-w-0 items-center gap-3">
							<span className="inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-skyblue/35 bg-skyblue/10">
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
								<h2 className="truncate text-sm font-semibold text-darknavy">
									{AiAssistantName}
								</h2>
								<p className="truncate text-xs text-darknavy/55">
									{AiAssistantSubtitle}
								</p>
							</div>
						</div>
						<button
							type="button"
							onClick={closeChat}
							aria-label={`Close ${AiAssistantName}`}
							className="inline-flex h-9 w-9 items-center justify-center rounded-md text-darknavy/55 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
						>
							<X className="h-4.5 w-4.5" aria-hidden="true" />
						</button>
					</header>

					<div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
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
											? "theme-accent-contrast-text max-w-[85%] rounded-lg bg-skyblue px-3 py-2 text-sm leading-5 shadow-[0_8px_22px_rgba(87,196,229,0.22)]"
											: "max-w-[85%] rounded-lg border border-skyblue/20 bg-skyblue/10 px-3 py-2 text-sm leading-5 text-darknavy"
									}
								>
									{message.content}
								</p>
							</div>
						))}
						{isSending ? (
							<div className="flex justify-start">
								<p className="inline-flex items-center gap-2 rounded-lg border border-skyblue/20 bg-skyblue/10 px-3 py-2 text-sm text-darknavy/65">
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
						className="border-t border-skyblue/20 p-3"
					>
						<div className="flex items-center gap-2">
							<input
								ref={inputRef}
								value={input}
								onChange={(event) =>
									setInput(event.target.value)
								}
								placeholder={AiAssistantInputPlaceholder}
								className="min-h-10 min-w-0 flex-1 rounded-md border border-skyblue/35 px-3 text-sm text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20"
							/>
							<button
								type="submit"
								disabled={isSending || !input.trim()}
								aria-label="Send message"
								className="theme-accent-contrast-text inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-skyblue transition hover:bg-skyblue/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/50 disabled:cursor-not-allowed disabled:opacity-45"
							>
								<Send
									className="h-4.5 w-4.5"
									aria-hidden="true"
								/>
							</button>
						</div>
					</form>
				</div>
			</section>
			<AiAssistantLauncherButton onClick={closeChat} />
		</>
	);
}

function AiAssistantLauncherButton({ onClick }: { onClick: () => void }) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={`Open ${AiAssistantName}`}
			className="neo-ai-launcher fixed bottom-4 right-4 z-60 inline-flex h-13 w-13 items-center justify-center overflow-hidden rounded-full border-2 border-skyblue bg-white shadow-[0_18px_45px_rgba(33,39,56,0.22)] transition hover:border-skyblue/70 hover:bg-skyblue/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/50"
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
