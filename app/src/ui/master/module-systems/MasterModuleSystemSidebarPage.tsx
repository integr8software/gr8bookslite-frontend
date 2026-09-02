"use client";

import { Fragment, useRef, useState } from "react";
import Link from "next/link";
import {
	closestCenter,
	DndContext,
	KeyboardSensor,
	PointerSensor,
	useDroppable,
	useSensor,
	useSensors,
	type DragEndEvent,
	type DragOverEvent,
} from "@dnd-kit/core";
import {
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowLeft, Edit3, Grip, ListTree, Save, Trash2 } from "lucide-react";
import {
	getMasterModuleSystemEditHref,
	MasterModuleSystemsHref,
	MasterModuleSystemSidebarItemTypes,
} from "@/app/src/constants/master/module-systems/MasterModuleSystemConstants";
import {
	appendSidebarChild,
	canNestSidebarItem,
	cloneSidebar,
	createSidebarItem,
	ensureAssignedModuleLinks,
	getSidebarDefaultIconKind,
	getSidebarDropPreview,
	getSidebarGapId,
	getSidebarItemIcon,
	getSidebarKeySet,
	insertSidebarSibling,
	makeUniqueKeyFromSet,
	MaxSectionDepth,
	normalizeSidebarTree,
	patchSidebarItem,
	removeSidebarItem,
	removeSidebarItemPreserveChildren,
} from "@/app/src/data/master/module-systems/MasterModuleSystemSidebarData";
import { useMasterModuleSystemSidebarPage } from "@/app/src/hooks/master/module-systems/useMasterModuleSystemSidebarPage";
import type {
	MasterModuleSystemSidebarItem,
} from "@/app/src/services/master/module-systems/MasterModuleSystemApi";
import type {
	MasterModuleSystemSidebarPageProps,
	SidebarDropGapProps,
	SidebarDropPreview,
	SidebarTemplatePanelProps,
	SidebarTreeProps,
	SidebarTreeRowProps,
} from "@/app/src/types/master/module-systems/MasterModuleSystemTypes";
import { SidebarIconPicker } from "@/app/src/ui/master/module-systems/SidebarIconPicker";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";
import { ModuleSystemPageSkeleton } from "@/app/src/ui/master/module-systems/ModuleSystemPageSkeleton";
import { joinClasses } from "@/app/src/ui/shared/main-layout/sidebar/utils";

export function MasterModuleSystemSidebarPage({
	recordId,
}: MasterModuleSystemSidebarPageProps) {
	const {
		effectiveSidebarDraft,
		fallbackSidebar,
		isLoading,
		isSaving,
		record,
		saveDraft,
		updateDraft,
	} = useMasterModuleSystemSidebarPage(recordId);

	if (isLoading) return <ModuleSystemPageSkeleton />;

	if (!record) {
		return (
			<ModuleNotFound
				title="System not found"
				description="The selected module system is not available in the master system list."
				actionHref={MasterModuleSystemsHref}
				actionLabel="Back to systems"
			/>
		);
	}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="card"
				titleAs="h1"
				eyebrow="Master"
				title={`${record.name} Sidebar`}
				description="Configure this system's default sidebar template. Existing company and user customizations are not overwritten."
				actions={
					<>
						<Link
							href={MasterModuleSystemsHref}
							className={moduleHeaderActionClassNames.secondary}
						>
							<ArrowLeft className="h-4 w-4" aria-hidden="true" />
							Back
						</Link>
						<Link
							href={getMasterModuleSystemEditHref(record.id)}
							className={moduleHeaderActionClassNames.secondary}
						>
							<Edit3 className="h-4 w-4" aria-hidden="true" />
							Edit System
						</Link>
					</>
				}
			/>
			<SidebarTemplatePanel
				fallbackSidebar={fallbackSidebar}
				isLoading={isLoading}
				isSaving={isSaving}
				items={effectiveSidebarDraft}
				modules={record.modules}
				onSave={saveDraft}
				onUpdate={updateDraft}
			/>
		</section>
	);
}

