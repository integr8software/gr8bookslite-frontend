"use client";

/* eslint-disable react-hooks/refs, react-hooks/set-state-in-effect */

import { createElement, useEffect, useMemo, useRef, useState } from "react";
import {
	DndContext,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	useDraggable,
	useDroppable,
	useSensor,
	useSensors,
	type DragEndEvent,
	type UniqueIdentifier,
} from "@dnd-kit/core";
import {
	SortableContext,
	arrayMove,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
	ChevronUp,
	Grip,
	Pencil,
	Plus,
	RotateCcw,
	Save,
	Trash2,
	X,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { AuthQueryKeys } from "@/app/src/services/auth/AuthQueryKeys";
import {
	GetUserSidebarCustomization,
	ResetUserSidebar,
	SaveUserSidebarCustomization,
	type UserSidebarApiItem,
	type UserSidebarCustomization,
} from "@/app/src/services/company/user-sidebar/UserSidebarApi";
import { SidebarAllowedIcons } from "@/app/src/ui/shared/main-layout/sidebar/SidebarIcons";
import { joinClasses } from "@/app/src/ui/shared/main-layout/utils";
import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleRouteMap";

type TreeItem = Omit<UserSidebarApiItem, "children"> & { children: TreeItem[] };
type AvailableModule = UserSidebarCustomization["availableModules"][number];

const RootDropZoneId = "platform-module-sidebar-root-drop-zone";
const ModuleDragPrefix = "available-module:";

export function SidebarCustomizationScreen({
	onClose,
}: {
	onClose?: () => void;
}) {
	const companyId = useAppStore((state) => state.activeCompanyId);
	const branchUnitId = useAppStore((state) => state.activeBranchId);
	const accessToken = useAppStore((state) => state.accessToken);
	const queryClient = useQueryClient();
	const authProfileQuery = useAuthProfileQuery({ accessToken });
	const targetUserId = authProfileQuery.data?.user.id;
	const [applyScope, setApplyScope] = useState<
		"CURRENT_BRANCH" | "ALL_BRANCHES"
	>("CURRENT_BRANCH");
	const [items, setItems] = useState<TreeItem[]>([]);
	const [dirty, setDirty] = useState(false);
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
	);

	const query = useQuery({
		queryKey: [
			"user-sidebar-customization",
			companyId,
			branchUnitId,
			targetUserId,
		],
		queryFn: () =>
			GetUserSidebarCustomization(companyId!, {
				branchUnitId: branchUnitId!,
				userId: targetUserId,
			}),
		enabled: Boolean(companyId && branchUnitId && targetUserId),
	});

	useEffect(() => {
		if (query.data && !dirty) setItems(query.data.items.map(normalize));
	}, [query.data, dirty]);

	useEffect(() => {
		const warn = (event: BeforeUnloadEvent) => {
			if (dirty) event.preventDefault();
		};
		window.addEventListener("beforeunload", warn);
		return () => window.removeEventListener("beforeunload", warn);
	}, [dirty]);

	const moduleOptions = useMemo(
		() =>
			query.data ? getModuleOptions(query.data.availableModules, query.data.items) : [],
		[query.data],
	);
	const unplacedModules = useMemo(() => {
		const placedModuleIds = new Set(
			flatten(items).flatMap((item) => (item.moduleId ? [item.moduleId] : [])),
		);
		return moduleOptions.filter((module) => !placedModuleIds.has(module.id));
	}, [items, moduleOptions]);

	const save = useMutation({
		mutationFn: () =>
			SaveUserSidebarCustomization(
				companyId!,
				{ branchUnitId: branchUnitId!, userId: targetUserId },
				{
					version: query.data!.version,
					items: items.map((item) => serialize(item)),
					applyScope,
				},
			),
		onSuccess: (data) => {
			setItems(data.items.map(normalize));
			setDirty(false);
			queryClient.setQueryData(
				["user-sidebar-customization", companyId, branchUnitId, targetUserId],
				data,
			);
			queryClient.invalidateQueries({ queryKey: AuthQueryKeys.profiles() });
			toast.success("Sidebar saved");
		},
		onError: () =>
			toast.error("Could not save. Make sure every permitted module is placed once."),
	});
	const reset = useMutation({
		mutationFn: () =>
			ResetUserSidebar(companyId!, {
				branchUnitId: branchUnitId!,
				userId: targetUserId,
				applyScope,
			}),
		onSuccess: (data) => {
			setItems(data.items.map(normalize));
			setDirty(false);
			queryClient.setQueryData(
				["user-sidebar-customization", companyId, branchUnitId, targetUserId],
				data,
			);
			queryClient.invalidateQueries({ queryKey: AuthQueryKeys.profiles() });
			toast.success("Default sidebar restored");
		},
	});

	if (!companyId) return <PanelMessage>Select a company first.</PanelMessage>;
	if (!branchUnitId) return <PanelMessage>Select a branch first.</PanelMessage>;
	if (!targetUserId) return <PanelMessage>Loading user access...</PanelMessage>;
	if (query.isLoading) return <PanelMessage>Loading sidebar...</PanelMessage>;
	if (!query.data)
		return <PanelMessage>Sidebar customization is unavailable.</PanelMessage>;

	function update(next: TreeItem[]) {
		setItems(next);
		setDirty(true);
	}

	function addNode(itemType: "SECTION" | "CONTAINER") {
		const timestamp = Date.now();
		update([
			...items,
			{
				id: -timestamp,
				key: `custom-${itemType.toLowerCase()}-${timestamp}`,
				label: itemType === "SECTION" ? "New Section" : "New Folder",
				itemType,
				iconName: null,
				children: [],
			},
		]);
	}

	function moveToRoot(itemId: number) {
		const source = locate(items, itemId);
		if (!source || source.parentId == null) return;
		update([...removeItem(items, source.item.id), source.item]);
	}

	function onDragEnd({ active, over }: DragEndEvent) {
		if (!over || active.id === over.id) return;

		const activeModuleId = getDraggedModuleId(active.id);
		if (activeModuleId != null) {
			const moduleOption = moduleOptions.find((option) => option.id === activeModuleId);
			if (!moduleOption) return;
			const link = createLink(moduleOption);

			if (over.id === RootDropZoneId) {
				update([...items, link]);
				return;
			}

			const target = locate(items, Number(over.id));
			if (!target) return;
			if (target.item.itemType !== "LINK" && canNest(link, target)) {
				update(appendChild(items, target.item.id, link));
				return;
			}

			const nextSiblings =
				target.parentId == null
					? insertAt(items, target.index + 1, link)
					: insertAt(locate(items, target.parentId)!.item.children, target.index + 1, link);
			update(replaceChildren(items, target.parentId, nextSiblings));
			return;
		}

		const source = locate(items, Number(active.id));
		if (!source) return;

		if (over.id === RootDropZoneId) {
			update([...removeItem(items, source.item.id), source.item]);
			return;
		}

		const target = locate(items, Number(over.id));
		if (!target) return;

		if (target.item.itemType !== "LINK" && canNest(source.item, target)) {
			update(appendChild(removeItem(items, source.item.id), target.item.id, source.item));
			return;
		}

		if (source.parentId !== target.parentId) {
			toast.error("Drop on a section/folder, or drop on the root area.");
			return;
		}

		const siblings =
			source.parentId == null ? items : locate(items, source.parentId)!.item.children;
		update(replaceChildren(items, source.parentId, arrayMove(siblings, source.index, target.index)));
	}

	return (
		<main className="flex min-h-full flex-col bg-[#f8fbff] text-darknavy">
			<header className="flex items-center justify-between gap-3 border-b border-darknavy/10 bg-white px-5 py-3">
				<div>
					<h1 className="text-lg font-semibold">Customize Sidebar</h1>
					<p className="text-xs text-darknavy/50">
						Arrange sections, folders, and permitted modules.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<select
						className="h-9 rounded-md border border-darknavy/10 bg-white px-2 text-xs"
						value={applyScope}
						onChange={(event) =>
							setApplyScope(event.target.value as "CURRENT_BRANCH" | "ALL_BRANCHES")
						}
					>
						<option value="CURRENT_BRANCH">Current branch</option>
						<option value="ALL_BRANCHES">All branches</option>
					</select>
					<button
						type="button"
						className="grid h-9 w-9 place-items-center rounded-md border border-darknavy/10 text-darknavy/60 hover:bg-darknavy/5"
						onClick={() => reset.mutate()}
						aria-label="Reset sidebar"
						title="Reset sidebar"
					>
						<RotateCcw className="h-4 w-4" />
					</button>
					{onClose ? (
						<button
							type="button"
							className="grid h-9 w-9 place-items-center rounded-md border border-darknavy/10 text-darknavy/60 hover:bg-darknavy/5"
							onClick={onClose}
							aria-label="Close sidebar customization"
						>
							<X className="h-4 w-4" />
						</button>
					) : null}
				</div>
			</header>

			<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
				<div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-5 xl:grid-cols-[minmax(340px,420px)_minmax(360px,1fr)]">
					<section className="flex min-h-[620px] flex-col overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-[0_18px_45px_rgba(33,39,56,0.08)]">
						<div className="border-b border-darknavy/10 px-5 py-3">
							<p className="text-xs font-semibold uppercase tracking-[0.12em] text-darknavy/45">
								Sidebar structure
							</p>
						</div>
						<div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
							<RootDropZone />
							<Tree
								items={items}
								icons={query.data.supportedIconNames}
								onChange={update}
								onMoveToRoot={moveToRoot}
							/>
							<AddDivider onAddSection={() => addNode("SECTION")} />
						</div>
						<footer className="flex justify-end gap-3 border-t border-darknavy/10 bg-white px-5 py-3">
							<button
								type="button"
								disabled={!dirty}
								className="h-10 min-w-28 rounded-md border border-darknavy/10 px-4 text-sm font-semibold text-darknavy disabled:opacity-40"
								onClick={() => {
									setItems(query.data.items.map(normalize));
									setDirty(false);
								}}
							>
								Cancel
							</button>
							<button
								type="button"
								disabled={!dirty || save.isPending}
								className="inline-flex h-10 min-w-28 items-center justify-center gap-2 rounded-md bg-skyblue px-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(0,102,255,0.24)] disabled:opacity-40"
								onClick={() => save.mutate()}
							>
								<Save className="h-4 w-4" />
								Save
							</button>
						</footer>
					</section>

					<aside className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-[0_18px_45px_rgba(33,39,56,0.08)]">
						<div className="mb-3 flex items-center justify-between gap-3">
							<div>
								<h2 className="text-sm font-semibold">Available modules</h2>
								<p className="text-xs text-darknavy/50">
									Drag a module into a section or folder.
								</p>
							</div>
							<button
								type="button"
								className="inline-flex h-9 items-center gap-1.5 rounded-md border border-darknavy/10 px-3 text-xs font-semibold hover:bg-darknavy/5"
								onClick={() => addNode("CONTAINER")}
							>
								<Plus className="h-3.5 w-3.5" />
								Folder
							</button>
						</div>
						<div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
							{unplacedModules.length ? (
								unplacedModules.map((module) => (
									<AvailableModuleCard key={module.id} module={module} />
								))
							) : (
								<p className="rounded-md bg-darknavy/5 p-3 text-sm text-darknavy/60">
									Every permitted module is placed.
								</p>
							)}
						</div>
					</aside>
				</div>
			</DndContext>
		</main>
	);
}

