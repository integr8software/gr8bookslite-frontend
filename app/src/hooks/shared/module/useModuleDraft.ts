"use client";

import { useCallback, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";

export type ModuleDraftEnvelope<TValues> = {
	createdAt?: number;
	scopeToken?: string;
	updatedAt: number;
	values: TValues;
	version: 1;
};

export type UseModuleDraftOptions<TValues> = {
	branchId?: string | number | null;
	companyId?: string | number | null;
	debounceMs?: number;
	enabled?: boolean;
	initialValues?: TValues;
	isDirty?: boolean;
	key: string;
	restoreValues?: (draftValues: TValues, currentValues: TValues) => TValues;
	setValues: (updater: (current: TValues) => TValues) => void;
	values: TValues;
};

export function createDraftScopeHash(
	companyId: string | number | null | undefined,
	branchId: string | number | null | undefined,
): string {
	const normCompany =
		companyId !== undefined && companyId !== null && String(companyId).trim() !== ""
			? String(companyId).trim()
			: "none";

	const normBranch =
		branchId !== undefined && branchId !== null && String(branchId).trim() !== ""
			? String(branchId).trim()
			: "none";

	if (normCompany === "none" && normBranch === "none") {
		return "ctx_global";
	}

	const raw = `co:${normCompany}|br:${normBranch}`;

	let hash = 0x811c9dc5;
	for (let i = 0; i < raw.length; i += 1) {
		hash ^= raw.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193);
	}

	const hex = (hash >>> 0).toString(16).padStart(8, "0");
	return `ctx_${hex}`;
}

export function resolveScopedDraftKey(
	baseKey: string,
	companyId: string | number | null | undefined,
	branchId: string | number | null | undefined,
): { scopeToken: string; storageKey: string } {
	const trimmed = baseKey.trim();
	const scopeToken = createDraftScopeHash(companyId, branchId);

	if (!trimmed) {
		return { scopeToken, storageKey: trimmed };
	}

	let cleanKey = trimmed;
	if (cleanKey.startsWith("draft:")) {
		cleanKey = cleanKey.slice("draft:".length);
	}

	if (cleanKey.startsWith("company:")) {
		const parts = cleanKey.split(":");
		if (parts[2] === "branch") {
			cleanKey = parts.slice(4).join(":");
		} else {
			cleanKey = parts.slice(2).join(":");
		}
	} else if (cleanKey.startsWith("ctx_")) {
		const parts = cleanKey.split(":");
		cleanKey = parts.slice(1).join(":");
	}

	const storageKey = ["draft", scopeToken, cleanKey].filter(Boolean).join(":");
	return { scopeToken, storageKey };
}

export function useModuleDraft<TValues>({
	branchId: explicitBranchId,
	companyId: explicitCompanyId,
	debounceMs = 600,
	enabled = true,
	initialValues,
	isDirty,
	key,
	restoreValues,
	setValues,
	values,
}: UseModuleDraftOptions<TValues>) {
	const storeCompanyId = useAppStore((state) => state.activeCompanyId);
	const storeBranchId = useAppStore((state) => state.activeBranchId);

	const resolvedCompanyId =
		explicitCompanyId !== undefined ? explicitCompanyId : storeCompanyId;
	const resolvedBranchId =
		explicitBranchId !== undefined ? explicitBranchId : storeBranchId;

	const { scopeToken, storageKey } = resolveScopedDraftKey(
		key,
		resolvedCompanyId,
		resolvedBranchId,
	);

	const loadedKeyRef = useRef<string | null>(null);
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
		window.localStorage.removeItem(storageKey);
	}, [storageKey]);

	const persistDraft = useCallback(() => {
		if (isFormClean()) {
			removeStoredDraft();
			return;
		}

		const now = Date.now();
		const draft: ModuleDraftEnvelope<TValues> = {
			createdAt: now,
			scopeToken,
			updatedAt: now,
			values,
			version: 1,
		};

		window.localStorage.setItem(storageKey, JSON.stringify(draft));
		hasShownSaveErrorRef.current = false;
	}, [
		isFormClean,
		removeStoredDraft,
		scopeToken,
		storageKey,
		values,
	]);

	useEffect(() => {
		if (!enabled || loadedKeyRef.current === storageKey) {
			return;
		}

		loadedKeyRef.current = storageKey;
		cancelPendingSave();

		try {
			const storedDraft = window.localStorage.getItem(storageKey);

			if (!storedDraft) {
				return;
			}

			const draft = JSON.parse(storedDraft) as ModuleDraftEnvelope<TValues>;

			if (!draft || draft.version !== 1 || !draft.values) {
				return;
			}

			if (draft.scopeToken && draft.scopeToken !== scopeToken) {
				return;
			}

			if (
				initialValues !== undefined &&
				JSON.stringify(draft.values) === JSON.stringify(initialValues)
			) {
				window.localStorage.removeItem(storageKey);
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
	}, [
		cancelPendingSave,
		enabled,
		initialValues,
		restoreValues,
		scopeToken,
		setValues,
		storageKey,
	]);

	useEffect(() => {
		if (!enabled || loadedKeyRef.current !== storageKey) {
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
	}, [
		debounceMs,
		enabled,
		isFormClean,
		persistDraft,
		removeStoredDraft,
		storageKey,
	]);

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
	branchId,
	companyId,
	mode,
	moduleId,
	recordId,
}: {
	branchId?: string | number | null;
	companyId?: string | number | null;
	mode: string;
	moduleId: string;
	recordId?: string;
}) {
	const scopeToken = createDraftScopeHash(companyId, branchId);
	return ["draft", scopeToken, moduleId, mode, recordId]
		.filter(Boolean)
		.join(":");
}