function SidebarTemplatePanel({
	fallbackSidebar,
	isLoading,
	isSaving,
	items,
	modules,
	onSave,
	onUpdate,
}: SidebarTemplatePanelProps) {
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
	);
	const [dropPreview, setDropPreview] = useState<SidebarDropPreview | null>(null);
	const dropPreviewRef = useRef<SidebarDropPreview | null>(null);

	function update(next: MasterModuleSystemSidebarItem[]) {
		onUpdate(normalizeSidebarTree(ensureAssignedModuleLinks(next, modules)));
	}

	function addSidebarSection(index = items.length, parentKey: string | null = null) {
		const existingKeys = getSidebarKeySet(items);
		const section = createSidebarItem({
			itemType: MasterModuleSystemSidebarItemTypes.SECTION,
			key: makeUniqueKeyFromSet("new-section", existingKeys),
			label: "New Section",
		});
		if (parentKey) {
			const parent = locateSidebarItemHelper(items, parentKey);
			if (!parent || !canNestSidebarItem(section, parent)) return;
		}
		update(insertSidebarSibling(items, parentKey, index, section));
	}

	function onDragOver({ active, over }: DragOverEvent) {
		const nextPreview = getSidebarDropPreview(
			items,
			String(active.id),
			over ? String(over.id) : null,
		);
		dropPreviewRef.current = nextPreview;
		setDropPreview(nextPreview);
	}

	function onDragEnd({ active, over }: DragEndEvent) {
		const preview =
			dropPreviewRef.current ??
			getSidebarDropPreview(
				items,
				String(active.id),
				over ? String(over.id) : null,
			);
		dropPreviewRef.current = null;
		setDropPreview(null);
		if (!preview || active.id === preview.targetKey) return;
		const source = locateSidebarItemHelper(items, String(active.id));
		if (!source) return;
		const withoutSource = removeSidebarItem(items, source.item.key);

		if (preview.mode === "gap") {
			if (
				preview.gap.parentKey &&
				!locateSidebarItemHelper(withoutSource, preview.gap.parentKey)
			) {
				return;
			}
			const targetIndex =
				source.parentKey === preview.gap.parentKey &&
				source.index < preview.gap.index
					? preview.gap.index - 1
					: preview.gap.index;
			update(
				insertSidebarSibling(
					withoutSource,
					preview.gap.parentKey,
					targetIndex,
					source.item,
				),
			);
			return;
		}

		const target = locateSidebarItemHelper(withoutSource, preview.targetKey);
		if (!target) return;

		update(appendSidebarChild(withoutSource, target.item.key, source.item));
	}

	return (
		<section className="grid content-start gap-4 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h2 className="text-base font-semibold text-darknavy">
						Sidebar Template
					</h2>
					<p className="mt-1 text-sm text-darknavy/52">
						This configures the default sidebar for new materializations only.
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<button
						type="button"
						onClick={() => update(cloneSidebar(fallbackSidebar))}
						disabled={isLoading}
						className="inline-flex h-10 items-center gap-2 rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-bold text-darknavy transition hover:bg-skyblue/8 disabled:opacity-45"
					>
						<ListTree className="h-4 w-4" aria-hidden="true" />
						Use Fallback Links
					</button>
					<button
						type="button"
						onClick={onSave}
						disabled={isSaving}
						className="inline-flex h-10 items-center gap-2 rounded-lg bg-darknavy px-4 text-sm font-bold text-white shadow-sm transition hover:bg-darknavy/88 disabled:opacity-55"
					>
						<Save className="h-4 w-4" aria-hidden="true" />
						{isSaving ? "Saving..." : "Save Sidebar"}
					</button>
				</div>
			</div>

			{items.length === 0 ? (
				<div className="flex min-h-[14rem] flex-col items-center justify-center rounded-lg border border-dashed border-darknavy/15 p-6 text-center">
					<p className="text-sm font-semibold text-darknavy/70">
						No sidebar items configured
					</p>
					<p className="mt-1 text-xs text-darknavy/50">
						Click &quot;Use Fallback Links&quot; or add sections below to build the navigation.
					</p>
					<button
						type="button"
						onClick={() => addSidebarSection(0, null)}
						className="mt-3 inline-flex items-center rounded-md bg-skyblue/10 px-3 py-1.5 text-xs font-bold text-skyblue transition hover:bg-skyblue/20"
					>
						Add Section
					</button>
				</div>
			) : (
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragCancel={() => {
						dropPreviewRef.current = null;
						setDropPreview(null);
					}}
					onDragEnd={onDragEnd}
					onDragOver={onDragOver}
				>
					<div className="min-h-[18rem] rounded-lg border border-darknavy/10 p-3">
						<SidebarTree
							dropPreview={dropPreview}
							items={items}
							canAddSection
							onAddSection={addSidebarSection}
							onPatchItem={(key, patch) =>
								update(patchSidebarItem(items, key, patch))
							}
							onRemove={(key) =>
								update(removeSidebarItemPreserveChildren(items, key))
							}
						/>
					</div>
				</DndContext>
			)}
		</section>
	);
}

