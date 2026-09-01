import type { MainNavigationSection } from "@/app/src/types/shared/main-layout/MainLayoutDomainTypes";
import {
	SidebarCategorySection,
	SidebarItem,
	SidebarSection,
} from "./SidebarNavigation";

type SidebarNavigationContentProps = {
	activeHref: string;
	expandedKeys: string[];
	sections: MainNavigationSection[];
	onInteract: () => void;
	onNavigateFromSidebar: (href: string) => () => void;
	onToggleExpandedKey: (key: string) => void;
};

export function SidebarNavigationContent({
	activeHref,
	expandedKeys,
	sections,
	onInteract,
	onNavigateFromSidebar,
	onToggleExpandedKey,
}: SidebarNavigationContentProps) {
	return (
		<div className="space-y-2">
			{sections.map((section) => {
				if (
					section.key === "workspace" ||
					section.key === "workspace-modules"
				) {
					return (
						<div key={section.key} className="space-y-3">
							<p className="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-darknavy/38">
								{section.title}
							</p>
							{section.items.map((item) => (
								<SidebarItem
									key={item.key}
									activeHref={activeHref}
									expandedKeys={expandedKeys}
									item={item}
									depth={-1}
									onInteract={onInteract}
									onNavigateFromSidebar={onNavigateFromSidebar}
									onToggleExpandedKey={onToggleExpandedKey}
								/>
							))}
						</div>
					);
				}

				if (isAdminNavigationSection(section)) {
					return (
						<SidebarCategorySection
							key={section.key}
							activeHref={activeHref}
							expandedKeys={expandedKeys}
							section={section}
							onInteract={onInteract}
							onNavigateFromSidebar={onNavigateFromSidebar}
							onToggleExpandedKey={onToggleExpandedKey}
						/>
					);
				}

				return (
					<SidebarSection
						key={section.key}
						activeHref={activeHref}
						expandedKeys={expandedKeys}
						section={section}
						onInteract={onInteract}
						onNavigateFromSidebar={onNavigateFromSidebar}
						onToggleExpandedKey={onToggleExpandedKey}
					/>
				);
			})}
		</div>
	);
}

function isAdminNavigationSection(section: MainNavigationSection) {
	return (
		!section.href &&
		(section.key.startsWith("workspace-") || section.key.startsWith("master-"))
	);
}
