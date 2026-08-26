import { MasterModuleSystemSidebarItemTypes } from "@/app/src/constants/master/module-systems/MasterModuleSystemConstants";
import type {
	MasterModuleSystem,
	MasterModuleSystemSidebarItem,
} from "@/app/src/services/master/module-systems/MasterModuleSystemApi";
import type {
	SidebarDropPreview,
	SidebarGap,
} from "@/app/src/types/master/module-systems/MasterModuleSystemTypes";
import { SidebarAllowedIcons } from "@/app/src/ui/shared/main-layout/sidebar/SidebarIcons";

export const SidebarGapPrefix = "module-system-sidebar-gap:";
export const MaxSidebarDepth = 3;
export const MaxSectionDepth = 2;

export function createSidebarItem(
	item: Partial<MasterModuleSystemSidebarItem> & {
		itemType: MasterModuleSystemSidebarItem["itemType"];
		key: string;
		label: string;
	},
): MasterModuleSystemSidebarItem {
	return {
		id: null,
		key: item.key,
		label: item.label,
		description: item.description ?? "",
		itemType: item.itemType,
		moduleId:
			item.itemType === MasterModuleSystemSidebarItemTypes.LINK
				? item.moduleId ?? null
				: null,
		moduleCode:
			item.itemType === MasterModuleSystemSidebarItemTypes.LINK
				? item.moduleCode ?? null
				: null,
		iconName: item.iconName ?? null,
		sortOrder: 0,
		isVisible: true,
		children: [],
	};
}

export function cloneSidebar(
	items: MasterModuleSystemSidebarItem[],
): MasterModuleSystemSidebarItem[] {
	return items.map((item) => ({
		...item,
		children: cloneSidebar(item.children),
	}));
}

export function normalizeSidebarTree(
	items: MasterModuleSystemSidebarItem[],
): MasterModuleSystemSidebarItem[] {
	return items.map((item, index) => ({
		...item,
		sortOrder: index,
		children: normalizeSidebarTree(item.children),
	}));
}

export function removeSidebarItem(
	items: MasterModuleSystemSidebarItem[],
	key: string,
): MasterModuleSystemSidebarItem[] {
	return items
		.filter((item) => item.key !== key)
		.map((item) => ({
			...item,
			children: removeSidebarItem(item.children, key),
		}));
}

export function removeSidebarItemPreserveChildren(
	items: MasterModuleSystemSidebarItem[],
	key: string,
): MasterModuleSystemSidebarItem[] {
	const next: MasterModuleSystemSidebarItem[] = [];
	for (const item of items) {
		if (item.key === key) {
			next.push(...item.children);
			continue;
		}
		next.push({
			...item,
			children: removeSidebarItemPreserveChildren(item.children, key),
		});
	}
	return next;
}

export function ensureAssignedModuleLinks(
	items: MasterModuleSystemSidebarItem[],
	modules: MasterModuleSystem["modules"],
) {
	const existingModuleIds = new Set(
		flattenSidebar(items).flatMap((item) =>
			item.itemType === MasterModuleSystemSidebarItemTypes.LINK && item.moduleId
				? [item.moduleId]
				: [],
		),
	);
	const existingKeys = new Set(flattenSidebar(items).map((item) => item.key));
	const missingLinks = modules
		.filter((module) => !existingModuleIds.has(module.id))
		.map((module) => {
			const baseKey = `module-${module.code.toLowerCase()}`;
			const key = makeUniqueKeyFromSet(baseKey, existingKeys);
			existingKeys.add(key);
			return createSidebarItem({
				description: module.description,
				itemType: MasterModuleSystemSidebarItemTypes.LINK,
				key,
				label: module.name,
				moduleCode: module.code,
				moduleId: module.id,
			});
		});
	return [...items, ...missingLinks];
}

export function patchSidebarItem(
	items: MasterModuleSystemSidebarItem[],
	key: string,
	patch: Partial<MasterModuleSystemSidebarItem>,
): MasterModuleSystemSidebarItem[] {
	return items.map((item) =>
		item.key === key
			? { ...item, ...patch }
			: { ...item, children: patchSidebarItem(item.children, key, patch) },
	);
}

export function locateSidebarItem(
	items: MasterModuleSystemSidebarItem[],
	key: string,
	parentKey: string | null = null,
	depth = 1,
): {
	depth: number;
	index: number;
	item: MasterModuleSystemSidebarItem;
	parentKey: string | null;
} | null {
	for (const [index, item] of items.entries()) {
		if (item.key === key) return { depth, index, item, parentKey };
		const child = locateSidebarItem(item.children, key, item.key, depth + 1);
		if (child) return child;
	}
	return null;
}

export function getSidebarSiblings(
	items: MasterModuleSystemSidebarItem[],
	parentKey: string | null,
) {
	if (!parentKey) return items;
	return locateSidebarItem(items, parentKey)?.item.children ?? [];
}

export function replaceSidebarSiblings(
	items: MasterModuleSystemSidebarItem[],
	parentKey: string | null,
	siblings: MasterModuleSystemSidebarItem[],
): MasterModuleSystemSidebarItem[] {
	if (!parentKey) return siblings;
	return items.map((item) =>
		item.key === parentKey
			? { ...item, children: siblings }
			: {
					...item,
					children: replaceSidebarSiblings(item.children, parentKey, siblings),
				},
	);
}