function SidebarTree({
	canAddSection,
	depth = 0,
	dropPreview,
	items,
	onAddSection,
	onPatchItem,
	onRemove,
	parentKey = null,
}: SidebarTreeProps) {
	return (
		<SortableContext
			items={items.map((item) => item.key)}
			strategy={verticalListSortingStrategy}
		>
			<div>
				<SidebarDropGap
					canAddSection={canAddSection}
					depth={depth}
					dropPreview={dropPreview}
					index={0}
					onAddSection={() => onAddSection(0, parentKey)}
					parentKey={parentKey}
				/>
				{items.map((item, index) => (
					<Fragment key={item.key}>
						<SidebarTreeRow
							depth={depth}
							dropPreview={dropPreview}
							item={item}
							onAddSection={onAddSection}
							onPatchItem={onPatchItem}
							onRemove={onRemove}
						/>
						<SidebarDropGap
							canAddSection={canAddSection}
							depth={depth}
							dropPreview={dropPreview}
							index={index + 1}
							onAddSection={() => onAddSection(index + 1, parentKey)}
							parentKey={parentKey}
						/>
					</Fragment>
				))}
			</div>
		</SortableContext>
	);
}

function SidebarDropGap({
	canAddSection,
	depth,
	dropPreview,
	index,
	onAddSection,
	parentKey,
}: SidebarDropGapProps) {
	const gap = { depth, index, parentKey };
	const gapId = getSidebarGapId(gap);
	const { isOver, setNodeRef } = useDroppable({ id: gapId });
	const isActive =
		dropPreview?.mode === "gap" && dropPreview.targetKey === gapId;

	return (
		<div
			ref={setNodeRef}
			className={joinClasses(
				"group relative flex h-3 items-center transition",
				depth === 1 && "pl-4",
				depth >= 2 && "pl-8",
			)}
		>
			<div
				className={joinClasses(
					"relative h-1 w-full rounded-full transition",
					isActive || isOver
						? "bg-skyblue shadow-[0_0_0_3px_rgba(0,102,255,0.14)]"
						: "bg-transparent group-hover:bg-skyblue/35",
				)}
			>
				{canAddSection && !dropPreview ? (
					<button
						type="button"
						className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 bg-white px-1.5 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-skyblue group-hover:inline-flex"
						onClick={onAddSection}
					>
						Add Section
					</button>
				) : null}
			</div>
		</div>
	);
}

