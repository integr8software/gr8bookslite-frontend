import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
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
	isDraggable?: boolean;
	onInteract: () => void;
	onNavigateFromSidebar: (href: string) => () => void;
	onToggleExpandedKey: (key: string) => void;
};

export function SidebarNavigationContent({
	activeHref,
	expandedKeys,
	sections,
	isDraggable = true,
	onInteract,
	onNavigateFromSidebar,
	onToggleExpandedKey,
}: SidebarNavigationContentProps) {
	return (
		<SortableContext
			items={sections.map((s) => s.key)}
			strategy={verticalListSortingStrategy}
		>
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
										isDraggable={false}
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
								isDraggable={isDraggable}
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
							isDraggable={isDraggable}
							onInteract={onInteract}
							onNavigateFromSidebar={onNavigateFromSidebar}
							onToggleExpandedKey={onToggleExpandedKey}
						/>
					);
				})}
			</div>
		</SortableContext>
	);
}

function isAdminNavigationSection(section: MainNavigationSection) {
	return (
		!section.href &&
		(section.key.startsWith("workspace-") || section.key.startsWith("master-"))
	);
}
