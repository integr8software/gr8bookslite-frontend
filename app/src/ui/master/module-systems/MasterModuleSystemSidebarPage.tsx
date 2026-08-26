"use client";

import {
	Fragment,
	createElement,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	DndContext,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
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
import toast from "react-hot-toast";
import {
	saveMasterModuleSystemSidebar,
	type MasterModuleSystem,
	type MasterModuleSystemSidebarItem,
} from "@/app/src/services/master/module-systems/MasterModuleSystemApi";
import {
	MasterModuleSystemsHref,
	getMasterModuleSystemEditHref,
} from "@/app/src/constants/master/module-systems/MasterModuleSystemConstants";
import { MasterModuleSystemQueryKeys } from "@/app/src/services/master/module-systems/MasterModuleSystemQueryKeys";
import { useMasterModuleSystemSidebarQuery } from "@/app/src/hooks/master/module-systems/useMasterModuleSystemsQuery";
import { useMasterModuleSystemListPage } from "@/app/src/hooks/master/module-systems/useMasterModuleSystemListPage";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";
import { ModuleSystemPageSkeleton } from "@/app/src/ui/master/module-systems/ModuleSystemPageSkeleton";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { SidebarAllowedIcons } from "@/app/src/ui/shared/main-layout/sidebar/SidebarIcons";
import type {
	MasterModuleSystemSidebarPageProps,
	SidebarDropPreview,
	SidebarGap,
} from "@/app/src/types/master/module-systems/MasterModuleSystemTypes";

const SidebarGapPrefix = "module-system-sidebar-gap:";
const MaxSidebarDepth = 3;
const MaxSectionDepth = 2;

export function MasterModuleSystemSidebarPage({
	recordId,
}: MasterModuleSystemSidebarPageProps) {
	const queryClient = useQueryClient();
	const systemsQuery = useMasterModuleSystemListPage();
	const record = useMemo(
		() => systemsQuery.records.find((candidate) => candidate.id === Number(recordId)),
		[recordId, systemsQuery.records],
	);
	const sidebarQuery = useMasterModuleSystemSidebarQuery(record?.id ?? null);
	const [sidebarDraft, setSidebarDraft] = useState<MasterModuleSystemSidebarItem[]>([]);
	const [isSidebarDraftDirty, setIsSidebarDraftDirty] = useState(false);
	const initialSidebarDraft = useMemo(() => {
		if (!record) return [];
		const configuredSidebar = record.sidebar.length
			? record.sidebar
			: (sidebarQuery.data?.fallbackSidebar ?? []);
		return normalizeSidebarTree(
			ensureAssignedModuleLinks(cloneSidebar(configuredSidebar), record.modules),
		);
	}, [record, sidebarQuery.data]);
	const effectiveSidebarDraft = isSidebarDraftDirty
		? sidebarDraft
		: initialSidebarDraft;

	const saveSidebarMutation = useMutation({
		mutationFn: async () => {
			if (!record) throw new Error("System not found.");
			return saveMasterModuleSystemSidebar(
				record.id,
				normalizeSidebarTree(effectiveSidebarDraft),
			);
		},
		onSuccess: async () => {
			if (record) {
				await queryClient.invalidateQueries({
					queryKey: MasterModuleSystemQueryKeys.sidebar(record.id),
				});
			}
			await queryClient.invalidateQueries({
				queryKey: MasterModuleSystemQueryKeys.lists(),
			});
			toast.success("System sidebar template saved.");
		},
		onError: (error: Error) => toast.error(error.message),
	});

	if (systemsQuery.isLoading) return <ModuleSystemPageSkeleton />;

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
				fallbackSidebar={sidebarQuery.data?.fallbackSidebar ?? []}
				isLoading={sidebarQuery.isLoading}
				isSaving={saveSidebarMutation.isPending}
				items={effectiveSidebarDraft}
				modules={record.modules}
				onSave={() => saveSidebarMutation.mutate()}
				onUpdate={(items) => {
					setIsSidebarDraftDirty(true);
					setSidebarDraft(items);
				}}
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
}: {
	fallbackSidebar: MasterModuleSystemSidebarItem[];
	isLoading: boolean;
	isSaving: boolean;
	items: MasterModuleSystemSidebarItem[];
	modules: MasterModuleSystem["modules"];
	onSave: () => void;
	onUpdate: (items: MasterModuleSystemSidebarItem[]) => void;
}) {
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
			itemType: "SECTION",
			key: makeUniqueKeyFromSet("new-section", existingKeys),
			label: "New Section",
		});
		if (parentKey) {
			const parent = locateSidebarItem(items, parentKey);
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
		const source = locateSidebarItem(items, String(active.id));
		if (!source) return;
		const withoutSource = removeSidebarItem(items, source.item.key);

		if (preview.mode === "gap") {
			if (
				preview.gap.parentKey &&
				!locateSidebarItem(withoutSource, preview.gap.parentKey)
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

		const target = locateSidebarItem(withoutSource, preview.targetKey);
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
}: {
	canAddSection: boolean;
	depth?: number;
	dropPreview: SidebarDropPreview | null;
	items: MasterModuleSystemSidebarItem[];
	onAddSection: (index?: number, parentKey?: string | null) => void;
	onPatchItem: (
		key: string,
		patch: Partial<MasterModuleSystemSidebarItem>,
	) => void;
	onRemove: (key: string) => void;
	parentKey?: string | null;
}) {
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
}: {
	canAddSection: boolean;
	depth: number;
	dropPreview: SidebarDropPreview | null;
	index: number;
	onAddSection: () => void;
	parentKey: string | null;
}) {
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
}: {
	depth: number;
	dropPreview: SidebarDropPreview | null;
	item: MasterModuleSystemSidebarItem;
	onAddSection: (index?: number, parentKey?: string | null) => void;
	onPatchItem: (
		key: string,
		patch: Partial<MasterModuleSystemSidebarItem>,
	) => void;
	onRemove: (key: string) => void;
}) {
	const {
		attributes,
		isDragging,
		listeners,
		setNodeRef,
		transform,
		transition,
	} = useSortable({ id: item.key });
	const isStructural = item.itemType !== "LINK";
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
					{item.itemType !== "LINK" ? (
						<p className="mt-0.5 text-xs font-bold uppercase text-darknavy/38">
							{item.itemType === "CONTAINER" ? "CHILD SECTION" : item.itemType}
						</p>
					) : null}
				</div>
				{item.itemType !== "LINK" ? (
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
							item.itemType === "SECTION" && depth < MaxSectionDepth - 1
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

function SidebarIconPicker({
	defaultIconKind,
	icon: Icon,
	label,
	onChange,
	value,
}: {
	defaultIconKind: "dot" | "folder";
	icon: (typeof SidebarAllowedIcons)[string] | undefined;
	label: string;
	onChange: (value: string | null) => void;
	value: string;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [popoverPosition, setPopoverPosition] = useState<{
		left: number;
		top: number;
	} | null>(null);
	const buttonRef = useRef<HTMLButtonElement | null>(null);
	const menuRef = useRef<HTMLDivElement | null>(null);
	const iconEntries = Object.entries(SidebarAllowedIcons).sort(
		([first], [second]) => first.localeCompare(second),
	);
	const updatePopoverPosition = useCallback(() => {
		const rect = buttonRef.current?.getBoundingClientRect();
		if (!rect) {
			setIsOpen(false);
			setPopoverPosition(null);
			return;
		}
		const width = 176;
		const height = 208;
		const left = Math.min(
			Math.max(8, rect.left),
			Math.max(8, window.innerWidth - width - 8),
		);
		const belowTop = rect.bottom + 6;
		const top =
			belowTop + height > window.innerHeight
				? Math.max(8, rect.top - height - 6)
				: belowTop;
		setPopoverPosition({ left, top });
	}, []);
	const openMenu = () => {
		updatePopoverPosition();
		setIsOpen(true);
	};
	const closeMenu = useCallback(() => {
		setIsOpen(false);
		setPopoverPosition(null);
	}, []);

	useEffect(() => {
		if (!isOpen) return;
		const handlePointerDown = (event: PointerEvent) => {
			const target = event.target;
			if (!(target instanceof Node)) return;
			if (
				buttonRef.current?.contains(target) ||
				menuRef.current?.contains(target)
			) {
				return;
			}
			closeMenu();
		};
		const handleViewportChange = () => updatePopoverPosition();
		document.addEventListener("pointerdown", handlePointerDown);
		window.addEventListener("resize", handleViewportChange);
		window.addEventListener("scroll", handleViewportChange, true);
		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
			window.removeEventListener("resize", handleViewportChange);
			window.removeEventListener("scroll", handleViewportChange, true);
		};
	}, [closeMenu, isOpen, updatePopoverPosition]);

	return (
		<div className="h-7 w-7 shrink-0">
			<button
				ref={buttonRef}
				type="button"
				title="Change icon"
				aria-label={`Change icon for ${label}`}
				onClick={() => (isOpen ? closeMenu() : openMenu())}
				className={joinClasses(
					"grid h-7 w-7 place-items-center rounded text-darknavy/60 transition hover:bg-darknavy/5 hover:text-skyblue",
					isOpen && "bg-skyblue/10 text-skyblue",
				)}
			>
				{Icon ? (
					createElement(Icon, { className: "h-4 w-4" })
				) : defaultIconKind === "folder" ? (
					createElement(SidebarAllowedIcons.folder, { className: "h-4 w-4" })
				) : (
					<span
						aria-hidden="true"
						className="h-1.5 w-1.5 rounded-full bg-current"
					/>
				)}
			</button>
			{isOpen && popoverPosition && typeof document !== "undefined"
				? createPortal(
				<div
					ref={menuRef}
					style={{
						left: popoverPosition.left,
						top: popoverPosition.top,
					}}
					className="fixed z-50 grid max-h-52 w-44 grid-cols-5 gap-1 overflow-y-auto overflow-x-hidden rounded-md border border-darknavy/10 bg-white p-2 shadow-[0_14px_35px_rgba(33,39,56,0.16)]"
				>
					<button
						type="button"
						title="Default"
						aria-label="Default icon"
						onClick={() => {
							onChange(null);
							closeMenu();
						}}
						className={joinClasses(
							"grid h-7 w-7 place-items-center rounded border text-darknavy/55 hover:bg-skyblue/8",
							value === ""
								? "border-skyblue bg-skyblue/10 text-skyblue"
								: "border-transparent",
						)}
					>
						{defaultIconKind === "folder" ? (
							createElement(SidebarAllowedIcons.folder, { className: "h-4 w-4" })
						) : (
							<span
								aria-hidden="true"
								className="h-1.5 w-1.5 rounded-full bg-current"
							/>
						)}
					</button>
					{iconEntries.map(([iconName, Icon]) => (
						<button
							key={iconName}
							type="button"
							title={iconName}
							aria-label={iconName}
							onClick={() => {
								onChange(iconName);
								closeMenu();
							}}
							className={joinClasses(
								"grid h-7 w-7 place-items-center rounded border text-darknavy/55 hover:bg-skyblue/8",
								value === iconName
									? "border-skyblue bg-skyblue/10 text-skyblue"
									: "border-transparent",
							)}
						>
							<Icon className="h-4 w-4" />
						</button>
					))}
				</div>,
				document.body,
			)
				: null}
		</div>
	);
}

function createSidebarItem(
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
		moduleId: item.itemType === "LINK" ? item.moduleId ?? null : null,
		moduleCode: item.itemType === "LINK" ? item.moduleCode ?? null : null,
		iconName: item.iconName ?? null,
		sortOrder: 0,
		isVisible: true,
		children: [],
	};
}

function cloneSidebar(
	items: MasterModuleSystemSidebarItem[],
): MasterModuleSystemSidebarItem[] {
	return items.map((item) => ({
		...item,
		children: cloneSidebar(item.children),
	}));
}

function normalizeSidebarTree(
	items: MasterModuleSystemSidebarItem[],
): MasterModuleSystemSidebarItem[] {
	return items.map((item, index) => ({
		...item,
		sortOrder: index,
		children: normalizeSidebarTree(item.children),
	}));
}

function removeSidebarItem(
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

function removeSidebarItemPreserveChildren(
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

function ensureAssignedModuleLinks(
	items: MasterModuleSystemSidebarItem[],
	modules: MasterModuleSystem["modules"],
) {
	const existingModuleIds = new Set(flattenSidebar(items).flatMap((item) =>
		item.itemType === "LINK" && item.moduleId ? [item.moduleId] : [],
	));
	const existingKeys = new Set(flattenSidebar(items).map((item) => item.key));
	const missingLinks = modules
		.filter((module) => !existingModuleIds.has(module.id))
		.map((module) => {
			const baseKey = `module-${module.code.toLowerCase()}`;
			const key = makeUniqueKeyFromSet(baseKey, existingKeys);
			existingKeys.add(key);
			return createSidebarItem({
				description: module.description,
				itemType: "LINK",
				key,
				label: module.name,
				moduleCode: module.code,
				moduleId: module.id,
			});
		});
	return [...items, ...missingLinks];
}

function patchSidebarItem(
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

function locateSidebarItem(
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

function getSidebarSiblings(
	items: MasterModuleSystemSidebarItem[],
	parentKey: string | null,
) {
	if (!parentKey) return items;
	return locateSidebarItem(items, parentKey)?.item.children ?? [];
}

function replaceSidebarSiblings(
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

function insertSidebarSibling(
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

function getSidebarDropPreview(
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
		target.item.itemType !== "LINK" &&
		canNestSidebarItem(source.item, target);

	if (canDropInside) {
		return { mode: "inside", targetKey: target.item.key };
	}

	return null;
}

function appendSidebarChild(
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

function canNestSidebarItem(
	source: MasterModuleSystemSidebarItem,
	target: {
		depth: number;
		item: MasterModuleSystemSidebarItem;
	},
) {
	if (target.item.itemType === "LINK") return false;
	if (source.itemType === "SECTION") {
		return (
			target.item.itemType === "SECTION" &&
			target.depth + getSidebarSectionDepth(source) <= MaxSectionDepth
		);
	}
	if (source.itemType === "CONTAINER" && target.depth >= MaxSidebarDepth) {
		return false;
	}
	return target.depth + getSidebarDepth(source) <= MaxSidebarDepth;
}

function getSidebarDepth(item: MasterModuleSystemSidebarItem): number {
	return item.children.length
		? 1 + Math.max(...item.children.map(getSidebarDepth))
		: 1;
}

function getSidebarSectionDepth(item: MasterModuleSystemSidebarItem): number {
	const childSectionDepths = item.children
		.filter((child) => child.itemType === "SECTION")
		.map(getSidebarSectionDepth);
	const deepestChildSection = childSectionDepths.length
		? Math.max(...childSectionDepths)
		: 0;
	return item.itemType === "SECTION"
		? 1 + deepestChildSection
		: deepestChildSection;
}

function flattenSidebar(items: MasterModuleSystemSidebarItem[]) {
	return items.flatMap((item): MasterModuleSystemSidebarItem[] => [
		item,
		...flattenSidebar(item.children),
	]);
}

function getSidebarKeySet(items: MasterModuleSystemSidebarItem[]) {
	return new Set(flattenSidebar(items).map((item) => item.key));
}

function getSidebarGapId(gap: SidebarGap) {
	return `${SidebarGapPrefix}${gap.parentKey ?? "root"}:${gap.index}:${gap.depth}`;
}

function getSidebarGapData(id: unknown): SidebarGap | null {
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

function getSidebarItemIcon(item: MasterModuleSystemSidebarItem, depth: number) {
	const configuredIcon = item.iconName ? SidebarAllowedIcons[item.iconName] : undefined;
	if (configuredIcon) return configuredIcon;
	return getSidebarDefaultIconKind(item, depth) === "folder"
		? SidebarAllowedIcons.folder
		: undefined;
}

function getSidebarDefaultIconKind(
	item: MasterModuleSystemSidebarItem,
	depth: number,
): "dot" | "folder" {
	return depth <= 1 || item.children.length > 0 ? "folder" : "dot";
}

function makeUniqueKeyFromSet(baseKey: string, keys: Set<string>) {
	let key = baseKey || "sidebar-item";
	let index = 2;
	while (keys.has(key)) {
		key = `${baseKey}-${index}`;
		index += 1;
	}
	return key;
}
