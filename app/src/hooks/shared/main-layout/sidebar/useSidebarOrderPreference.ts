"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
	MainNavigationItem,
	MainNavigationSection,
} from "@/app/src/types/shared/main-layout/MainLayoutDomainTypes";

export type StoredNavigationOrder = {
	version: 1;
	sections: Array<{
		key: string;
		itemKeys?: string[];
	}>;
};

const StorageKeyPrefix = "gr8books:sidebar-order";

export function getSidebarStorageKey(
	companyId: number | string | null | undefined,
	branchUnitId: number | string | null | undefined,
	userId: number | string | null | undefined,
): string {
	const cId = companyId ?? "default";
	const bId = branchUnitId ?? "default";
	const uId = userId ?? "default";
	return `${StorageKeyPrefix}:${cId}:${bId}:${uId}`;
}

export function getStoredNavigationOrder(
	companyId: number | string | null | undefined,
	branchUnitId: number | string | null | undefined,
	userId: number | string | null | undefined,
): StoredNavigationOrder | null {
	if (typeof window === "undefined") return null;
	const key = getSidebarStorageKey(companyId, branchUnitId, userId);

	try {
		const raw = localStorage.getItem(key);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as StoredNavigationOrder;
		if (parsed && parsed.version === 1 && Array.isArray(parsed.sections)) {
			return parsed;
		}
		return null;
	} catch {
		return null;
	}
}

export function saveStoredNavigationOrder(
	companyId: number | string | null | undefined,
	branchUnitId: number | string | null | undefined,
	userId: number | string | null | undefined,
	sections: MainNavigationSection[],
): void {
	if (typeof window === "undefined") return;
	const key = getSidebarStorageKey(companyId, branchUnitId, userId);

	try {
		const data: StoredNavigationOrder = {
			version: 1,
			sections: sections.map((s) => ({
				key: s.key,
				itemKeys: s.items.map((i) => i.key),
			})),
		};
		localStorage.setItem(key, JSON.stringify(data));
	} catch {
		// Ignore storage quota errors
	}
}

export function clearStoredNavigationOrder(
	companyId: number | string | null | undefined,
	branchUnitId: number | string | null | undefined,
	userId: number | string | null | undefined,
): void {
	if (typeof window === "undefined") return;
	const key = getSidebarStorageKey(companyId, branchUnitId, userId);

	try {
		localStorage.removeItem(key);
	} catch {
		// Ignore storage errors
	}
}

function collectAllNavigationItems(
	items: MainNavigationItem[],
	itemMap: Map<string, MainNavigationItem>,
) {
	for (const item of items) {
		itemMap.set(item.key, item);
		if (item.children && item.children.length > 0) {
			collectAllNavigationItems(item.children, itemMap);
		}
	}
}

/**
 * Reconciles authoritative navigation sections with the user's stored custom order.
 * - Sections and items in stored order: rendered in that exact section and order
 * - New sections or items from backend: appended at the end
 * - Stored keys no longer in backend: silently omitted
 */
