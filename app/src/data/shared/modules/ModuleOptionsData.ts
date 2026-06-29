import { SidebarModuleNavigationSections } from "@/app/src/data/shared/main-layout/sidebar/SidebarModuleRegistry";

export type ModuleOption = {
	label: string;
	value: string;
	id?: string;
};

export function getMaintenanceModuleOptions(
	excludedKeys: string[] = [],
): ModuleOption[] {
	const options = new Map<string, ModuleOption>();
	const excludedKeySet = new Set(excludedKeys);

	for (const section of SidebarModuleNavigationSections) {
		collectModuleOptions(section.items, options, excludedKeySet);
	}

	return [...options.values()].sort((left, right) =>
		left.label.localeCompare(right.label),
	);
}

function collectModuleOptions(
	items: (typeof SidebarModuleNavigationSections)[number]["items"],
	options: Map<string, ModuleOption>,
	excludedKeys: Set<string>,
) {
	for (const item of items) {
		if (item.module && !excludedKeys.has(item.key)) {
			options.set(item.key, {
				label: item.label,
				value: item.permissionCode ?? item.key,
			});
		}

		if (item.children) {
			collectModuleOptions(item.children, options, excludedKeys);
		}
	}
}
