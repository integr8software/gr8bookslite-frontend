import Link from "next/link";
import { Check, ChevronDown, GitBranch, Settings } from "lucide-react";
import type { MainBranch } from "@/app/src/data/shared/main-layout/MainLayoutTypes";
import type { MainBreadcrumbDropdownItem } from "@/app/src/types/shared/main-layout/MainLayoutTypes";
import type { SwitcherVariant } from "@/app/src/types/shared/main-layout/MainTopbarTypes";
import { MenuSeparator } from "./MenuPrimitives";
import {
	getBranchLabel,
	getSwitcherMenuClassName,
	joinClasses,
} from "@/app/src/ui/shared/main-layout/main-topbar/utils";

type BranchSwitcherProps = {
	branchDropdownItems: MainBreadcrumbDropdownItem[];
	currentBranch: MainBranch | null;
	isLoading: boolean;
	isOpen: boolean;
	mobileMenuTopClass?: string;
	variant?: SwitcherVariant;
	onClose: () => void;
	onSelectBranch: (branchId: string) => void;
	onToggle: () => void;
};

export function BranchSwitcher({
	branchDropdownItems,
	currentBranch,
	isLoading,
	isOpen,
	mobileMenuTopClass,
	variant = "desktop",
	onClose,
	onSelectBranch,
	onToggle,
}: BranchSwitcherProps) {
	return (
		<div
			className={joinClasses(
				"relative min-w-0",
				variant === "desktop"
					? "min-w-36 max-w-52 flex-1 basis-0 lg:max-w-56 xl:max-w-60"
					: "w-full",
			)}
			data-main-switcher-root
		>
			<button
				type="button"
				onClick={onToggle}
				aria-label="Switch branch"
				aria-expanded={isOpen}
				className={joinClasses(
					"flex h-10 w-full min-w-0 items-center gap-2 border border-darknavy/10 bg-white px-3 text-left text-sm shadow-sm transition-all duration-200 ease-out hover:border-skyblue/45 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35 motion-reduce:transition-none motion-reduce:active:scale-100",
					variant === "mobile" ? "rounded-full" : "rounded-md",
				)}
			>
				<GitBranch
					className="h-4 w-4 shrink-0 text-darknavy/55"
					aria-hidden="true"
				/>
				<span className="min-w-0 flex-1 truncate font-semibold text-darknavy">
					{currentBranch
						? getBranchLabel(currentBranch)
						: "No Branch Access"}
				</span>
				<ChevronDown
					className="h-4 w-4 shrink-0 text-darknavy/45"
					aria-hidden="true"
				/>
			</button>

			{isOpen ? (
				<div
					className={getSwitcherMenuClassName(
						variant,
						mobileMenuTopClass,
					)}
				>
					{isLoading ? (
						<div
							className="space-y-2 p-3"
							aria-label="Loading branches"
						>
							<span className="block h-3 w-32 rounded bg-darknavy/10" />
							<span className="block h-3 w-44 rounded bg-darknavy/10" />
							<span className="block h-3 w-24 rounded bg-darknavy/10" />
						</div>
					) : branchDropdownItems.length ? (
						<BranchSwitcherGroups
							branchDropdownItems={branchDropdownItems}
							currentBranchId={currentBranch?.id}
							onClose={onClose}
							onSelectBranch={onSelectBranch}
						/>
					) : (
						<div className="px-3 py-4 text-sm text-darknavy/55">
							No branches available.
						</div>
					)}
				</div>
			) : null}
		</div>
	);
}

type BranchSwitcherGroupsProps = {
	branchDropdownItems: MainBreadcrumbDropdownItem[];
	currentBranchId?: string;
	onClose: () => void;
	onSelectBranch: (branchId: string) => void;
};