function PanelMessage({ children }: { children: string }) {
	return <div className="p-8 text-sm text-darknavy/65">{children}</div>;
}

function RootDropZone() {
	const droppable = useDroppable({ id: RootDropZoneId });
	return (
		<div
			ref={droppable.setNodeRef}
			className={joinClasses(
				"mb-3 rounded-md border border-dashed px-3 py-2 text-center text-xs transition",
				droppable.isOver
					? "border-skyblue bg-skyblue/10 text-skyblue"
					: "border-darknavy/15 text-darknavy/35",
			)}
		>
			Drop here to move an item to the sidebar root.
		</div>
	);
}

function AddDivider({ onAddSection }: { onAddSection: () => void }) {
	return (
		<div className="my-4 flex items-center">
			<span className="h-px flex-1 bg-skyblue" />
			<button
				type="button"
				className="inline-flex h-7 items-center gap-1 rounded-md border border-skyblue bg-white px-3 text-xs font-semibold text-skyblue shadow-sm hover:bg-skyblue/5"
				onClick={onAddSection}
			>
				<Plus className="h-3.5 w-3.5" />
				Add section
			</button>
			<span className="h-px flex-1 bg-skyblue" />
		</div>
	);
}

function Tree({
	items,
	icons,
	onChange,
	onMoveToRoot,
	depth = 1,
}: {
	items: TreeItem[];
	icons: string[];
	onChange: (items: TreeItem[]) => void;
	onMoveToRoot: (itemId: number) => void;
	depth?: number;
}) {
	return (
		<SortableContext
			items={items.map((item) => String(item.id))}
			strategy={verticalListSortingStrategy}
		>
			<div className="space-y-1.5">
				{items.map((item) => (
					<SortableRow
						key={item.id}
						item={item}
						depth={depth}
						icons={icons}
						onPatch={(patch) =>
							onChange(
								items.map((value) =>
									value.id === item.id ? { ...value, ...patch } : value,
								),
							)
						}
						onDelete={() => onChange(items.filter((value) => value.id !== item.id))}
						onMoveToRoot={() => onMoveToRoot(item.id)}
						onChildren={(children) =>
							onChange(
								items.map((value) =>
									value.id === item.id ? { ...value, children } : value,
								),
							)
						}
					/>
				))}
			</div>
		</SortableContext>
	);
}