export function reconcileNavigationSections(
	backendSections: MainNavigationSection[],
	storedOrder: StoredNavigationOrder | null,
): MainNavigationSection[] {
	if (
		!storedOrder ||
		!storedOrder.sections ||
		storedOrder.sections.length === 0
	) {
		return backendSections;
	}

	const sectionMap = new Map<string, MainNavigationSection>();
	const itemMap = new Map<string, MainNavigationItem>();

	for (const section of backendSections) {
		sectionMap.set(section.key, section);
		collectAllNavigationItems(section.items, itemMap);
	}

	// Track all item keys saved across ALL sections in stored order
	const allStoredItemKeys = new Set<string>();
	for (const storedSection of storedOrder.sections) {
		if (storedSection.itemKeys) {
			for (const itemKey of storedSection.itemKeys) {
				allStoredItemKeys.add(itemKey);
			}
		}
	}

	const placedSectionKeys = new Set<string>();
	const placedItemKeys = new Set<string>();
	const reconciled: MainNavigationSection[] = [];

	for (const storedSection of storedOrder.sections) {
		const section = sectionMap.get(storedSection.key);
		if (!section || placedSectionKeys.has(storedSection.key)) continue;

		placedSectionKeys.add(storedSection.key);

		const orderedItems: MainNavigationItem[] = [];

		// 1. Place the items that the user specifically ordered in this section
		if (storedSection.itemKeys && storedSection.itemKeys.length > 0) {
			for (const itemKey of storedSection.itemKeys) {
				const item = itemMap.get(itemKey);
				if (item && !placedItemKeys.has(itemKey)) {
					orderedItems.push(item);
					placedItemKeys.add(itemKey);
				}
			}
		}

		// 2. Only append backend items from this section that were NOT stored in ANY section's order
		for (const originalItem of section.items) {
			if (
				!placedItemKeys.has(originalItem.key) &&
				!allStoredItemKeys.has(originalItem.key)
			) {
				orderedItems.push(originalItem);
				placedItemKeys.add(originalItem.key);
			}
		}

		reconciled.push({
			...section,
			items: orderedItems,
		});
	}

	// 3. Append any backend sections that were not in storedOrder
	for (const backendSection of backendSections) {
		if (!placedSectionKeys.has(backendSection.key)) {
			placedSectionKeys.add(backendSection.key);

			const remainingItems = backendSection.items.filter(
				(i) => !placedItemKeys.has(i.key) && !allStoredItemKeys.has(i.key),
			);
			for (const item of remainingItems) {
				placedItemKeys.add(item.key);
			}

			reconciled.push({
				...backendSection,
				items: remainingItems,
			});
		}
	}

	return reconciled;
}

type UseNavigationOrderOptions = {
	companyId: number | string | null | undefined;
	branchUnitId: number | string | null | undefined;
	userId: number | string | null | undefined;
	sections: MainNavigationSection[];
};

export function useNavigationOrder({
	companyId,
	branchUnitId,
	userId,
	sections: sourceSections,
}: UseNavigationOrderOptions) {
	const [storedOrder, setStoredOrder] = useState<StoredNavigationOrder | null>(
		() => getStoredNavigationOrder(companyId, branchUnitId, userId),
	);

	useEffect(() => {
		setStoredOrder(getStoredNavigationOrder(companyId, branchUnitId, userId));
	}, [companyId, branchUnitId, userId]);

	const reconciledSections = useMemo(
		() => reconcileNavigationSections(sourceSections, storedOrder),
		[sourceSections, storedOrder],
	);

	// In-memory state for live drag reordering across containers
	const [liveSections, setLiveSections] =
		useState<MainNavigationSection[]>(reconciledSections);

	useEffect(() => {
		setLiveSections(reconciledSections);
	}, [reconciledSections]);

	const hasCustomOrder = Boolean(
		storedOrder && storedOrder.sections && storedOrder.sections.length > 0,
	);

	const updateSections = useCallback(
		(nextSections: MainNavigationSection[]) => {
			setLiveSections(nextSections);
			saveStoredNavigationOrder(companyId, branchUnitId, userId, nextSections);
			setStoredOrder(getStoredNavigationOrder(companyId, branchUnitId, userId));
		},
		[companyId, branchUnitId, userId],
	);

	const cancelLiveReorder = useCallback(() => {
		setLiveSections(reconciledSections);
	}, [reconciledSections]);

	const resetOrder = useCallback(() => {
		clearStoredNavigationOrder(companyId, branchUnitId, userId);
		setStoredOrder(null);
	}, [companyId, branchUnitId, userId]);

	return {
		orderedSections: liveSections,
		setLiveSections,
		updateSections,
		cancelLiveReorder,
		resetOrder,
		hasCustomOrder,
	};
}
