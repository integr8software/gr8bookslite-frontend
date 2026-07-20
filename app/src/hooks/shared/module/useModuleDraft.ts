"use client";

import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

type ModuleDraftEnvelope<TValues> = {
	updatedAt: number;
	values: TValues;
	version: 1;
};

type UseModuleDraftOptions<TValues> = {
	debounceMs?: number;
	enabled?: boolean;
	key: string;
	setValues: (updater: (current: TValues) => TValues) => void;
	values: TValues;
};

export function useModuleDraft<TValues>({
	debounceMs = 600,
	enabled = true,
	key,
	setValues,
	values,
}: UseModuleDraftOptions<TValues>) {
	const hasLoadedDraftRef = useRef(false);
	const skipNextSaveRef = useRef(false);
	const hasShownSaveErrorRef = useRef(false);

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

			skipNextSaveRef.current = true;
			setValues(() => draft.values);
			toast.success("Recovered unsaved draft.");
		} catch {
			toast.error("Could not recover the saved draft.");
		}
	}, [enabled, key, setValues]);

	useEffect(() => {
		if (!enabled || !hasLoadedDraftRef.current) {
			return;
		}

		if (skipNextSaveRef.current) {
			skipNextSaveRef.current = false;
			return;
		}

		const timeoutId = window.setTimeout(() => {
			try {
				const draft: ModuleDraftEnvelope<TValues> = {
					updatedAt: Date.now(),
					values,
					version: 1,
				};

				window.localStorage.setItem(key, JSON.stringify(draft));
				hasShownSaveErrorRef.current = false;
			} catch {
				if (!hasShownSaveErrorRef.current) {
					hasShownSaveErrorRef.current = true;
					toast.error("Could not autosave this draft.");
				}
			}
		}, debounceMs);

		return () => window.clearTimeout(timeoutId);
	}, [debounceMs, enabled, key, values]);

	function clearDraft() {
		try {
			window.localStorage.removeItem(key);
			skipNextSaveRef.current = true;
		} catch {
			toast.error("Could not clear the saved draft.");
		}
	}

	return { clearDraft };
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