function SortableRow({
	item,
	depth,
	icons,
	onPatch,
	onDelete,
	onMoveToRoot,
	onChildren,
}: {
	item: TreeItem;
	depth: number;
	icons: string[];
	onPatch: (patch: Partial<TreeItem>) => void;
	onDelete: () => void;
	onMoveToRoot: () => void;
	onChildren: (children: TreeItem[]) => void;
}) {
	const sortable = useSortable({ id: String(item.id) });
	const Icon = getItemIcon(item, depth);
	const defaultIconKind = getDefaultIconKind(item, depth);
	const isStructural = item.itemType !== "LINK";
	const labelInputRef = useRef<HTMLInputElement>(null);

	return (
		<div
			ref={sortable.setNodeRef}
			style={{
				transform: CSS.Transform.toString(sortable.transform),
				transition: sortable.transition,
			}}
			className={joinClasses(
				"rounded-md bg-white transition",
				sortable.isDragging && "opacity-45",
				sortable.isOver && isStructural && "ring-2 ring-skyblue/35",
			)}
		>
			<div className="group flex min-h-9 items-center gap-2 rounded-md px-1.5 text-sm hover:bg-darknavy/[0.035]">
				<button
					type="button"
					aria-label={`Drag ${item.label}`}
					{...sortable.attributes}
					{...sortable.listeners}
					className="grid h-7 w-7 shrink-0 cursor-grab place-items-center rounded text-darknavy/45 hover:bg-darknavy/5 active:cursor-grabbing"
				>
					<Grip className="h-3.5 w-3.5" />
				</button>
				{Icon ? (
					createElement(Icon, {
						className: "h-4 w-4 shrink-0 text-darknavy/65",
					})
				) : (
					<span
						aria-hidden="true"
						className="h-1.5 w-1.5 shrink-0 rounded-full bg-darknavy/30 transition-colors group-hover:bg-skyblue"
					/>
				)}
				<input
					ref={labelInputRef}
					aria-label="Label"
					className={joinClasses(
						"min-w-0 flex-1 bg-transparent py-1 font-medium outline-none",
						isStructural ? "uppercase text-darknavy" : "text-darknavy/90",
					)}
					value={item.label}
					onChange={(event) => onPatch({ label: event.target.value })}
				/>
				<IconPicker
					defaultIconKind={defaultIconKind}
					icons={icons}
					value={item.iconName ?? ""}
					onChange={(iconName) => onPatch({ iconName })}
				/>
				<button
					type="button"
					className="grid h-7 w-7 place-items-center rounded text-darknavy/50 opacity-0 hover:bg-darknavy/5 group-hover:opacity-100"
					aria-label={`Edit ${item.label}`}
					title="Edit label"
					onClick={() => labelInputRef.current?.focus()}
				>
					<Pencil className="h-3.5 w-3.5" />
				</button>
				{depth > 1 ? (
					<button
						type="button"
						className="grid h-7 w-7 place-items-center rounded text-darknavy/50 opacity-0 hover:bg-darknavy/5 group-hover:opacity-100"
						onClick={onMoveToRoot}
						aria-label={`Move ${item.label} to root`}
						title="Move to root"
					>
						<ChevronUp className="h-3.5 w-3.5" />
					</button>
				) : null}
				<button
					type="button"
					aria-label={`Remove ${item.label}`}
					className="grid h-7 w-7 place-items-center rounded text-darknavy/50 opacity-0 hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
					onClick={onDelete}
				>
					<Trash2 className="h-3.5 w-3.5" />
				</button>
			</div>
			{isStructural ? (
				<div className="ml-7 border-l border-darknavy/10 pl-4">
					<Tree
						items={item.children}
						icons={icons}
						depth={depth + 1}
						onChange={onChildren}
						onMoveToRoot={onMoveToRoot}
					/>
				</div>
			) : null}
		</div>
	);
}

