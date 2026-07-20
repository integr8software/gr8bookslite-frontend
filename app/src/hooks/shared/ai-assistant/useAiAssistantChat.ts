"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
	AiAssistantFallbackErrorMessage,
	AiAssistantChatInputFocusDelayMs,
	AiAssistantChatScrollBottomThresholdPx,
	AiAssistantNavigationStartEvent,
	AiAssistantTermManagementActionEvent,
} from "@/app/src/constants/shared/ai-assistant/AiAssistantConstants";
import {
	LoadAiAssistantChatMessages,
	LoadAiAssistantChatOpenState,
	SaveAiAssistantChatMessages,
	SaveAiAssistantChatOpenState,
	SaveAiAssistantPurchaseRequestPrefill,
	SaveAiAssistantTermManagementPendingAction,
} from "@/app/src/data/shared/ai-assistant/AiAssistantData";
import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
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
		window.setTimeout(
			() => inputRef.current?.focus(),
			AiAssistantChatInputFocusDelayMs,
		);
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

		await submitMessageText(nextInput);
	}

	async function submitMessageText(message: string) {
		const nextInput = message.trim();

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
			window.dispatchEvent(new Event(AiAssistantNavigationStartEvent));
			router.push(action.route);
			return;
		}

		if (action.type === "open_form") {
			if (action.target === "purchase_request" && action.prefill) {
				SaveAiAssistantPurchaseRequestPrefill(action.prefill);
			}

			window.dispatchEvent(new Event(AiAssistantNavigationStartEvent));
			router.push(action.route);
			return;
		}

		if (action.type === "term_management") {
			const route = getModuleRoute(action.moduleCode);

			SaveAiAssistantTermManagementPendingAction(action);

			if (pathname === route) {
				window.dispatchEvent(
					new CustomEvent(AiAssistantTermManagementActionEvent, {
						detail: action,
					}),
				);
				return;
			}

			window.dispatchEvent(new Event(AiAssistantNavigationStartEvent));
			router.push(route);
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
		submitMessageText,
	};
}

function getMaxScrollTop(element: HTMLDivElement) {
	return Math.max(0, element.scrollHeight - element.clientHeight);
}

function isScrolledNearBottom(element: HTMLDivElement) {
	return (
		getMaxScrollTop(element) - element.scrollTop <=
		AiAssistantChatScrollBottomThresholdPx
	);
}