export function insertSidebarSibling(
	items: MasterModuleSystemSidebarItem[],
	parentKey: string | null,
	index: number,
	item: MasterModuleSystemSidebarItem,
) {
	const siblings = getSidebarSiblings(items, parentKey);
	return replaceSidebarSiblings(items, parentKey, [
		...siblings.slice(0, index),
		item,
		...siblings.slice(index),
	]);
}

export function getSidebarDropPreview(
	items: MasterModuleSystemSidebarItem[],
	activeKey: string,
	overKey: string | null,
): SidebarDropPreview | null {
	if (!overKey || activeKey === overKey) return null;
	const source = locateSidebarItem(items, activeKey);
	if (!source) return null;
	const gap = getSidebarGapData(overKey);
	if (gap) {
		const withoutSource = removeSidebarItem(items, source.item.key);
		if (gap.parentKey) {
			const parent = locateSidebarItem(withoutSource, gap.parentKey);
			if (!parent || !canNestSidebarItem(source.item, parent)) return null;
		}
		if (!gap.parentKey && gap.depth + getSidebarDepth(source.item) > MaxSidebarDepth) {
			return null;
		}
		return { mode: "gap", targetKey: overKey, gap };
	}
	const withoutSource = removeSidebarItem(items, source.item.key);
	const target = locateSidebarItem(withoutSource, overKey);
	if (!target) return null;
	const canDropInside =
		target.item.itemType !== MasterModuleSystemSidebarItemTypes.LINK &&
		canNestSidebarItem(source.item, target);

	if (canDropInside) {
		return { mode: "inside", targetKey: target.item.key };
	}

	return null;
}

export function appendSidebarChild(
	items: MasterModuleSystemSidebarItem[],
	parentKey: string,
	child: MasterModuleSystemSidebarItem,
): MasterModuleSystemSidebarItem[] {
	return items.map((item) =>
		item.key === parentKey
			? { ...item, children: [...item.children, child] }
			: {
					...item,
					children: appendSidebarChild(item.children, parentKey, child),
				},
	);
}

export function canNestSidebarItem(
	source: MasterModuleSystemSidebarItem,
	target: {
		depth: number;
		item: MasterModuleSystemSidebarItem;
	},
) {
	if (target.item.itemType === MasterModuleSystemSidebarItemTypes.LINK) return false;
	if (source.itemType === MasterModuleSystemSidebarItemTypes.SECTION) {
		return (
			target.item.itemType === MasterModuleSystemSidebarItemTypes.SECTION &&
			target.depth + getSidebarSectionDepth(source) <= MaxSectionDepth
		);
	}
	if (
		source.itemType === MasterModuleSystemSidebarItemTypes.CONTAINER &&
		target.depth >= MaxSidebarDepth
	) {
		return false;
	}
	return target.depth + getSidebarDepth(source) <= MaxSidebarDepth;
}

export function getSidebarDepth(item: MasterModuleSystemSidebarItem): number {
	return item.children.length
		? 1 + Math.max(...item.children.map(getSidebarDepth))
		: 1;
}

export function getSidebarSectionDepth(item: MasterModuleSystemSidebarItem): number {
	const childSectionDepths = item.children
		.filter((child) => child.itemType === MasterModuleSystemSidebarItemTypes.SECTION)
		.map(getSidebarSectionDepth);
	const deepestChildSection = childSectionDepths.length
		? Math.max(...childSectionDepths)
		: 0;
	return item.itemType === MasterModuleSystemSidebarItemTypes.SECTION
		? 1 + deepestChildSection
		: deepestChildSection;
}

export function flattenSidebar(items: MasterModuleSystemSidebarItem[]) {
	return items.flatMap((item): MasterModuleSystemSidebarItem[] => [
		item,
		...flattenSidebar(item.children),
	]);
}

export function getSidebarKeySet(items: MasterModuleSystemSidebarItem[]) {
	return new Set(flattenSidebar(items).map((item) => item.key));
}

export function getSidebarGapId(gap: SidebarGap) {
	return `${SidebarGapPrefix}${gap.parentKey ?? "root"}:${gap.index}:${gap.depth}`;
}

export function getSidebarGapData(id: unknown): SidebarGap | null {
	const text = String(id);
	if (!text.startsWith(SidebarGapPrefix)) return null;
	const [parentToken, indexToken, depthToken] = text
		.slice(SidebarGapPrefix.length)
		.split(":");
	const index = Number(indexToken);
	const depth = Number(depthToken);
	if (!Number.isInteger(index) || !Number.isInteger(depth)) return null;
	return {
		depth,
		index,
		parentKey: parentToken === "root" ? null : parentToken,
	};
}

export function getSidebarItemIcon(item: MasterModuleSystemSidebarItem, depth: number) {
	const configuredIcon = item.iconName ? SidebarAllowedIcons[item.iconName] : undefined;
	if (configuredIcon) return configuredIcon;
	return getSidebarDefaultIconKind(item, depth) === "folder"
		? SidebarAllowedIcons.folder
		: undefined;
}

export function getSidebarDefaultIconKind(
	item: MasterModuleSystemSidebarItem,
	depth: number,
): "dot" | "folder" {
	return depth <= 1 || item.children.length > 0 ? "folder" : "dot";
}

export function makeUniqueKeyFromSet(baseKey: string, keys: Set<string>) {
	let key = baseKey || "sidebar-item";
	let index = 2;
	while (keys.has(key)) {
		key = `${baseKey}-${index}`;
		index += 1;
	}
	return key;
}