function AvailableModuleCard({ module }: { module: AvailableModule }) {
	const draggable = useDraggable({ id: `${ModuleDragPrefix}${module.id}` });
	const Icon = module.iconName ? SidebarAllowedIcons[module.iconName] : undefined;

	return (
		<button
			ref={draggable.setNodeRef}
			type="button"
			{...draggable.attributes}
			{...draggable.listeners}
			className={joinClasses(
				"flex h-11 cursor-grab items-center gap-2 rounded-md border border-darknavy/10 bg-white px-3 text-left text-xs font-semibold text-darknavy shadow-sm transition hover:border-skyblue/60 hover:bg-skyblue/5 active:cursor-grabbing",
				draggable.isDragging && "opacity-50",
			)}
		>
			<Grip className="h-3.5 w-3.5 shrink-0 text-darknavy/45" />
			{Icon ? (
				<Icon className="h-4 w-4 shrink-0 text-darknavy/60" />
			) : (
				<span className="h-4 w-4 shrink-0" />
			)}
			<span className="min-w-0 truncate">{module.name}</span>
		</button>
	);
}

function IconPicker({
	defaultIconKind,
	icons,
	value,
	onChange,
}: {
	defaultIconKind: "folder" | "dot";
	icons: string[];
	value: string;
	onChange: (value: string | null) => void;
}) {
	return (
		<div className="hidden max-w-24 gap-1 group-hover:flex">
			{["", ...icons.slice(0, 5)].map((iconName) => {
				const Icon = iconName ? SidebarAllowedIcons[iconName] : undefined;
				return (
					<button
						key={iconName || "default"}
						type="button"
						title={iconName || "Default icon"}
						aria-label={iconName || "Default icon"}
						onClick={() => onChange(iconName || null)}
						className={joinClasses(
							"grid h-6 w-6 place-items-center rounded border",
							value === iconName
								? "border-skyblue bg-skyblue/10 text-skyblue"
								: "border-darknavy/10 text-darknavy/45 hover:bg-darknavy/5",
						)}
					>
						{Icon ? (
							createElement(Icon, { className: "h-3 w-3" })
						) : defaultIconKind === "folder" ? (
							createElement(SidebarAllowedIcons.folder, { className: "h-3 w-3" })
						) : (
							<span
								aria-hidden="true"
								className="h-1.5 w-1.5 rounded-full bg-current"
							/>
						)}
					</button>
				);
			})}
		</div>
	);
}