function SidebarTreeRow({
	depth,
	dropPreview,
	item,
	onAddSection,
	onPatchItem,
	onRemove,
}: SidebarTreeRowProps) {
	const {
		attributes,
		isDragging,
		listeners,
		setNodeRef,
		transform,
		transition,
	} = useSortable({ id: item.key });
	const isStructural = item.itemType !== MasterModuleSystemSidebarItemTypes.LINK;
	const previewMode = dropPreview?.targetKey === item.key ? dropPreview.mode : null;
	const Icon = getSidebarItemIcon(item, depth);
	const defaultIconKind = getSidebarDefaultIconKind(item, depth);

	return (
		<div className="rounded-lg bg-white">
			<div
				ref={setNodeRef}
				style={{
					transform: CSS.Transform.toString(transform),
					transition,
				}}
				className={joinClasses(
					"group relative grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-2 rounded-lg border border-darknavy/8 bg-white px-3 py-2 transition",
					isDragging && "opacity-45",
					isStructural && "bg-offwhite/45",
					previewMode === "inside" &&
						"border-skyblue/55 bg-skyblue/8 shadow-[inset_0_0_0_1px_rgba(0,102,255,0.18),0_0_0_2px_rgba(0,102,255,0.16)]",
				)}
			>
				<button
					type="button"
					aria-label={`Drag ${item.label}`}
					{...attributes}
					{...listeners}
					className="inline-flex h-8 w-8 cursor-grab items-center justify-center rounded-md text-darknavy/45 transition hover:bg-darknavy/5 active:cursor-grabbing"
				>
					<Grip className="h-4 w-4" aria-hidden="true" />
				</button>
				<SidebarIconPicker
					defaultIconKind={defaultIconKind}
					icon={Icon}
					label={item.label}
					value={item.iconName ?? ""}
					onChange={(iconName) => onPatchItem(item.key, { iconName })}
				/>
				<div className="min-w-0">
					<input
						value={item.label}
						onChange={(event) =>
							onPatchItem(item.key, { label: event.target.value })
						}
						className="w-full min-w-0 bg-transparent text-sm font-semibold text-darknavy outline-none"
					/>
					{item.itemType !== MasterModuleSystemSidebarItemTypes.LINK ? (
						<p className="mt-0.5 text-xs font-bold uppercase text-darknavy/38">
							{item.itemType === MasterModuleSystemSidebarItemTypes.CONTAINER ? "CHILD SECTION" : item.itemType}
						</p>
					) : null}
				</div>
				{item.itemType !== MasterModuleSystemSidebarItemTypes.LINK ? (
					<button
						type="button"
						onClick={() => onRemove(item.key)}
						className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-coralpink/30 text-coralpink opacity-0 transition hover:bg-coralpink/10 group-hover:opacity-100"
						aria-label="Remove section or folder"
					>
						<Trash2 className="h-4 w-4" aria-hidden="true" />
					</button>
				) : (
					<span className="h-8 w-8" aria-hidden="true" />
				)}
				{previewMode === "inside" ? (
					<span className="pointer-events-none absolute right-12 top-2 rounded-full bg-skyblue px-2 py-0.5 text-[0.625rem] font-bold uppercase text-white shadow-sm">
						Inside
					</span>
				) : null}
			</div>
			{isStructural ? (
				<div className="ml-4 mt-2 border-l border-darknavy/10 pl-3">
					<SidebarTree
						canAddSection={
							item.itemType === MasterModuleSystemSidebarItemTypes.SECTION && depth < MaxSectionDepth - 1
						}
						depth={depth + 1}
						dropPreview={dropPreview}
						items={item.children}
						onAddSection={onAddSection}
						onPatchItem={onPatchItem}
						onRemove={onRemove}
						parentKey={item.key}
					/>
				</div>
			) : null}
		</div>
	);
}

function locateSidebarItemHelper(
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
		const child = locateSidebarItemHelper(item.children, key, item.key, depth + 1);
		if (child) return child;
	}
	return null;
}
