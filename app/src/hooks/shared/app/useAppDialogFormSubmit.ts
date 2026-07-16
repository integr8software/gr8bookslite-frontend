"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseAppDialogFormSubmitOptions = {
	formId: string;
	isDialogOpen: boolean;
	isSubmitting: boolean;
	isContainerOpen?: boolean;
	onDialogOpenChange: (isOpen: boolean) => void;
};

export function useAppDialogFormSubmit({
	formId,
	isDialogOpen,
	isSubmitting,
	isContainerOpen = true,
	onDialogOpenChange,
}: UseAppDialogFormSubmitOptions) {
	const [isConfirmSubmitPending, setIsConfirmSubmitPending] = useState(false);
	const hasSeenSubmittingRef = useRef(false);
	const fallbackTimerRef = useRef<number | null>(null);

	const clearFallbackTimer = useCallback(() => {
		if (fallbackTimerRef.current === null) {
			return;
		}

		window.clearTimeout(fallbackTimerRef.current);
		fallbackTimerRef.current = null;
	}, []);

	useEffect(() => {
		if (!isContainerOpen) {
			clearFallbackTimer();
			hasSeenSubmittingRef.current = false;
			queueMicrotask(() => {
				setIsConfirmSubmitPending(false);
				if (isDialogOpen) {
					onDialogOpenChange(false);
				}
			});
			return;
		}

		if (!isDialogOpen) {
			clearFallbackTimer();
			hasSeenSubmittingRef.current = false;
			queueMicrotask(() => setIsConfirmSubmitPending(false));
			return;
		}

		if (isSubmitting) {
			clearFallbackTimer();
			hasSeenSubmittingRef.current = true;
			queueMicrotask(() => setIsConfirmSubmitPending(true));
			return;
		}

		if (hasSeenSubmittingRef.current) {
			clearFallbackTimer();
			hasSeenSubmittingRef.current = false;
			queueMicrotask(() => {
				setIsConfirmSubmitPending(false);
				onDialogOpenChange(false);
			});
		}
	}, [
		clearFallbackTimer,
		isContainerOpen,
		isDialogOpen,
		isSubmitting,
		onDialogOpenChange,
	]);

	useEffect(() => {
		return clearFallbackTimer;
	}, [clearFallbackTimer]);

	const submitFromDialog = useCallback(() => {
		setIsConfirmSubmitPending(true);
		const form = document.getElementById(formId);

		if (form instanceof HTMLFormElement) {
			form.requestSubmit();
			clearFallbackTimer();
			fallbackTimerRef.current = window.setTimeout(() => {
				if (!hasSeenSubmittingRef.current) {
					setIsConfirmSubmitPending(false);
					onDialogOpenChange(false);
				}
			}, 700);
			return;
		}

		setIsConfirmSubmitPending(false);
	}, [clearFallbackTimer, formId, onDialogOpenChange]);

	const closeDialog = useCallback(() => {
		if (isSubmitting || isConfirmSubmitPending) {
			return;
		}

		onDialogOpenChange(false);
	}, [isConfirmSubmitPending, isSubmitting, onDialogOpenChange]);

	return {
		closeDialog,
		isConfirmSubmitPending: isSubmitting || isConfirmSubmitPending,
		submitFromDialog,
	};
}