function createLink(module: AvailableModule): TreeItem {
	const timestamp = Date.now();
	return {
		id: -timestamp,
		key: `module-${module.code.toLowerCase()}-${timestamp}`,
		label: module.name,
		itemType: "LINK",
		moduleId: module.id,
		moduleCode: module.code,
		iconName: module.iconName,
		href: getModuleRoute(module.code),
		children: [],
	};
}

function normalize(item: UserSidebarApiItem): TreeItem {
	return { ...item, children: item.children.map(normalize) };
}

function serialize(item: TreeItem): UserSidebarApiItem {
	return {
		key: item.key,
		label: item.label,
		itemType: item.itemType,
		moduleId: item.itemType === "LINK" ? item.moduleId : undefined,
		iconName: item.iconName || undefined,
		children: item.children.map(serialize),
	} as UserSidebarApiItem;
}

function flatten(items: TreeItem[]): TreeItem[] {
	return items.flatMap((item) => [item, ...flatten(item.children)]);
}

function locate(
	items: TreeItem[],
	id: number,
	parentId: number | null = null,
	depth = 1,
): { item: TreeItem; parentId: number | null; index: number; depth: number } | null {
	for (const [index, item] of items.entries()) {
		if (item.id === id) return { item, parentId, index, depth };
		const child = locate(item.children, id, item.id, depth + 1);
		if (child) return child;
	}
	return null;
}