function BranchSwitcherGroups({
	branchDropdownItems,
	currentBranchId,
	onClose,
	onSelectBranch,
}: BranchSwitcherGroupsProps) {
	const selectionItems = branchDropdownItems.filter(
		(item) => !item.isManagementAction,
	);
	const managementItem = branchDropdownItems.find(
		(item) => item.isManagementAction,
	);
	const branchItems = selectionItems.filter(
		(item) => item.kind !== "satellite",
	);
	const satelliteItems = selectionItems.filter(
		(item) => item.kind === "satellite",
	);
	const hasBranchItems = branchItems.length > 0;
	const hasSatelliteItems = satelliteItems.length > 0;

	return (
		<div className="flex max-h-[min(24rem,calc(100vh-8rem))] flex-col">
			<div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1">
				{hasBranchItems ? (
					<BranchSwitcherGroup
						currentBranchId={currentBranchId}
						items={branchItems}
						label="Branch"
						onClose={onClose}
						onSelectBranch={onSelectBranch}
					/>
				) : null}
				{hasBranchItems && hasSatelliteItems ? <MenuSeparator /> : null}
				{hasSatelliteItems ? (
					<BranchSwitcherGroup
						currentBranchId={currentBranchId}
						items={satelliteItems}
						label="Satellite"
						onClose={onClose}
						onSelectBranch={onSelectBranch}
					/>
				) : null}
			</div>
			{managementItem ? (
				<div className="sticky bottom-0 border-t border-darknavy/10 bg-white p-1">
					<Link
						href={managementItem.href}
						onClick={onClose}
						className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darknavy/25"
					>
						<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-skyblue/18 text-darknavy">
							<Settings className="h-4 w-4" aria-hidden="true" />
						</span>
						<span className="min-w-0 flex-1">
							<span className="block truncate">
								{managementItem.label}
							</span>
							{managementItem.helperText ? (
								<span className="mt-0.5 block truncate text-xs font-normal text-darknavy/50">
									{managementItem.helperText}
								</span>
							) : null}
						</span>
					</Link>
				</div>
			) : null}
		</div>
	);
}

type BranchSwitcherGroupProps = {
	currentBranchId?: string;
	items: MainBreadcrumbDropdownItem[];
	label: string;
	onClose: () => void;
	onSelectBranch: (branchId: string) => void;
};

function BranchSwitcherGroup({
	currentBranchId,
	items,
	label,
	onClose,
	onSelectBranch,
}: BranchSwitcherGroupProps) {
	return (
		<div className="py-0.5">
			<p className="px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-darknavy/45">
				{label}
			</p>
			{items.length ? (
				items.map((item) => {
					const isCurrentBranch = item.branchId === currentBranchId;

					return (
						<Link
							key={item.key}
							href={item.href}
							onClick={() => {
								if (item.branchId) {
									onSelectBranch(item.branchId);
								}
								onClose();
							}}
							className={joinClasses(
								"flex items-center gap-2 rounded-md px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35",
								isCurrentBranch
									? "bg-skyblue/12 ring-1 ring-skyblue/28 hover:bg-skyblue/18"
									: "hover:bg-skyblue/10",
							)}
						>
							<span
								className={joinClasses(
									"flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
									isCurrentBranch
										? "theme-accent-contrast-text bg-skyblue shadow-[0_0_10px_rgb(var(--skyblue-rgb)/0.26)]"
										: "bg-darknavy/8 text-darknavy",
								)}
							>
								<GitBranch
									className="h-4 w-4"
									aria-hidden="true"
								/>
							</span>
							<span className="min-w-0 flex-1">
								<span className="block truncate font-semibold text-darknavy">
									{item.label}
								</span>
							</span>
							{isCurrentBranch ? (
								<Check
									className="h-4 w-4 shrink-0 text-skyblue"
									aria-hidden="true"
								/>
							) : null}
						</Link>
					);
				})
			) : (
				<p className="px-3 py-2 text-sm text-darknavy/45">
					None available.
				</p>
			)}
		</div>
	);
}
