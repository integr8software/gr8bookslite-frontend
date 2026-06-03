"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
	AiAssistantFallbackErrorMessage,
	AiAssistantPurchaseRequestPrefillStorageKey,
} from "@/app/src/constants/shared/ai-assistant/AiAssistantConstants";
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
	const messagesContainerRef = useRef<HTMLDivElement | null>(null);
	const savedScrollTopRef = useRef(0);
	const shouldStickToBottomRef = useRef(true);
	const [isOpen, setIsOpen] = useState(() => LoadAiAssistantChatOpenState());
	const [input, setInput] = useState("");
	const [isSending, setIsSending] = useState(false);
	const [messages, setMessages] = useState<AiAssistantChatMessage[]>(() =>
		LoadAiAssistantChatMessages(),
	);

	useEffect(() => {
		SaveAiAssistantChatMessages(messages);
	}, [messages]);

	useEffect(() => {
		SaveAiAssistantChatOpenState(isOpen);
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		window.requestAnimationFrame(() => {
			const messagesContainer = messagesContainerRef.current;

			if (!messagesContainer) {
				return;
			}

			messagesContainer.scrollTop = Math.min(
				savedScrollTopRef.current,
				getMaxScrollTop(messagesContainer),
			);
		});
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen || !shouldStickToBottomRef.current) {
			return;
		}

		window.requestAnimationFrame(() => {
			const messagesContainer = messagesContainerRef.current;

			if (!messagesContainer) {
				return;
			}

			messagesContainer.scrollTop = messagesContainer.scrollHeight;
			saveMessagesScroll(messagesContainer);
		});
	}, [isOpen, isSending, messages.length]);

	function openChat() {
		setIsOpen(true);
		window.setTimeout(() => inputRef.current?.focus(), 50);
	}

	function closeChat() {
		const messagesContainer = messagesContainerRef.current;

		if (messagesContainer) {
			saveMessagesScroll(messagesContainer);
		}

		setIsOpen(false);
	}

	function saveMessagesScroll(messagesContainer: HTMLDivElement) {
		savedScrollTopRef.current = messagesContainer.scrollTop;
		shouldStickToBottomRef.current = isScrolledNearBottom(messagesContainer);
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

		if (action.type === "open_form") {
			if (action.target === "purchase_request" && action.prefill) {
				window.localStorage.setItem(
					AiAssistantPurchaseRequestPrefillStorageKey,
					JSON.stringify(action.prefill),
				);
			}

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
		messages,
		messagesContainerRef,
		openChat,
		saveMessagesScroll,
		setInput,
		submitMessage,
	};
}

function getMaxScrollTop(element: HTMLDivElement) {
	return Math.max(0, element.scrollHeight - element.clientHeight);
}

function isScrolledNearBottom(element: HTMLDivElement) {
	return getMaxScrollTop(element) - element.scrollTop <= 24;
}