function replaceChildren(
	items: TreeItem[],
	parentId: number | null,
	children: TreeItem[],
): TreeItem[] {
	if (parentId == null) return children;
	return items.map((item) =>
		item.id === parentId
			? { ...item, children }
			: { ...item, children: replaceChildren(item.children, parentId, children) },
	);
}

function removeItem(items: TreeItem[], id: number): TreeItem[] {
	return items
		.filter((item) => item.id !== id)
		.map((item) => ({ ...item, children: removeItem(item.children, id) }));
}

function appendChild(
	items: TreeItem[],
	parentId: number,
	child: TreeItem,
): TreeItem[] {
	return items.map((item) =>
		item.id === parentId
			? { ...item, children: [...item.children, child] }
			: { ...item, children: appendChild(item.children, parentId, child) },
	);
}

function insertAt(items: TreeItem[], index: number, item: TreeItem) {
	return [...items.slice(0, index), item, ...items.slice(index)];
}

function canNest(
	source: TreeItem,
	target: { item: TreeItem; depth: number },
) {
	if (source.itemType === "SECTION") return false;
	if (target.item.itemType === "LINK") return false;
	if (source.itemType === "CONTAINER" && target.depth >= 2) return false;
	return target.depth + getTreeDepth(source) <= 3;
}

function getTreeDepth(item: TreeItem): number {
	return item.children.length
		? 1 + Math.max(...item.children.map(getTreeDepth))
		: 1;
}

function getDraggedModuleId(id: UniqueIdentifier) {
	const text = String(id);
	if (!text.startsWith(ModuleDragPrefix)) return null;
	const value = Number(text.slice(ModuleDragPrefix.length));
	return Number.isFinite(value) ? value : null;
}

function getItemIcon(item: TreeItem, depth: number) {
	const configuredIcon = item.iconName ? SidebarAllowedIcons[item.iconName] : undefined;
	if (configuredIcon) return configuredIcon;
	return getDefaultIconKind(item, depth) === "folder"
		? SidebarAllowedIcons.folder
		: undefined;
}

function getDefaultIconKind(item: TreeItem, depth: number): "folder" | "dot" {
	return depth <= 1 || item.children.length > 0 ? "folder" : "dot";
}

function getModuleOptions(
	available: AvailableModule[],
	roots: UserSidebarApiItem[],
) {
	const byId = new Map<number, AvailableModule>();
	for (const moduleOption of available) byId.set(moduleOption.id, moduleOption);
	for (const item of flattenApiItems(roots)) {
		if (item.itemType === "LINK" && item.moduleId) {
			byId.set(item.moduleId, {
				id: item.moduleId,
				code: item.moduleCode ?? item.key,
				name: item.label,
				legacyRoute: item.legacyRoute ?? item.route ?? item.href ?? null,
				route: getModuleRoute(item.moduleCode),
				iconName: item.iconName,
			});
		}
	}
	return Array.from(byId.values()).sort((first, second) =>
		first.name.localeCompare(second.name),
	);
}

function flattenApiItems(items: UserSidebarApiItem[]): UserSidebarApiItem[] {
	return items.flatMap((item) => [item, ...flattenApiItems(item.children)]);
}
