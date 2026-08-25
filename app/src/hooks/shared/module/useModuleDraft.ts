"use client";

import { useCallback, useEffect, useRef } from "react";
import toast from "react-hot-toast";

type ModuleDraftEnvelope<TValues> = {
	updatedAt: number;
	values: TValues;
	version: 1;
};

type UseModuleDraftOptions<TValues> = {
	debounceMs?: number;
	enabled?: boolean;
	initialValues?: TValues;
	isDirty?: boolean;
	key: string;
	restoreValues?: (draftValues: TValues, currentValues: TValues) => TValues;
	setValues: (updater: (current: TValues) => TValues) => void;
	values: TValues;
};

export function useModuleDraft<TValues>({
	debounceMs = 600,
	enabled = true,
	initialValues,
	isDirty,
	key,
	restoreValues,
	setValues,
	values,
}: UseModuleDraftOptions<TValues>) {
	const hasLoadedDraftRef = useRef(false);
	const skipNextSaveRef = useRef(false);
	const hasShownSaveErrorRef = useRef(false);
	const saveTimeoutIdRef = useRef<number | null>(null);

	const cancelPendingSave = useCallback(() => {
		if (saveTimeoutIdRef.current === null) {
			return;
		}

		window.clearTimeout(saveTimeoutIdRef.current);
		saveTimeoutIdRef.current = null;
	}, []);

	const isFormClean = useCallback(() => {
		return (
			isDirty === false ||
			(isDirty === undefined &&
				initialValues !== undefined &&
				JSON.stringify(values) === JSON.stringify(initialValues))
		);
	}, [initialValues, isDirty, values]);

	const removeStoredDraft = useCallback(() => {
		window.localStorage.removeItem(key);
	}, [key]);

	const persistDraft = useCallback(() => {
		if (isFormClean()) {
			removeStoredDraft();
			return;
		}

		const draft: ModuleDraftEnvelope<TValues> = {
			updatedAt: Date.now(),
			values,
			version: 1,
		};

		window.localStorage.setItem(key, JSON.stringify(draft));
		hasShownSaveErrorRef.current = false;
	}, [isFormClean, key, removeStoredDraft, values]);

	useEffect(() => {
		if (!enabled || hasLoadedDraftRef.current) {
			return;
		}

		hasLoadedDraftRef.current = true;

		try {
			const storedDraft = window.localStorage.getItem(key);

			if (!storedDraft) {
				return;
			}

			const draft = JSON.parse(storedDraft) as ModuleDraftEnvelope<TValues>;

			if (!draft || draft.version !== 1 || !draft.values) {
				return;
			}

			if (
				initialValues !== undefined &&
				JSON.stringify(draft.values) === JSON.stringify(initialValues)
			) {
				window.localStorage.removeItem(key);
				return;
			}

			skipNextSaveRef.current = true;
			setValues((current) =>
				restoreValues ? restoreValues(draft.values, current) : draft.values,
			);
			toast.success("Your unsaved changes have been restored.");
		} catch {
			toast.error("Could not recover the saved draft.");
		}
	}, [enabled, initialValues, key, restoreValues, setValues]);

	useEffect(() => {
		if (!enabled || !hasLoadedDraftRef.current) {
			return;
		}

		if (skipNextSaveRef.current) {
			skipNextSaveRef.current = false;
			return;
		}

		if (isFormClean()) {
			try {
				removeStoredDraft();
			} catch {
				// Ignore storage errors on cleanup
			}
			return;
		}

		const timeoutId = window.setTimeout(() => {
			saveTimeoutIdRef.current = null;

			try {
				persistDraft();
			} catch {
				if (!hasShownSaveErrorRef.current) {
					hasShownSaveErrorRef.current = true;
					toast.error("Could not autosave this draft.");
				}
			}
		}, debounceMs);
		saveTimeoutIdRef.current = timeoutId;

		return () => {
			window.clearTimeout(timeoutId);

			if (saveTimeoutIdRef.current === timeoutId) {
				saveTimeoutIdRef.current = null;
			}
		};
	}, [debounceMs, enabled, isFormClean, persistDraft, removeStoredDraft]);

	function clearDraft() {
		try {
			cancelPendingSave();
			removeStoredDraft();
			skipNextSaveRef.current = true;
		} catch {
			toast.error("Could not clear the saved draft.");
		}
	}

	function discardDraft() {
		clearDraft();

		if (initialValues !== undefined) {
			setValues(() => initialValues);
		}
	}

	function saveDraft() {
		if (!enabled) {
			return;
		}

		try {
			cancelPendingSave();
			persistDraft();
		} catch {
			toast.error("Could not autosave this draft.");
		}
	}

	return { clearDraft, discardDraft, saveDraft };
}

export function createModuleDraftKey({
	mode,
	moduleId,
	recordId,
}: {
	mode: string;
	moduleId: string;
	recordId?: string;
}) {
	return ["draft", moduleId, mode, recordId].filter(Boolean).join(":");
}
