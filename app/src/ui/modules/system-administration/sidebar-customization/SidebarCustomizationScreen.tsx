"use client";

/* eslint-disable react-hooks/refs, react-hooks/set-state-in-effect */

import { createElement, useEffect, useState } from "react";
import {
	DndContext,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
	type DragEndEvent,
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
	Grip,
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
} from "@/app/src/services/company/user-sidebar/UserSidebarApi";
import { SidebarAllowedIcons } from "@/app/src/ui/shared/main-layout/sidebar/SidebarIcons";
import { joinClasses } from "@/app/src/ui/shared/main-layout/utils";

type TreeItem = Omit<UserSidebarApiItem, "children"> & { children: TreeItem[] };

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

	function onDragEnd({ active, over }: DragEndEvent) {
		if (!over || active.id === over.id) return;

		const source = locate(items, Number(active.id));
		if (!source) return;

		const target = locate(items, Number(over.id));
		if (!target) return;

		if (source.parentId !== target.parentId) {
			toast.error("Sidebar items can only be reordered within their current group.");
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
							<Tree
								items={items}
								icons={query.data.supportedIconNames}
								onChange={update}
							/>
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
								<h2 className="text-sm font-semibold">Plan default</h2>
								<p className="text-xs text-darknavy/50">
									Sidebar structure follows the active subscription plan.
								</p>
							</div>
						</div>
						<p className="rounded-md bg-darknavy/5 p-3 text-sm text-darknavy/60">
							Use this screen to reorder, hide, or reset default sidebar items. New modules are added through plan and module-system configuration.
						</p>
					</aside>
				</div>
			</DndContext>
		</main>
	);
}

function PanelMessage({ children }: { children: string }) {
	return <div className="p-8 text-sm text-darknavy/65">{children}</div>;
}

function Tree({
	items,
	icons,
	onChange,
	depth = 1,
}: {
	items: TreeItem[];
	icons: string[];
	onChange: (items: TreeItem[]) => void;
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
						onDelete={() => onChange(items.filter((value) => value.id !== item.id))}
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
	onDelete,
	onChildren,
}: {
	item: TreeItem;
	depth: number;
	icons: string[];
	onDelete: () => void;
	onChildren: (children: TreeItem[]) => void;
}) {
	const sortable = useSortable({ id: String(item.id) });
	const Icon = getItemIcon(item, depth);
	const isStructural = item.itemType !== "LINK";

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
				<span
					className={joinClasses(
						"min-w-0 flex-1 bg-transparent py-1 font-medium outline-none",
						isStructural ? "uppercase text-darknavy" : "text-darknavy/90",
					)}
				>
					{item.label}
				</span>
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
					/>
				</div>
			) : null}
		</div>
	);
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
