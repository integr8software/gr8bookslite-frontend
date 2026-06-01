"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AiAssistantFallbackErrorMessage } from "@/app/src/constants/shared/ai-assistant/AiAssistantConstants";
import {
	LoadAiAssistantChatMessages,
	LoadAiAssistantChatOpenState,
	SaveAiAssistantChatMessages,
	SaveAiAssistantChatOpenState,
} from "@/app/src/data/shared/ai-assistant/AiAssistantData";
import { SendAiAssistantMessage } from "@/app/src/services/shared/ai-assistant/AiAssistantApi";
import type {
	AiAssistantAction,
	AiAssistantChatMessage,
} from "@/app/src/types/shared/ai-assistant/AiAssistantTypes";

export function useAiAssistantChat() {
	const router = useRouter();
	const pathname = usePathname();
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [isOpen, setIsOpen] = useState(() => LoadAiAssistantChatOpenState());
	const [input, setInput] = useState("");
	const [isSending, setIsSending] = useState(false);
	const [messages, setMessages] = useState<AiAssistantChatMessage[]>(() =>
		LoadAiAssistantChatMessages(),
	);
	const latestAssistantMessage = useMemo(
		() => messages.findLast((message) => message.role === "assistant"),
		[messages],
	);

	useEffect(() => {
		SaveAiAssistantChatMessages(messages);
	}, [messages]);

	useEffect(() => {
		SaveAiAssistantChatOpenState(isOpen);
	}, [isOpen]);

	function openChat() {
		setIsOpen(true);
		window.setTimeout(() => inputRef.current?.focus(), 50);
	}

	function closeChat() {
		setIsOpen(false);
	}

	async function submitMessage(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const nextInput = input.trim();

		if (!nextInput || isSending) {
			return;
		}

		const nextMessages: AiAssistantChatMessage[] = [
			...messages,
			{ role: "user", content: nextInput },
		];

		setMessages(nextMessages);
		setInput("");
		setIsSending(true);

		try {
			const response = await SendAiAssistantMessage({
				currentPath: pathname,
				history: messages,
				message: nextInput,
			});

			setMessages((current) => [
				...current,
				{ role: "assistant", content: response.message },
			]);
			handleAction(response.action);
		} catch (error) {
			setMessages((current) => [
				...current,
				{
					role: "assistant",
					content:
						error instanceof Error
							? error.message
							: AiAssistantFallbackErrorMessage,
				},
			]);
		} finally {
			setIsSending(false);
		}
	}

	function handleAction(action: AiAssistantAction | null) {
		if (!action) {
			return;
		}

		if (action.type === "navigate") {
			window.dispatchEvent(new Event("gr8books:navigation-start"));
			router.push(action.route);
			return;
		}
	}

	return {
		closeChat,
		input,
		inputRef,
		isOpen,
		isSending,
		latestAssistantMessage,
		messages,
		openChat,
		setInput,
		submitMessage,
	};
}
