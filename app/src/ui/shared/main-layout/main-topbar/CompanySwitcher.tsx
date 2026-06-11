import { Building2, ChevronDown, LayoutDashboard } from "lucide-react";
import type {
	MainCompany,
	MainNavigationScope,
} from "@/app/src/data/shared/main-layout/MainLayoutTypes";
import { ImageSwatch } from "./ImageSwatch";
import { MenuSeparator } from "./MenuPrimitives";
import { SwitcherButton } from "./SwitcherButton";
import type { SwitcherVariant } from "@/app/src/types/shared/main-layout/MainTopbarTypes";
import {
	getCompanySwitcherDescription,
	getSwitcherMenuClassName,
	joinClasses,
} from "@/app/src/ui/shared/main-layout/main-topbar/utils";

type CompanySwitcherProps = {
	activeNavigationScope: MainNavigationScope;
	availableCompanies: MainCompany[];
	canAccessMaster: boolean;
	canAccessWorkspace: boolean;
	currentCompany: MainCompany;
	isOpen: boolean;
	spotlightId?: string;
	variant?: SwitcherVariant;
	onClose: () => void;
	onSelectCompany: (companyId: string) => void;
	onSwitchToMaster: () => void;
	onSwitchToWorkspace: () => void;
	onToggle: () => void;
};

export function CompanySwitcher({
	activeNavigationScope,
	availableCompanies,
	canAccessMaster,
	canAccessWorkspace,
	currentCompany,
	isOpen,
	spotlightId,
	variant = "desktop",
	onClose,
	onSelectCompany,
	onSwitchToMaster,
	onSwitchToWorkspace,
	onToggle,
}: CompanySwitcherProps) {
	const isAdministrationActive = activeNavigationScope !== "company";
	const label =
		activeNavigationScope === "master"
			? "Master Control"
			: activeNavigationScope === "workspace"
				? "Workspace"
				: activeNavigationScope === "account"
					? "Account"
					: currentCompany.name;
	const hasAdministrationOptions = canAccessMaster || canAccessWorkspace;

	return (
		<div
			className={joinClasses(
				"relative min-w-0",
				variant === "desktop"
					? "min-w-36 max-w-52 flex-1 basis-0 lg:max-w-56 xl:max-w-60"
					: "w-full",
			)}
			data-main-switcher-root
			data-spotlight-id={spotlightId}
		>
			<button
				type="button"
				onClick={onToggle}
				aria-label="Switch company"
				aria-expanded={isOpen}
				className={joinClasses(
					"flex h-10 w-full min-w-0 items-center gap-2 border border-darknavy/10 bg-white px-3 text-left text-sm shadow-sm transition-all duration-200 ease-out hover:border-skyblue/45 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35 motion-reduce:transition-none motion-reduce:active:scale-100",
					variant === "mobile" ? "rounded-full" : "rounded-md",
				)}
			>
				{isAdministrationActive ? (
					<LayoutDashboard
						className="h-4 w-4 shrink-0 text-darknavy/55"
						aria-hidden="true"
					/>
				) : currentCompany.logoUrl ? (
					<ImageSwatch
						imageUrl={currentCompany.logoUrl}
						className="h-5 w-5 rounded"
					/>
				) : (
					<Building2
						className="h-4 w-4 shrink-0 text-darknavy/55"
						aria-hidden="true"
					/>
				)}
				<span className="min-w-0 flex-1 truncate font-semibold text-darknavy">
					{label}
				</span>
				<ChevronDown
					className="h-4 w-4 shrink-0 text-darknavy/45"
					aria-hidden="true"
				/>
			</button>

			{isOpen ? (
				<div className={getSwitcherMenuClassName(variant)}>
					<div className="max-h-[min(24rem,calc(100vh-8rem))] space-y-1.5 overflow-y-auto overscroll-contain p-2">
						{hasAdministrationOptions ? (
							<>
								{canAccessMaster ? (
									<SwitcherButton
										description="Platform administration"
										icon={LayoutDashboard}
										isActive={
											activeNavigationScope === "master"
										}
										label="Master Control"
										onClick={() => {
											onSwitchToMaster();
											onClose();
										}}
									/>
								) : null}
								{canAccessWorkspace ? (
									<SwitcherButton
										description="Company administration"
										icon={LayoutDashboard}
										isActive={
											activeNavigationScope ===
											"workspace"
										}
										label="Workspace"
										onClick={() => {
											onSwitchToWorkspace();
											onClose();
										}}
									/>
								) : null}
								<MenuSeparator />
							</>
						) : null}

						{availableCompanies.map((company) => (
							<SwitcherButton
								key={company.id}
								description={getCompanySwitcherDescription(
									company,
								)}
								icon={Building2}
								imageUrl={company.logoUrl}
								isActive={
									!isAdministrationActive &&
									company.id === currentCompany.id
								}
								label={company.name}
								status={company.status}
								onClick={() => {
									onSelectCompany(company.id);
									onClose();
								}}
							/>
						))}
					</div>
				</div>
			) : null}
		</div>
	);
}
