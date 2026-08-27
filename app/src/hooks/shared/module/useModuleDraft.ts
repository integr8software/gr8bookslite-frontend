"use client";

import { useCallback, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";

export const DEFAULT_DRAFT_EXPIRATION_DAYS = 7;
export const DEFAULT_DRAFT_EXPIRATION_MS =
	DEFAULT_DRAFT_EXPIRATION_DAYS * 24 * 60 * 60 * 1000;

export type ModuleDraftEnvelope<TValues> = {
	branchId?: string | number | null;
	companyId?: string | number | null;
	createdAt?: number;
	expiresAt?: number;
	updatedAt: number;
	values: TValues;
	version: 1;
};

export type UseModuleDraftOptions<TValues> = {
	branchId?: string | number | null;
	companyId?: string | number | null;
	debounceMs?: number;
	enabled?: boolean;
	expiresInMs?: number;
	initialValues?: TValues;
	isDirty?: boolean;
	key: string;
	restoreValues?: (draftValues: TValues, currentValues: TValues) => TValues;
	setValues: (updater: (current: TValues) => TValues) => void;
	values: TValues;
};

export function resolveScopedDraftKey(
	baseKey: string,
	companyId: string | number | null | undefined,
	branchId: string | number | null | undefined,
): string {
	const trimmed = baseKey.trim();
	if (!trimmed) {
		return trimmed;
	}

	const normCompany =
		companyId !== undefined && companyId !== null && String(companyId).trim() !== ""
			? `company:${String(companyId).trim()}`
			: "company:none";

	const normBranch =
		branchId !== undefined && branchId !== null && String(branchId).trim() !== ""
			? `branch:${String(branchId).trim()}`
			: "branch:none";

	if (trimmed.startsWith("draft:company:")) {
		if (trimmed.includes(":branch:")) {
			return trimmed;
		}

		const parts = trimmed.split(":");
		const companyVal = parts[2] ?? "none";
		const rest = parts.slice(3).join(":");

		return ["draft", `company:${companyVal}`, normBranch, rest]
			.filter(Boolean)
			.join(":");
	}

	if (trimmed.startsWith("draft:")) {
		const rest = trimmed.slice("draft:".length);
		return ["draft", normCompany, normBranch, rest].filter(Boolean).join(":");
	}

	return ["draft", normCompany, normBranch, trimmed].filter(Boolean).join(":");
}

export function useModuleDraft<TValues>({
	branchId: explicitBranchId,
	companyId: explicitCompanyId,
	debounceMs = 600,
	enabled = true,
	expiresInMs = DEFAULT_DRAFT_EXPIRATION_MS,
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

	const normalizedCompanyId =
		resolvedCompanyId !== undefined &&
		resolvedCompanyId !== null &&
		String(resolvedCompanyId).trim() !== ""
			? String(resolvedCompanyId).trim()
			: null;

	const normalizedBranchId =
		resolvedBranchId !== undefined &&
		resolvedBranchId !== null &&
		String(resolvedBranchId).trim() !== ""
			? String(resolvedBranchId).trim()
			: null;

	const storageKey = resolveScopedDraftKey(
		key,
		normalizedCompanyId,
		normalizedBranchId,
	);
	const expirationDurationMs = expiresInMs ?? DEFAULT_DRAFT_EXPIRATION_MS;

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
			branchId: normalizedBranchId,
			companyId: normalizedCompanyId,
			createdAt: now,
			expiresAt: now + expirationDurationMs,
			updatedAt: now,
			values,
			version: 1,
		};

		window.localStorage.setItem(storageKey, JSON.stringify(draft));
		hasShownSaveErrorRef.current = false;
	}, [
		expirationDurationMs,
		isFormClean,
		normalizedBranchId,
		normalizedCompanyId,
		removeStoredDraft,
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

			const now = Date.now();
			const draftUpdatedAt =
				typeof draft.updatedAt === "number" ? draft.updatedAt : 0;
			const draftExpiresAt =
				typeof draft.expiresAt === "number"
					? draft.expiresAt
					: draftUpdatedAt + expirationDurationMs;

			if (
				now > draftExpiresAt ||
				(draftUpdatedAt > 0 && now - draftUpdatedAt > expirationDurationMs)
			) {
				window.localStorage.removeItem(storageKey);
				return;
			}

			const storedDraftCompanyId =
				draft.companyId !== undefined &&
				draft.companyId !== null &&
				String(draft.companyId).trim() !== ""
					? String(draft.companyId).trim()
					: null;

			if (storedDraftCompanyId !== normalizedCompanyId) {
				return;
			}

			const storedDraftBranchId =
				draft.branchId !== undefined &&
				draft.branchId !== null &&
				String(draft.branchId).trim() !== ""
					? String(draft.branchId).trim()
					: null;

			if (storedDraftBranchId !== normalizedBranchId) {
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
		expirationDurationMs,
		initialValues,
		normalizedBranchId,
		normalizedCompanyId,
		restoreValues,
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
	const companySegment =
		companyId !== undefined &&
		companyId !== null &&
		String(companyId).trim() !== ""
			? `company:${String(companyId).trim()}`
			: undefined;

	const branchSegment =
		branchId !== undefined &&
		branchId !== null &&
		String(branchId).trim() !== ""
			? `branch:${String(branchId).trim()}`
			: undefined;

	return ["draft", companySegment, branchSegment, moduleId, mode, recordId]
		.filter(Boolean)
		.join(":");
}
