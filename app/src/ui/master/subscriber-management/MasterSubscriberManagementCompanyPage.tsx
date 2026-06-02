"use client";

import {
	useMemo,
	useState,
	type ChangeEvent,
	type ComponentPropsWithoutRef,
	type FormEvent,
	type InputHTMLAttributes,
	type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
	type PaginationState,
	type SortingState,
} from "@tanstack/react-table";
import {
	ArrowRight,
	Building2,
	CalendarDays,
	Check,
	CheckCircle2,
	CreditCard,
	Database,
	Download,
	Edit3,
	ExternalLink,
	FileText,
	Filter,
	Folder,
	GitBranch,
	Info,
	Mail,
	MapPin,
	MoreVertical,
	Plus,
	Save,
	Search,
	Send,
	Trash2,
	ToggleLeft,
	ToggleRight,
	Upload,
	Users,
	X,
	type LucideIcon,
} from "lucide-react";
import {
	MasterSubscriberManagementBranchStatusOptions,
	MasterSubscriberManagementBranchTypeOptions,
	MasterSubscriberManagementCompanySections,
	MasterSubscriberManagementSubscriptionPlanOptions,
	MasterSubscriberManagementUserStatusOptions,
	type MasterSubscriberManagementSubscriptionBillingCycle,
	type MasterSubscriberManagementSubscriptionPlanOption,
	getMasterSubscriberManagementBranchAddHref,
	getMasterSubscriberManagementBranchEditHref,
	getMasterSubscriberManagementCompanyInformationEditHref,
	getMasterSubscriberManagementSectionHref,
	getMasterSubscriberManagementUserAddHref,
	getMasterSubscriberManagementUserEditHref,
	getMasterSubscriberManagementUserViewHref,
} from "@/app/src/constants/master/subscriber-management/MasterSubscriberManagementConstants";
import {
	FormatOnboardingReportDateLabel,
	GetSyncedReportEndDate,
	GetSyncedReportStartDate,
	OnboardingNonIndividualTypeOptions,
} from "@/app/src/data/onboarding/OnboardingData";
import {
	DefaultPhilippineContactNumber,
	FormatPhilippineContactNumber,
	PhilippineContactNumberPlaceholder,
} from "@/app/src/data/shared/contact/ContactData";
import { FormatTinNumber } from "@/app/src/data/shared/tax/TaxData";
import {
	createMasterSubscriberManagementBranchFormValues,
	MasterSubscriberManagementActivities,
	MasterSubscriberManagementInvoices,
	MasterSubscriberManagementStorageBranches,
	MasterSubscriberManagementStorageBreakdown,
	getMasterSubscriberManagementCompaniesForSubscriber,
	getMasterSubscriberManagementCompany,
	getMasterSubscriberManagementSubscriber,
} from "@/app/src/data/master/subscriber-management/MasterSubscriberManagementData";
import type {
	MasterSubscriberManagementBranchFormErrors,
	MasterSubscriberManagementBranchFormValues,
	MasterSubscriberManagementBranchRecord,
	MasterSubscriberManagementBranchStatus,
	MasterSubscriberManagementBranchType,
	MasterSubscriberManagementCompanyRecord,
	MasterSubscriberManagementCompanySection,
	MasterSubscriberManagementTaxpayerType,
	MasterSubscriberManagementUserRecord,
	MasterSubscriberManagementUserStatus,
} from "@/app/src/types/master/subscriber-management/MasterSubscriberManagementTypes";
import { validateMasterSubscriberManagementBranchForm } from "@/app/src/validations/master/subscriber-management/MasterSubscriberManagementValidation";
import {
	MasterBranchStatusBadge,
	MasterBranchTypeBadge,
	MasterCompanyStatusBadge,
	MasterSubscriberIcon,
	MasterSubscriberInitialsAvatar,
	MasterUserStatusBadge,
} from "@/app/src/ui/master/subscriber-management/MasterSubscriberManagementBadges";
import { MasterSubscriberAccountTabBar } from "@/app/src/ui/master/subscriber-management/MasterSubscriberAccountTabBar";
import { MasterSubscriberProfileHeader } from "@/app/src/ui/master/subscriber-management/MasterSubscriberProfileHeader";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import {
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { ModuleActionMenu } from "@/app/src/ui/shared/module/ModuleActionMenu";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type MasterSubscriberBranchTableColumnKey = keyof Pick<
	MasterSubscriberManagementBranchRecord,
	"addedOn" | "address" | "name" | "status" | "users"
>;

type MasterSubscriberUserTableColumnKey =
	| keyof Pick<
		MasterSubscriberManagementUserRecord,
		"addedOn" | "email" | "name" | "status"
	>
	| "branchAccess"
	| "lastActive";

type MasterSubscriberSubscriptionPlanDisplay =
	MasterSubscriberManagementSubscriptionPlanOption & {
		amount: string;
		billingCycle: MasterSubscriberManagementSubscriptionBillingCycle;
	};

type MasterSubscriberSubscriptionPlanState = {
	companyId: string;
	currentPlan: MasterSubscriberSubscriptionPlanDisplay;
	isChangePlanDrawerOpen: boolean;
	pendingBillingCycle: MasterSubscriberManagementSubscriptionBillingCycle;
	pendingPlanId: string;
};

const MasterSubscriberBranchPaginationStorageKey =
	"master-subscriber-management-branches";
const MasterSubscriberUserPaginationStorageKey =
	"master-subscriber-management-users";

const MasterSubscriberBranchTableColumns = [
	{ key: "name", label: "Branch Name", className: "w-[18rem]" },
	{ key: "address", label: "Address", className: "w-[28rem]" },
	{ key: "users", label: "Users", className: "w-[8rem]" },
	{ key: "status", label: "Status", className: "w-[10rem]" },
	{ key: "addedOn", label: "Added On", className: "w-[12rem]" },
	{ label: "Actions", className: "w-[9rem] text-center" },
] as const satisfies readonly (
	| {
		className: string;
		key: MasterSubscriberBranchTableColumnKey;
		label: string;
	}
	| { className: string; label: string }
)[];

const MasterSubscriberUserTableColumns = [
	{ key: "name", label: "User", className: "w-[18rem]" },
	{ key: "email", label: "Email", className: "w-[18rem]" },
	{ key: "branchAccess", label: "Branch Access", className: "w-[18rem]" },
	{ key: "status", label: "Status", className: "w-[10rem]" },
	{ key: "lastActive", label: "Last Active", className: "w-[12rem]" },
	{ key: "addedOn", label: "Added On", className: "w-[12rem]" },
	{ label: "Actions", className: "w-[13rem] text-center" },
] as const satisfies readonly (
	| {
		className: string;
		key: MasterSubscriberUserTableColumnKey;
		label: string;
	}
	| { className: string; label: string }
)[];

export function MasterSubscriberManagementCompanyPage({
	branchDrawerMode,
	branchId,
	companyId,
	isEditingCompanyInformation = false,
	recordId,
	section,
	userDrawerMode,
	userId,
}: {
	branchDrawerMode?: "add" | "edit";
	branchId?: string;
	companyId?: string;
	isEditingCompanyInformation?: boolean;
	recordId: string;
	section: MasterSubscriberManagementCompanySection;
	userDrawerMode?: "add" | "edit" | "view";
	userId?: string;
}) {
	const subscriber = getMasterSubscriberManagementSubscriber(recordId);
	const companies =
		getMasterSubscriberManagementCompaniesForSubscriber(recordId);
	const company = getMasterSubscriberManagementCompany(recordId, companyId);

	return (
		<section className="grid gap-5">
			<MasterSubscriberProfileHeader subscriber={subscriber} />
			<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5">
				<MasterSubscriberAccountTabBar
					activeTab={section === "users" ? "users" : "company-information"}
					companyId={company.id}
					recordId={subscriber.id}
					showBottomBorder={false}
				/>
			</div>
			<div className="grid gap-4 xl:grid-cols-[22rem_minmax(0,1fr)]">
				<SubscriberCompanySidebar
					companies={companies}
					recordId={subscriber.id}
					selectedCompanyId={company.id}
				/>
				<div className="min-w-0 rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5">
					<CompanyPanelHeader
						company={company}
						isEditingCompanyInformation={isEditingCompanyInformation}
						recordId={subscriber.id}
						section={section}
					/>
					<CompanySectionTabs
						activeSection={section}
						company={company}
						recordId={subscriber.id}
					/>
					<div className="p-4 xl:p-5">
						{section === "company-information" && isEditingCompanyInformation ? (
							<CompanyInformationEditSection
								key={company.id}
								company={company}
								recordId={subscriber.id}
							/>
						) : null}
						{section === "company-information" && !isEditingCompanyInformation ? (
							<CompanyInformationSection company={company} />
						) : null}
						{section === "subscription-and-plan" ? (
							<SubscriptionPlanSection company={company} />
						) : null}
						{section === "branches" ? (
							<BranchesSection
								branchDrawerMode={branchDrawerMode}
								branchId={branchId}
								company={company}
								recordId={subscriber.id}
							/>
						) : null}
						{section === "users" ? (
							<UsersSection
								company={company}
								recordId={subscriber.id}
								userDrawerMode={userDrawerMode}
								userId={userId}
							/>
						) : null}
						{section === "storage" ? (
							<StorageSection company={company} />
						) : null}
						{section === "billing-and-invoices" ? (
							<BillingInvoicesSection />
						) : null}
					</div>
				</div>
			</div>
		</section>
	);
}

function SubscriberCompanySidebar({
	companies,
	recordId,
	selectedCompanyId,
}: {
	companies: MasterSubscriberManagementCompanyRecord[];
	recordId: string;
	selectedCompanyId: string;
}) {
	const [companySearch, setCompanySearch] = useState("");
	const tones = ["blue", "orange", "cyan", "orange", "purple"] as const;
	const filteredCompanies = useMemo(() => {
		const query = companySearch.trim().toLowerCase();

		if (!query) {
			return companies;
		}

		return companies.filter((company) =>
			company.name.toLowerCase().includes(query),
		);
	}, [companies, companySearch]);
	const showingFrom = filteredCompanies.length > 0 ? 1 : 0;

	return (
		<aside className="flex max-h-[calc(100vh-12rem)] min-h-[34rem] flex-col overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5">
			<div className="shrink-0 p-4 pb-3">
				<h2 className="text-lg font-semibold text-darknavy">Companies</h2>
				<label className="relative mt-4 block">
					<span className="sr-only">Search company name</span>
					<Search
						className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/45"
						aria-hidden="true"
					/>
					<input
						className="h-11 w-full rounded-lg border border-darknavy/10 bg-white pl-11 pr-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-[rgb(var(--skyblue-rgb)/0.45)] focus:ring-4 focus:ring-[rgb(var(--skyblue-rgb)/0.16)]"
						onChange={(event) => setCompanySearch(event.target.value)}
						placeholder="Search company name..."
						value={companySearch}
					/>
				</label>
			</div>
			<div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
				<div className="grid gap-3">
					{filteredCompanies.map((company, index) => (
						<Link
							key={company.id}
							href={getMasterSubscriberManagementSectionHref(
								recordId,
								"company-information",
								company.id,
							)}
							className={joinClasses(
								"flex items-center gap-3 rounded-lg border p-3 transition",
								company.id === selectedCompanyId
									? "border-[var(--skyblue)] bg-skyblue/10"
									: "border-darknavy/10 bg-white hover:bg-skyblue/10",
							)}
						>
							<MasterSubscriberIcon
								tone={tones[index] ?? "blue"}
								className="h-11 w-11"
							/>
							<span className="min-w-0 flex-1">
								<span className="block truncate text-sm font-bold text-darknavy">
									{company.name}
								</span>
								<span className="mt-1 block text-xs font-semibold text-darknavy/65">
									{company.branchCount} Branches
									<span className="px-1.5 text-darknavy/35">.</span>
									{company.userCount} Users
								</span>
							</span>
							{company.id === selectedCompanyId ? (
								<span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--skyblue)] text-white">
									<Check className="h-3.5 w-3.5" aria-hidden="true" />
								</span>
							) : null}
						</Link>
					))}
					{filteredCompanies.length === 0 ? (
						<div className="rounded-lg border border-dashed border-darknavy/15 p-4 text-sm font-semibold text-darknavy/55">
							No companies found.
						</div>
					) : null}
				</div>
			</div>
			<div className="flex shrink-0 items-center justify-between gap-3 border-t border-darknavy/10 p-4 text-xs font-semibold text-darknavy/65">
				<span>
					Showing {showingFrom} to {filteredCompanies.length} of{" "}
					{companies.length} companies
				</span>
				<div className="flex gap-2">
					<PaginationSquare label="<" />
					<PaginationSquare active label="1" />
					<PaginationSquare label=">" />
				</div>
			</div>
		</aside>
	);
}

function CompanyPanelHeader({
	company,
	isEditingCompanyInformation,
	recordId,
	section,
}: {
	company: MasterSubscriberManagementCompanyRecord;
	isEditingCompanyInformation: boolean;
	recordId: string;
	section: MasterSubscriberManagementCompanySection;
}) {
	const companyInformationHref = getMasterSubscriberManagementSectionHref(
		recordId,
		"company-information",
		company.id,
	);
	const buttonLabel =
		isEditingCompanyInformation
			? "Cancel"
			: section === "company-information"
				? "Edit Company"
				: section === "subscription-and-plan"
					? "Edit Subscription"
					: "View Company";
	const buttonHref = isEditingCompanyInformation
		? companyInformationHref
		: section === "company-information"
			? getMasterSubscriberManagementCompanyInformationEditHref(
				recordId,
				company.id,
			)
			: companyInformationHref;

	return (
		<div className="flex flex-col gap-4 border-b border-darknavy/10 p-4 lg:flex-row lg:items-center lg:justify-between xl:p-5">
			<div className="flex min-w-0 items-center gap-4">
				<MasterSubscriberIcon tone="blue" className="h-16 w-16" />
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-3">
						<h2 className="truncate text-2xl font-semibold text-darknavy">
							{company.name}
						</h2>
						<MasterCompanyStatusBadge status={company.status} />
					</div>
					<div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-darknavy/65">
						<span>Company ID: {company.code}</span>
						<span>TIN: {company.tin}</span>
						<span>Address: {company.addressLines[0]?.replace(",", "")}</span>
					</div>
				</div>
			</div>
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
				<Link
					href={buttonHref}
					className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-darknavy/10 bg-white px-4 text-sm font-semibold text-[var(--skyblue)] shadow-sm shadow-darknavy/5 transition hover:bg-skyblue/10"
				>
					{buttonLabel === "Cancel" ? (
						<X className="h-4 w-4" aria-hidden="true" />
					) : buttonLabel === "View Company" ? (
						<ExternalLink className="h-4 w-4" aria-hidden="true" />
					) : (
						<Edit3 className="h-4 w-4" aria-hidden="true" />
					)}
					{buttonLabel}
				</Link>
				{isEditingCompanyInformation ? (
					<button
						type="submit"
						form={getCompanyInformationEditFormId(company.id)}
						className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[var(--skyblue)] bg-[var(--skyblue)] px-4 text-sm font-semibold text-white shadow-sm shadow-[rgb(var(--skyblue-rgb)/0.18)] transition hover:opacity-90"
					>
						<Save className="h-4 w-4" aria-hidden="true" />
						Save Changes
					</button>
				) : null}
			</div>
		</div>
	);
}

function CompanySectionTabs({
	activeSection,
	company,
	recordId,
}: {
	activeSection: MasterSubscriberManagementCompanySection;
	company: MasterSubscriberManagementCompanyRecord;
	recordId: string;
}) {
	return (
		<nav className="flex overflow-x-auto border-b border-darknavy/10 px-4 xl:px-5">
			{MasterSubscriberManagementCompanySections.map((section) => {
				const Icon = section.icon;
				const isActive = section.key === activeSection;
				const label =
					section.key === "branches"
						? `Branches (${company.branchCount})`
						: section.key === "users"
							? `Users (${company.userCount})`
							: section.label;

				return (
					<Link
						key={section.key}
						href={getMasterSubscriberManagementSectionHref(
							recordId,
							section.key,
							company.id,
						)}
						className={joinClasses(
							"relative inline-flex h-14 min-w-max items-center gap-2 px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--skyblue-rgb)/0.2)]",
							isActive
								? "text-[var(--skyblue)]"
								: "text-darknavy/70 hover:text-darknavy",
						)}
					>
						<Icon className="h-4 w-4" aria-hidden="true" />
						{label}
						{isActive ? (
							<span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[var(--skyblue)]" />
						) : null}
					</Link>
				);
			})}
		</nav>
	);
}

function CompanyInformationSection({
	company,
}: {
	company: MasterSubscriberManagementCompanyRecord;
}) {
	const satelliteBranchCount = Math.max(company.branchCount - 1, 0);
	const taxpayerType = getCompanyTaxpayerType(company);
	const isIndividual = taxpayerType === "individual";

	return (
		<div className="grid gap-4">
			<div className="grid gap-4 xl:grid-cols-3">
				<CompactMetric
					icon={MapPin}
					label="Total Branches"
					value={String(company.branchCount)}
					tone="emerald"
				/>
				<CompactMetric
					icon={GitBranch}
					label="Satellite Branches"
					value={String(satelliteBranchCount)}
					tone="blue"
				/>
				<CompactMetric
					icon={Users}
					label="Total Users"
					value={String(company.userCount)}
					tone="purple"
				/>
			</div>
			<Panel title="Company Information">
				<div className="grid gap-3">
					<DetailRow
						label="Taxpayer Type"
						value={formatCompanyTaxpayerType(taxpayerType)}
					/>
					{isIndividual ? (
						<>
							<DetailRow label="Last Name" value={company.lastName || "-"} />
							<DetailRow label="First Name" value={company.firstName || "-"} />
							<DetailRow
								label="Middle Name"
								value={company.middleName || "-"}
							/>
						</>
					) : (
						<DetailRow label="Company Name" value={company.name} />
					)}
					{isIndividual ? null : (
						<DetailRow
							label="Industry"
							value={formatCompanyIndustry(company)}
						/>
					)}
					<DetailRow label="Contact Email" value={company.contactEmail} />
					<DetailRow label="Contact No." value={company.contactNumber} />
					<DetailRow label="TIN" value={company.tin} />
					<DetailRow label="Address" value={formatCompanyAddress(company)} />
					<DetailRow label="Website" value={company.website} link />
					<DetailRow label="Date Added" value={company.dateAdded} />
					<DetailRow
						label="Status"
						value={<MasterCompanyStatusBadge status={company.status} />}
					/>
				</div>
			</Panel>
			<Panel title="Reporting Period" icon={CalendarDays}>
				<div className="grid gap-4 md:grid-cols-2">
					<DetailRow
						label="Report Start Date"
						value={formatCompanyReportDate(company.reportStartDate)}
					/>
					<DetailRow
						label="Report End Date"
						value={formatCompanyReportDate(company.reportEndDate)}
					/>
				</div>
			</Panel>
			<Panel title="Current Plan" icon={CreditCard}>
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					<DetailRow label="Plan Name" value={company.planName} />
					<DetailRow label="Billing Cycle" value={company.billingCycle} />
					<DetailRow label="Status" value={<MasterCompanyStatusBadge status="Active" />} />
					<DetailRow label="Payment Status" value={<PaidBadge />} />
					<DetailRow label="Plan Start Date" value={company.planStartDate} />
					<DetailRow
						label="Next Renewal Date"
						value={`${company.nextRenewalDate} (${company.nextRenewalHelper})`}
					/>
					<DetailRow label="Amount" value={company.amount} />
				</div>
			</Panel>
			<RecentActivityPanel />
		</div>
	);
}

function SubscriptionPlanSection({
	company,
}: {
	company: MasterSubscriberManagementCompanyRecord;
}) {
	const fallbackPlan = createSubscriptionPlanDisplay(company);
	const [planState, setPlanState] =
		useState<MasterSubscriberSubscriptionPlanState>(() => ({
			companyId: company.id,
			currentPlan: fallbackPlan,
			isChangePlanDrawerOpen: false,
			pendingBillingCycle: fallbackPlan.billingCycle,
			pendingPlanId: getSelectableSubscriptionPlanId(fallbackPlan.id),
		}));
	const isPlanStateCurrent = planState.companyId === company.id;
	const currentPlan = isPlanStateCurrent
		? planState.currentPlan
		: fallbackPlan;
	const pendingPlanId = isPlanStateCurrent
		? planState.pendingPlanId
		: getSelectableSubscriptionPlanId(fallbackPlan.id);
	const pendingBillingCycle = isPlanStateCurrent
		? planState.pendingBillingCycle
		: fallbackPlan.billingCycle;
	const isChangePlanDrawerOpen =
		isPlanStateCurrent && planState.isChangePlanDrawerOpen;
	const storageUsagePercent = getUsagePercent(
		company.storageUsedGb,
		company.storageTotalGb,
	);
	const pendingPlanOption =
		getSubscriptionPlanOptionById(pendingPlanId) ??
		MasterSubscriberManagementSubscriptionPlanOptions[0];
	const pendingPlan = createSubscriptionPlanDisplayFromOption(
		pendingPlanOption,
		pendingBillingCycle,
	);

	function openChangePlanDrawer() {
		setPlanState({
			companyId: company.id,
			currentPlan,
			isChangePlanDrawerOpen: true,
			pendingBillingCycle: currentPlan.billingCycle,
			pendingPlanId: getSelectableSubscriptionPlanId(currentPlan.id),
		});
	}

	function applyPendingPlan() {
		setPlanState({
			companyId: company.id,
			currentPlan: pendingPlan,
			isChangePlanDrawerOpen: false,
			pendingBillingCycle,
			pendingPlanId: pendingPlan.id,
		});
	}

	function closeChangePlanDrawer() {
		setPlanState((current) =>
			current.companyId === company.id
				? {
					...current,
					isChangePlanDrawerOpen: false,
				}
				: current,
		);
	}

	function selectPendingPlan(planId: string) {
		setPlanState((current) =>
			current.companyId === company.id
				? {
					...current,
					pendingPlanId: planId,
				}
				: {
					companyId: company.id,
					currentPlan,
					isChangePlanDrawerOpen: true,
					pendingBillingCycle,
					pendingPlanId: planId,
				},
		);
	}

	function selectPendingBillingCycle(
		billingCycle: MasterSubscriberManagementSubscriptionBillingCycle,
	) {
		setPlanState((current) =>
			current.companyId === company.id
				? {
					...current,
					pendingBillingCycle: billingCycle,
				}
				: {
					companyId: company.id,
					currentPlan,
					isChangePlanDrawerOpen: true,
					pendingBillingCycle: billingCycle,
					pendingPlanId,
				},
		);
	}

	return (
		<div className="grid gap-4">
			<Panel title="Current Plan">
				<div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
					<div className="flex gap-4">
						<span className="flex h-14 w-14 items-center justify-center rounded-lg bg-purple-500/12 text-purple-700">
							<Database className="h-7 w-7" aria-hidden="true" />
						</span>
						<div>
							<div className="flex flex-wrap items-center gap-2">
								<h3 className="text-base font-bold text-darknavy">
									{currentPlan.name}
								</h3>
								<span className="rounded-md bg-purple-500/12 px-2 py-1 text-xs font-bold text-purple-700">
									Current Plan
								</span>
							</div>
							<p className="mt-3 max-w-sm text-sm font-medium leading-6 text-darknavy/65">
								{currentPlan.description}
							</p>
						</div>
					</div>
					<div className="grid gap-4 md:grid-cols-2">
						<IconDetail icon={GitBranch} label="Billing Cycle" value={currentPlan.billingCycle} />
						<IconDetail
							icon={Edit3}
							label="Status"
							value={<MasterCompanyStatusBadge status={company.status} />}
						/>
						<IconDetail icon={CalendarDays} label="Plan Start Date" value={company.planStartDate} />
						<IconDetail
							icon={CalendarDays}
							label="Next Renewal Date"
							value={`${company.nextRenewalDate} (${company.nextRenewalHelper})`}
						/>
						<IconDetail icon={CreditCard} label="Payment Status" value={<PaidBadge />} />
						<IconDetail icon={Database} label="Amount" value={currentPlan.amount} />
					</div>
				</div>
			</Panel>
			<Panel
				title="Plan Usage"
				actions={<SmallButton>View Usage Details</SmallButton>}
				description="Current branch, employee, and storage usage for this company."
			>
				<div className="grid gap-5 lg:grid-cols-3">
					<UsageCount
						icon={MapPin}
						label="Branches"
						helper="Current branches"
						tone="emerald"
						value={String(company.branchCount)}
					/>
					<UsageCount
						icon={Users}
						label="Employees"
						helper="Current employees"
						tone="purple"
						value={String(company.userCount)}
					/>
					<UsageMeter
						colorClassName="bg-orange-500"
						icon={Database}
						label="Storage"
						percent={storageUsagePercent}
						value={`${formatStorageGb(
							company.storageUsedGb,
						)} / ${formatStorageGb(company.storageTotalGb)}`}
					/>
				</div>
			</Panel>
			<div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
				<PlanFeaturesPanel />
				<PlanHistoryPanel />
			</div>
			<div className="flex flex-col gap-3 rounded-lg border border-skyblue/20 bg-skyblue/10 p-4 text-sm font-semibold text-darknavy/72 sm:flex-row sm:items-center sm:justify-between">
				<span className="inline-flex items-center gap-2">
					<Info className="h-4 w-4 text-[var(--skyblue)]" aria-hidden="true" />
					Need to change your plan? You can upgrade, downgrade, or cancel your subscription anytime.
				</span>
				<SmallButton onClick={openChangePlanDrawer}>Change Plan</SmallButton>
			</div>
			<ChangeSubscriptionPlanDrawer
				currentBillingCycle={currentPlan.billingCycle}
				currentPlanId={currentPlan.id}
				isOpen={isChangePlanDrawerOpen}
				onApply={applyPendingPlan}
				onClose={closeChangePlanDrawer}
				onSelectBillingCycle={selectPendingBillingCycle}
				onSelectPlan={selectPendingPlan}
				pendingBillingCycle={pendingBillingCycle}
				pendingPlanId={pendingPlanId}
			/>
		</div>
	);
}

function ChangeSubscriptionPlanDrawer({
	currentBillingCycle,
	currentPlanId,
	isOpen,
	onApply,
	onClose,
	onSelectBillingCycle,
	onSelectPlan,
	pendingBillingCycle,
	pendingPlanId,
}: {
	currentBillingCycle: MasterSubscriberManagementSubscriptionBillingCycle;
	currentPlanId: string;
	isOpen: boolean;
	onApply: () => void;
	onClose: () => void;
	onSelectBillingCycle: (
		billingCycle: MasterSubscriberManagementSubscriptionBillingCycle,
	) => void;
	onSelectPlan: (planId: string) => void;
	pendingBillingCycle: MasterSubscriberManagementSubscriptionBillingCycle;
	pendingPlanId: string;
}) {
	const isCurrentSelection =
		currentPlanId === pendingPlanId && currentBillingCycle === pendingBillingCycle;

	return (
		<ModuleDrawer
			description="Select the subscription plan and billing cycle to apply to this company."
			eyebrow="Subscription plan"
			footer={
				<div className="flex flex-col justify-end gap-2 sm:flex-row">
					<button
						type="button"
						onClick={onClose}
						className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-darknavy/10 bg-white px-4 text-sm font-bold text-darknavy/70 shadow-sm shadow-darknavy/5 transition hover:bg-skyblue/10"
					>
						<X className="h-4 w-4" aria-hidden="true" />
						Cancel
					</button>
					<button
						type="button"
						disabled={isCurrentSelection}
						onClick={onApply}
						className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--skyblue)] bg-[var(--skyblue)] px-4 text-sm font-bold text-white shadow-sm shadow-[rgb(var(--skyblue-rgb)/0.18)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<Check className="h-4 w-4" aria-hidden="true" />
						Apply Plan
					</button>
				</div>
			}
			isOpen={isOpen}
			maxWidthClassName="max-w-2xl"
			onClose={onClose}
			title="Change Plan"
		>
			<div className="grid gap-3 p-6">
				<div>
					<p className="mb-2 text-sm font-semibold text-darknavy/62">
						Billing Cycle
					</p>
					<div className="grid grid-cols-2 overflow-hidden rounded-lg border border-darknavy/10 bg-white">
						{(["Monthly", "Yearly"] as const).map((billingCycle) => {
							const isSelected = pendingBillingCycle === billingCycle;

							return (
								<button
									key={billingCycle}
									type="button"
									aria-pressed={isSelected}
									onClick={() => onSelectBillingCycle(billingCycle)}
									className={joinClasses(
										"h-11 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgb(var(--skyblue-rgb)/0.16)]",
										billingCycle === "Yearly" && "border-l border-darknavy/10",
										isSelected
											? "bg-[var(--skyblue)] text-white"
											: "bg-white text-darknavy/70 hover:bg-skyblue/10",
									)}
								>
									{billingCycle}
								</button>
							);
						})}
					</div>
				</div>
				{MasterSubscriberManagementSubscriptionPlanOptions.map((plan) => {
					const isSelected = pendingPlanId === plan.id;
					const isCurrent = currentPlanId === plan.id;
					const displayedAmount = getSubscriptionPlanAmount(
						plan,
						pendingBillingCycle,
					);

					return (
						<button
							key={plan.id}
							type="button"
							aria-pressed={isSelected}
							onClick={() => onSelectPlan(plan.id)}
							className={joinClasses(
								"rounded-lg border p-4 text-left shadow-sm transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgb(var(--skyblue-rgb)/0.16)]",
								isSelected
									? "border-[var(--skyblue)] bg-skyblue/10"
									: "border-darknavy/10 bg-white hover:bg-offwhite",
							)}
						>
							<span className="flex flex-wrap items-start justify-between gap-3">
								<span className="min-w-0">
									<span className="block text-base font-bold text-darknavy">
										{plan.name}
									</span>
									<span className="mt-1 block text-sm font-semibold text-darknavy/62">
										{plan.description}
									</span>
								</span>
								<span className="text-right">
									<span className="block text-sm font-bold text-darknavy">
										{displayedAmount}
									</span>
									<span className="mt-1 block text-xs font-semibold uppercase text-darknavy/45">
										{pendingBillingCycle}
									</span>
								</span>
							</span>
							<span className="mt-3 grid gap-1 text-xs font-semibold text-darknavy/55 sm:grid-cols-2">
								<span>Monthly: {plan.monthlyAmount}</span>
								<span>Yearly: {plan.yearlyAmount}</span>
							</span>
							<span className="mt-4 flex flex-wrap gap-2">
								{isCurrent && currentBillingCycle === pendingBillingCycle ? (
									<span className="rounded-md bg-emerald-500/14 px-2 py-1 text-xs font-bold text-emerald-700">
										Current
									</span>
								) : null}
								{isSelected ? (
									<span className="rounded-md bg-skyblue/14 px-2 py-1 text-xs font-bold text-blue-700">
										Selected
									</span>
								) : null}
							</span>
						</button>
					);
				})}
			</div>
		</ModuleDrawer>
	);
}

function BranchesSection({
	branchDrawerMode,
	branchId,
	company,
	recordId,
}: {
	branchDrawerMode?: "add" | "edit";
	branchId?: string;
	company: MasterSubscriberManagementCompanyRecord;
	recordId: string;
}) {
	const [branchSearch, setBranchSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<
		MasterSubscriberManagementBranchStatus | "All"
	>("All");
	const [typeFilter, setTypeFilter] = useState<
		MasterSubscriberManagementBranchType | "All"
	>("All");
	const [branchStatusOverrides, setBranchStatusOverrides] = useState<
		Record<string, MasterSubscriberManagementBranchStatus>
	>({});
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "name", desc: false },
	]);
	const branches = useMemo(
		() =>
			createCompanyBranchRows(company).map((branch) => ({
				...branch,
				status: branchStatusOverrides[branch.id] ?? branch.status,
			})),
		[branchStatusOverrides, company],
	);
	const activeBranches = branches.filter(
		(branch) => branch.status === "Active",
	).length;
	const inactiveBranches = branches.length - activeBranches;
	const satelliteBranches = branches.filter(
		(branch) => branch.type === "Satellite",
	).length;
	const filteredBranches = useMemo(() => {
		const query = branchSearch.trim().toLowerCase();

		return branches.filter((branch) => {
			const matchesSearch =
				!query ||
				branch.name.toLowerCase().includes(query) ||
				branch.address.toLowerCase().includes(query);
			const matchesStatus =
				statusFilter === "All" || branch.status === statusFilter;
			const matchesType = typeFilter === "All" || branch.type === typeFilter;

			return matchesSearch && matchesStatus && matchesType;
		});
	}, [branches, branchSearch, statusFilter, typeFilter]);
	const columns = useMemo<ColumnDef<MasterSubscriberManagementBranchRecord>[]>(
		() =>
			MasterSubscriberBranchTableColumns.map((column) => {
				if (!("key" in column)) {
					return createActionColumn(column.label, column.className);
				}

				return createBranchColumn(column.key, column.label, column.className);
			}),
		[],
	);
	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		data: filteredBranches,
		columns,
		state: {
			pagination,
			sorting,
		},
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});
	const selectedBranch = branchId
		? branches.find((branch) => branch.id === branchId)
		: undefined;

	function resetFilters() {
		setBranchSearch("");
		setStatusFilter("All");
		setTypeFilter("All");
		table.setPageIndex(0);
	}

	function updateBranchSearch(value: string) {
		setBranchSearch(value);
		table.setPageIndex(0);
	}

	function updateBranchStatusFilter(
		status: MasterSubscriberManagementBranchStatus | "All",
	) {
		setStatusFilter(status);
		table.setPageIndex(0);
	}

	function updateBranchTypeFilter(
		type: MasterSubscriberManagementBranchType | "All",
	) {
		setTypeFilter(type);
		table.setPageIndex(0);
	}

	function updateBranchStatus(
		branch: MasterSubscriberManagementBranchRecord,
		status: MasterSubscriberManagementBranchStatus,
	) {
		setBranchStatusOverrides((current) => ({
			...current,
			[branch.id]: status,
		}));
	}

	return (
		<div className="grid gap-4">
			<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
				<CompactMetric icon={Building2} label="Total Branches" value={String(company.branchCount)} tone="blue" />
				<CompactMetric icon={GitBranch} label="Satellite Branches" value={String(satelliteBranches)} tone="purple" />
				<CompactMetric icon={CheckCircle2} label="Active Branches" value={String(activeBranches)} tone="emerald" />
				<CompactMetric icon={Building2} label="Inactive Branches" value={String(inactiveBranches)} tone="orange" />
				<CompactMetric icon={Users} label="Total Users Across Branches" value={String(company.userCount)} tone="purple" />
			</div>
			<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5">
				<ModuleTable
					emptyDescription="Try a different branch name, status, or type."
					emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
					emptyTitle="No branches found"
					minWidthClassName="min-w-[64rem]"
					paginationLabel="branches"
					paginationStorageKey={MasterSubscriberBranchPaginationStorageKey}
					table={table}
					toolbar={
						<ModuleTableToolbar className="rounded-none border-x-0 border-t-0 shadow-none md:grid-cols-[minmax(20rem,1.6fr)_minmax(10rem,0.8fr)_minmax(10rem,0.8fr)_auto_auto]">
							<ModuleTableSearch
								label="Search branches"
								onChange={updateBranchSearch}
								placeholder="Search branch name, address..."
								value={branchSearch}
							/>
							<ModuleTableFilterSelect
								label="Status"
								onChange={(value) =>
									updateBranchStatusFilter(
										value as MasterSubscriberManagementBranchStatus | "All",
									)
								}
								options={createFilterOptions(
									MasterSubscriberManagementBranchStatusOptions,
								)}
								value={statusFilter}
							/>
							<ModuleTableFilterSelect
								label="Branch Type"
								onChange={(value) =>
									updateBranchTypeFilter(
										value as MasterSubscriberManagementBranchType | "All",
									)
								}
								options={createFilterOptions(
									MasterSubscriberManagementBranchTypeOptions,
								)}
								value={typeFilter}
							/>
							<ModuleTableResetButton onClick={resetFilters}>
								Reset
							</ModuleTableResetButton>
							<Link
								href={getMasterSubscriberManagementBranchAddHref(
									recordId,
									company.id,
								)}
								className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[var(--skyblue)] bg-[var(--skyblue)] px-4 text-sm font-semibold text-white shadow-sm shadow-[rgb(var(--skyblue-rgb)/0.18)] transition hover:opacity-90"
							>
								<Plus className="h-4 w-4" aria-hidden="true" />
								Add Branch
							</Link>
						</ModuleTableToolbar>
					}
					variant="embedded"
					renderRow={({ id, original }) => (
						<BranchTableRow
							key={id}
							branch={original}
							editHref={getMasterSubscriberManagementBranchEditHref(
								recordId,
								company.id,
								original.id,
							)}
							onUpdateStatus={updateBranchStatus}
						/>
					)}
				/>
			</div>
			<MasterSubscriberBranchDrawer
				key={`${branchDrawerMode ?? "closed"}-${branchId ?? "add"}`}
				branch={selectedBranch}
				branches={branches}
				company={company}
				isOpen={Boolean(branchDrawerMode)}
				mode={branchDrawerMode ?? "add"}
				recordId={recordId}
			/>
		</div>
	);
}

function BranchTableRow({
	branch,
	editHref,
	onUpdateStatus,
}: {
	branch: MasterSubscriberManagementBranchRecord;
	editHref: string;
	onUpdateStatus: (
		branch: MasterSubscriberManagementBranchRecord,
		status: MasterSubscriberManagementBranchStatus,
	) => void;
}) {
	const nextStatus = branch.status === "Active" ? "Inactive" : "Active";

	return (
		<tr className="module-table-row">
			<td>
				<div className="flex items-center gap-3">
					<MasterSubscriberIcon tone={branch.tone} className="h-10 w-10" />
					<span>
						<span className="block font-bold text-darknavy">
							{branch.name}
						</span>
						<span className="mt-1 block">
							<MasterBranchTypeBadge type={branch.type} />
						</span>
					</span>
				</div>
			</td>
			<td className="font-semibold leading-6 text-darknavy/72">
				{branch.address}
			</td>
			<td className="font-bold text-darknavy">
				<span className="inline-flex items-center gap-2">
					<Users className="h-4 w-4 text-purple-600" aria-hidden="true" />
					{branch.users}
				</span>
			</td>
			<td>
				<MasterBranchStatusBadge status={branch.status} />
			</td>
			<td className="font-semibold text-darknavy/72">{branch.addedOn}</td>
			<td>
				<ModuleTableActions className="justify-center">
					<ModuleTableActionLink
						variant="edit"
						href={editHref}
						label={`Edit ${branch.name}`}
					/>
					<ModuleTableActionButton
						variant={nextStatus === "Inactive" ? "inactive" : "active"}
						label={`Set as ${nextStatus}`}
						onClick={() => onUpdateStatus(branch, nextStatus)}
					/>
				</ModuleTableActions>
			</td>
		</tr>
	);
}

type CompanyInformationEditValues = {
	address: string;
	contactEmail: string;
	contactNumber: string;
	firstName: string;
	industry: string;
	industryOther: string;
	lastName: string;
	middleName: string;
	name: string;
	reportEndDate: string;
	reportStartDate: string;
	status: MasterSubscriberManagementCompanyRecord["status"];
	taxpayerType: MasterSubscriberManagementTaxpayerType;
	tin: string;
	website: string;
};

type CompanyIndustryOption = (typeof OnboardingNonIndividualTypeOptions)[number];

function getCompanyInformationEditFormId(companyId: string) {
	return `master-subscriber-company-information-${companyId}-form`;
}

function CompanyInformationEditSection({
	company,
	recordId,
}: {
	company: MasterSubscriberManagementCompanyRecord;
	recordId: string;
}) {
	const [values, setValues] = useState<CompanyInformationEditValues>(() =>
		createCompanyInformationEditValues(company),
	);
	const satelliteBranchCount = Math.max(company.branchCount - 1, 0);
	const viewHref = getMasterSubscriberManagementSectionHref(
		recordId,
		"company-information",
		company.id,
	);
	const isIndividual = values.taxpayerType === "individual";
	const isOtherIndustry = values.industry === "Others";

	function updateField<Key extends keyof CompanyInformationEditValues>(
		field: Key,
		value: CompanyInformationEditValues[Key],
	) {
		setValues((current) => ({
			...current,
			[field]: value,
		}));
	}

	function updateIndustry(value: string) {
		setValues((current) => ({
			...current,
			industry: value,
			industryOther: value === "Others" ? current.industryOther : "",
		}));
	}

	function updateReportStartDate(value: string) {
		setValues((current) => ({
			...current,
			reportEndDate: GetSyncedReportEndDate(value) || current.reportEndDate,
			reportStartDate: value,
		}));
	}

	function updateReportEndDate(value: string) {
		setValues((current) => ({
			...current,
			reportEndDate: value,
			reportStartDate: GetSyncedReportStartDate(value) || current.reportStartDate,
		}));
	}

	return (
		<form
			className="grid gap-4"
			id={getCompanyInformationEditFormId(company.id)}
			onSubmit={(event) => event.preventDefault()}
		>
			<div className="grid gap-4 xl:grid-cols-3">
				<CompactMetric
					icon={MapPin}
					label="Total Branches"
					value={String(company.branchCount)}
					tone="emerald"
				/>
				<CompactMetric
					icon={GitBranch}
					label="Satellite Branches"
					value={String(satelliteBranchCount)}
					tone="blue"
				/>
				<CompactMetric
					icon={Users}
					label="Total Users"
					value={String(company.userCount)}
					tone="purple"
				/>
			</div>
			<Panel title="Edit Company Information">
				<div className="grid gap-6">
					<div className="grid gap-4">
						<CompanyEditTaxpayerTypeToggle
							value={values.taxpayerType}
							onChange={(taxpayerType) =>
								updateField("taxpayerType", taxpayerType)
							}
						/>
						{isIndividual ? (
							<div className="grid gap-4 lg:grid-cols-3">
								<CompanyEditField label="Last Name">
									<input
										className={CompanyEditInputClassName}
										name="lastName"
										onChange={(event) =>
											updateField("lastName", event.target.value)
										}
										value={values.lastName ?? ""}
									/>
								</CompanyEditField>
								<CompanyEditField label="First Name">
									<input
										className={CompanyEditInputClassName}
										name="firstName"
										onChange={(event) =>
											updateField("firstName", event.target.value)
										}
										value={values.firstName ?? ""}
									/>
								</CompanyEditField>
								<CompanyEditField label="Middle Name">
									<input
										className={CompanyEditInputClassName}
										name="middleName"
										onChange={(event) =>
											updateField("middleName", event.target.value)
										}
										value={values.middleName ?? ""}
									/>
								</CompanyEditField>
							</div>
						) : (
							<div className="grid gap-4">
								<CompanyEditField label="Company Name">
									<input
										className={CompanyEditInputClassName}
										name="name"
										onChange={(event) =>
											updateField("name", event.target.value)
										}
										value={values.name ?? ""}
									/>
								</CompanyEditField>
								<div
									className={joinClasses(
										"grid gap-4",
										isOtherIndustry ? "md:grid-cols-2" : "md:grid-cols-1",
									)}
								>
									<CompanyEditField label="Industry">
										<select
											className={CompanyEditInputClassName}
											name="industry"
											onChange={(event) =>
												updateIndustry(event.target.value)
											}
											value={values.industry ?? ""}
										>
											<option value="">Select...</option>
											{OnboardingNonIndividualTypeOptions.map((option) => (
												<option key={option} value={option}>
													{option}
												</option>
											))}
										</select>
									</CompanyEditField>
									{isOtherIndustry ? (
										<CompanyEditField label="Please Specify">
											<input
												className={CompanyEditInputClassName}
												name="industryOther"
												onChange={(event) =>
													updateField(
														"industryOther",
														event.target.value,
													)
												}
												placeholder="Specify industry"
												value={values.industryOther ?? ""}
											/>
										</CompanyEditField>
									) : null}
								</div>
							</div>
						)}
						<div className="grid gap-4 lg:grid-cols-3">
							<CompanyEditField label="Contact Email">
								<input
									className={CompanyEditInputClassName}
									name="contactEmail"
									onChange={(event) =>
										updateField("contactEmail", event.target.value)
									}
									type="email"
									value={values.contactEmail ?? ""}
								/>
							</CompanyEditField>
							<CompanyEditField label="Contact No.">
								<input
									className={CompanyEditInputClassName}
									inputMode="numeric"
									maxLength={16}
									name="contactNumber"
									onChange={(event) =>
										updateField(
											"contactNumber",
											FormatPhilippineContactNumber(
												event.target.value,
											),
										)
									}
									onFocus={() => {
										if (!values.contactNumber) {
											updateField(
												"contactNumber",
												DefaultPhilippineContactNumber,
											);
										}
									}}
									placeholder={PhilippineContactNumberPlaceholder}
									type="tel"
									value={values.contactNumber ?? ""}
								/>
							</CompanyEditField>
							<CompanyEditField label="TIN">
								<input
									className={CompanyEditInputClassName}
									inputMode="numeric"
									maxLength={15}
									name="tin"
									onChange={(event) =>
										updateField("tin", FormatTinNumber(event.target.value))
									}
									placeholder="123-456-789-000"
									value={values.tin ?? ""}
								/>
							</CompanyEditField>
						</div>
						<CompanyEditField label="Address">
							<textarea
								className={CompanyEditTextAreaClassName}
								name="address"
								onChange={(event) => updateField("address", event.target.value)}
								rows={5}
								value={values.address ?? ""}
							/>
						</CompanyEditField>
						<div className="grid gap-4 md:grid-cols-2">
							<CompanyEditField label="Website">
								<input
									className={CompanyEditInputClassName}
									name="website"
									onChange={(event) =>
										updateField("website", event.target.value)
									}
									type="url"
									value={values.website ?? ""}
								/>
							</CompanyEditField>
							<CompanyEditField label="Status">
								<select
									className={CompanyEditInputClassName}
									name="status"
									onChange={(event) =>
										updateField(
											"status",
											event.target
												.value as MasterSubscriberManagementCompanyRecord["status"],
										)
									}
									value={values.status ?? "Active"}
								>
									<option value="Active">Active</option>
									<option value="Inactive">Inactive</option>
								</select>
							</CompanyEditField>
						</div>
						<DetailRow label="Date Added" value={company.dateAdded} />
					</div>
				</div>
			</Panel>
			<Panel title="Reporting Period" icon={CalendarDays}>
				<div className="grid gap-4 md:grid-cols-2">
					<CompanyEditField label="Reporting Year Start Date">
						<input
							className={CompanyEditInputClassName}
							name="reportStartDate"
							onChange={(event) => updateReportStartDate(event.target.value)}
							type="date"
							value={values.reportStartDate}
						/>
					</CompanyEditField>
					<CompanyEditField label="Reporting Year End Date">
						<input
							className={CompanyEditInputClassName}
							name="reportEndDate"
							onChange={(event) => updateReportEndDate(event.target.value)}
							type="date"
							value={values.reportEndDate}
						/>
					</CompanyEditField>
				</div>
			</Panel>
			<Panel title="Current Plan" icon={CreditCard}>
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					<DetailRow label="Plan Name" value={company.planName} />
					<DetailRow label="Billing Cycle" value={company.billingCycle} />
					<DetailRow
						label="Status"
						value={<MasterCompanyStatusBadge status={company.status} />}
					/>
					<DetailRow label="Payment Status" value={<PaidBadge />} />
					<DetailRow label="Plan Start Date" value={company.planStartDate} />
					<DetailRow
						label="Next Renewal Date"
						value={`${company.nextRenewalDate} (${company.nextRenewalHelper})`}
					/>
					<DetailRow label="Amount" value={company.amount} />
				</div>
			</Panel>
			<div className="flex flex-col justify-end gap-3 sm:flex-row">
				<Link
					href={viewHref}
					className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy/70 shadow-sm shadow-darknavy/5 transition hover:bg-skyblue/10"
				>
					<X className="h-4 w-4" aria-hidden="true" />
					Cancel
				</Link>
				<button
					type="submit"
					className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[var(--skyblue)] bg-[var(--skyblue)] px-4 text-sm font-semibold text-white shadow-sm shadow-[rgb(var(--skyblue-rgb)/0.18)] transition hover:opacity-90"
				>
					<Save className="h-4 w-4" aria-hidden="true" />
					Save Changes
				</button>
			</div>
		</form>
	);
}

function MasterSubscriberBranchDrawer({
	branch,
	branches,
	company,
	isOpen,
	mode,
	recordId,
}: {
	branch?: MasterSubscriberManagementBranchRecord;
	branches: MasterSubscriberManagementBranchRecord[];
	company: MasterSubscriberManagementCompanyRecord;
	isOpen: boolean;
	mode: "add" | "edit";
	recordId: string;
}) {
	const router = useRouter();
	const backHref = getMasterSubscriberManagementSectionHref(
		recordId,
		"branches",
		company.id,
	);
	const formId = `master-subscriber-${company.id}-branch-${mode}-form`;
	const [values, setValues] =
		useState<MasterSubscriberManagementBranchFormValues>(() =>
			createMasterSubscriberManagementBranchFormValues(
				company,
				branches,
				branch,
			),
		);
	const [errors, setErrors] =
		useState<MasterSubscriberManagementBranchFormErrors>({});
	const mainBranchOptions = branches.filter(
		(currentBranch) => currentBranch.isMain && currentBranch.id !== branch?.id,
	);
	const isMissingEditBranch = mode === "edit" && !branch;
	const drawerTitle =
		mode === "edit"
			? branch
				? `Edit ${branch.name}`
				: "Edit Branch"
			: "Add Branch";

	function closeDrawer() {
		router.push(backHref);
	}

	function updateField<
		Key extends keyof MasterSubscriberManagementBranchFormValues,
	>(
		field: Key,
		value: MasterSubscriberManagementBranchFormValues[Key],
	) {
		setValues((current) => {
			const nextValues = {
				...current,
				[field]: value,
			};

			if (field === "type") {
				const nextType = value as MasterSubscriberManagementBranchType;

				nextValues.isMain = nextType === "Head Office";
				nextValues.linkedMainBranchId =
					nextType === "Satellite"
						? current.linkedMainBranchId || mainBranchOptions[0]?.id || ""
						: "";
			}

			return nextValues;
		});
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function handleInputChange(
		event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
	) {
		const field =
			event.target.name as keyof MasterSubscriberManagementBranchFormValues;
		const value =
			field === "tin"
				? FormatTinNumber(event.target.value)
				: field === "contactNumber"
					? FormatPhilippineContactNumber(event.target.value)
					: event.target.value;

		updateField(
			field,
			value as MasterSubscriberManagementBranchFormValues[typeof field],
		);
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const nextErrors = validateMasterSubscriberManagementBranchForm(values);

		setErrors(nextErrors);

		if (Object.keys(nextErrors).length > 0) {
			return;
		}

		closeDrawer();
	}

	return (
		<ModuleDrawer
			description={`${company.name} / ${mode === "edit" ? "Update branch details" : "Create a branch record"}`}
			eyebrow="Subscriber branch management"
			footer={
				<div className="flex flex-col justify-end gap-2 sm:flex-row">
					<button
						type="button"
						onClick={closeDrawer}
						className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-darknavy/10 bg-white px-4 text-sm font-bold text-darknavy/70 shadow-sm shadow-darknavy/5 transition hover:bg-skyblue/10"
					>
						<X className="h-4 w-4" aria-hidden="true" />
						Cancel
					</button>
					<button
						type="submit"
						form={formId}
						disabled={isMissingEditBranch}
						className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--skyblue)] bg-[var(--skyblue)] px-4 text-sm font-bold text-white shadow-sm shadow-[rgb(var(--skyblue-rgb)/0.18)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<Save className="h-4 w-4" aria-hidden="true" />
						{mode === "edit" ? "Save Changes" : "Save Branch"}
					</button>
				</div>
			}
			isOpen={isOpen}
			maxWidthClassName="max-w-3xl"
			onClose={closeDrawer}
			title={drawerTitle}
		>
			{isMissingEditBranch ? (
				<div className="p-6">
					<div className="rounded-lg border border-dashed border-darknavy/15 bg-offwhite/60 p-5 text-sm font-semibold text-darknavy/60">
						The selected branch is not available for this company.
					</div>
				</div>
			) : (
				<form
					id={formId}
					onSubmit={handleSubmit}
					className="grid gap-6 p-6"
				>
					<SubscriberBranchFormSection title="Company">
						<SubscriberBranchTextField
							isReadonly
							label="Company"
							value={company.name}
						/>
						<SubscriberBranchSelectField
							label="Status"
							name="status"
							options={MasterSubscriberManagementBranchStatusOptions}
							value={values.status}
							onChange={(value) =>
								updateField(
									"status",
									value as MasterSubscriberManagementBranchStatus,
								)
							}
						/>
					</SubscriberBranchFormSection>
					<SubscriberBranchFormSection title="Branch">
						<SubscriberBranchSelectField
							label="Branch Type"
							name="type"
							options={MasterSubscriberManagementBranchTypeOptions}
							value={values.type}
							onChange={(value) =>
								updateField(
									"type",
									value as MasterSubscriberManagementBranchType,
								)
							}
						/>
						<SubscriberBranchTextField
							error={errors.name}
							label="Name"
							name="name"
							required
							value={values.name}
							onChange={handleInputChange}
						/>
						<SubscriberBranchTextField
							error={errors.tin}
							inputMode="numeric"
							label="TIN"
							maxLength={15}
							name="tin"
							required
							value={values.tin}
							onChange={handleInputChange}
						/>
						<SubscriberBranchSelectField
							error={errors.linkedMainBranchId}
							isReadonly={values.type !== "Satellite"}
							label="Linked Main Branch"
							name="linkedMainBranchId"
							options={[
								{ label: "No linked branch", value: "" },
								...mainBranchOptions.map((currentBranch) => ({
									label: currentBranch.name,
									value: currentBranch.id,
								})),
							]}
							value={values.linkedMainBranchId}
							onChange={(value) =>
								updateField("linkedMainBranchId", value)
							}
						/>
						<label className="flex min-h-11 items-center gap-3 rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy/70 shadow-sm">
							<input
								type="checkbox"
								checked={values.isMain}
								disabled={values.type === "Satellite"}
								onChange={(event) =>
									updateField("isMain", event.target.checked)
								}
								className="h-4 w-4 rounded border-darknavy/20 text-skyblue focus:ring-skyblue/20"
							/>
							Main branch
						</label>
					</SubscriberBranchFormSection>
					<SubscriberBranchFormSection title="Contact">
						<SubscriberBranchTextField
							error={errors.email}
							label="Email"
							name="email"
							required
							type="email"
							value={values.email}
							onChange={handleInputChange}
						/>
						<SubscriberBranchTextField
							error={errors.contactNumber}
							inputMode="numeric"
							label="Contact Number"
							maxLength={16}
							name="contactNumber"
							required
							type="tel"
							value={values.contactNumber}
							onChange={handleInputChange}
							onFocus={() => {
								if (!values.contactNumber) {
									updateField(
										"contactNumber",
										DefaultPhilippineContactNumber,
									);
								}
							}}
							placeholder={PhilippineContactNumberPlaceholder}
						/>
					</SubscriberBranchFormSection>
					<SubscriberBranchTextAreaField
						error={errors.address}
						label="Address"
						name="address"
						required
						value={values.address}
						onChange={handleInputChange}
					/>
				</form>
			)}
		</ModuleDrawer>
	);
}

const SubscriberBranchControlClassName =
	"h-11 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy shadow-sm shadow-darknavy/5 outline-none transition placeholder:text-darknavy/35 focus:border-[rgb(var(--skyblue-rgb)/0.45)] focus:ring-4 focus:ring-[rgb(var(--skyblue-rgb)/0.16)] disabled:cursor-not-allowed disabled:bg-offwhite disabled:text-darknavy/45";

function SubscriberBranchFormSection({
	children,
	title,
}: {
	children: ReactNode;
	title: string;
}) {
	return (
		<section className="grid gap-4 border-b border-darknavy/10 pb-6 last:border-b-0 last:pb-0">
			<h2 className="text-sm font-semibold uppercase text-darknavy/45">
				{title}
			</h2>
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
				{children}
			</div>
		</section>
	);
}

function SubscriberBranchTextField({
	error,
	inputMode,
	isReadonly = false,
	label,
	maxLength,
	name,
	placeholder,
	required = false,
	type = "text",
	value,
	onChange,
	onFocus,
}: {
	error?: string;
	inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
	isReadonly?: boolean;
	label: string;
	maxLength?: number;
	name?: keyof MasterSubscriberManagementBranchFormValues;
	placeholder?: string;
	required?: boolean;
	type?: InputHTMLAttributes<HTMLInputElement>["type"];
	value: string;
	onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
	onFocus?: () => void;
}) {
	return (
		<label className="grid gap-2">
			<span className="text-sm font-semibold text-darknavy/62">
				{label}
			</span>
			<input
				aria-invalid={Boolean(error)}
				disabled={isReadonly}
				inputMode={inputMode}
				maxLength={maxLength}
				name={name}
				onChange={onChange}
				onFocus={onFocus}
				placeholder={placeholder}
				required={required}
				type={type}
				value={value}
				className={SubscriberBranchControlClassName}
			/>
			<FieldError message={error} />
		</label>
	);
}

function SubscriberBranchSelectField({
	error,
	isReadonly = false,
	label,
	name,
	options,
	value,
	onChange,
}: {
	error?: string;
	isReadonly?: boolean;
	label: string;
	name?: keyof MasterSubscriberManagementBranchFormValues;
	options: readonly (string | { label: string; value: string })[];
	value: string;
	onChange?: (value: string) => void;
}) {
	const resolvedOptions = options.map((option) =>
		typeof option === "string" ? { label: option, value: option } : option,
	);

	return (
		<label className="grid gap-2">
			<span className="text-sm font-semibold text-darknavy/62">
				{label}
			</span>
			<select
				aria-invalid={Boolean(error)}
				disabled={isReadonly || resolvedOptions.length === 0}
				name={name}
				onChange={(event) => onChange?.(event.target.value)}
				value={value}
				className={joinClasses(
					SubscriberBranchControlClassName,
					"app-select-control",
				)}
			>
				{resolvedOptions.length === 0 ? (
					<option value="">No options</option>
				) : null}
				{resolvedOptions.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
			<FieldError message={error} />
		</label>
	);
}

function SubscriberBranchTextAreaField({
	error,
	label,
	name,
	required = false,
	value,
	onChange,
}: {
	error?: string;
	label: string;
	name?: keyof MasterSubscriberManagementBranchFormValues;
	required?: boolean;
	value: string;
	onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
}) {
	return (
		<label className="grid gap-2">
			<span className="text-sm font-semibold text-darknavy/62">
				{label}
			</span>
			<textarea
				aria-invalid={Boolean(error)}
				className={joinClasses(SubscriberBranchControlClassName, "min-h-28 py-3")}
				name={name}
				onChange={onChange}
				required={required}
				rows={4}
				value={value}
			/>
			<FieldError message={error} />
		</label>
	);
}

function FieldError({ message }: { message?: string }) {
	if (!message) {
		return null;
	}

	return <span className="text-xs font-semibold text-coralpink">{message}</span>;
}

function UsersSection({
	company,
	recordId,
	userDrawerMode,
	userId,
}: {
	company: MasterSubscriberManagementCompanyRecord;
	recordId: string;
	userDrawerMode?: "add" | "edit" | "view";
	userId?: string;
}) {
	const [query, setQueryState] = useState("");
	const [statusFilter, setStatusFilterState] = useState<
		MasterSubscriberManagementUserStatus | "All"
	>("All");
	const [branchFilter, setBranchFilterState] = useState("All");
	const [userStatusOverrides, setUserStatusOverrides] = useState<
		Record<string, MasterSubscriberManagementUserStatus>
	>({});
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "name", desc: false },
	]);
	const users = useMemo(
		() =>
			createCompanyUserRows(company).map((user) => ({
				...user,
				status: userStatusOverrides[user.id] ?? user.status,
			})),
		[company, userStatusOverrides],
	);
	const branchOptions = useMemo(
		() =>
			Array.from(new Set(users.flatMap((user) => user.branchAccess))).sort(),
		[users],
	);
	const activeUsers = users.filter((user) => user.status === "Active").length;
	const inactiveUsers = users.filter((user) => user.status === "Inactive").length;
	const invitedUsers = users.filter((user) => user.status === "Invited").length;
	const filteredUsers = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return users.filter((user) => {
			const searchable = [
				user.name,
				user.email,
				user.phone,
				user.status,
				user.branchAccess.join(" "),
			]
				.join(" ")
				.toLowerCase();
			const matchesSearch =
				!normalizedQuery || searchable.includes(normalizedQuery);
			const matchesStatus =
				statusFilter === "All" || user.status === statusFilter;
			const matchesBranch =
				branchFilter === "All" || user.branchAccess.includes(branchFilter);

			return matchesSearch && matchesStatus && matchesBranch;
		});
	}, [branchFilter, query, statusFilter, users]);
	const columns = useMemo<ColumnDef<MasterSubscriberManagementUserRecord>[]>(
		() =>
			MasterSubscriberUserTableColumns.map((column) => {
				if (!("key" in column)) {
					return createActionColumn(column.label, column.className);
				}

				return createUserColumn(column.key, column.label, column.className);
			}),
		[],
	);
	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		data: filteredUsers,
		columns,
		state: {
			pagination,
			sorting,
		},
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});
	const selectedUser = userId
		? users.find((user) => user.id === userId)
		: undefined;
	const availableBranches = useMemo(
		() => createCompanyBranchRows(company),
		[company],
	);

	function resetFilters() {
		setQueryState("");
		setStatusFilterState("All");
		setBranchFilterState("All");
		table.setPageIndex(0);
	}

	function updateQuery(value: string) {
		setQueryState(value);
		table.setPageIndex(0);
	}

	function updateStatusFilter(
		status: MasterSubscriberManagementUserStatus | "All",
	) {
		setStatusFilterState(status);
		table.setPageIndex(0);
	}

	function updateBranchFilter(branch: string) {
		setBranchFilterState(branch);
		table.setPageIndex(0);
	}

	function sendInvitation(user: MasterSubscriberManagementUserRecord) {
		setUserStatusOverrides((current) => ({
			...current,
			[user.id]: "Invited",
		}));
	}

	function toggleUserStatus(user: MasterSubscriberManagementUserRecord) {
		setUserStatusOverrides((current) => ({
			...current,
			[user.id]: user.status === "Active" ? "Inactive" : "Active",
		}));
	}

	return (
		<div className="grid gap-4">
			<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
				<CompactMetric icon={Users} label="Total Users" value={String(users.length)} tone="purple" />
				<CompactMetric icon={Users} label="Active Users" value={String(activeUsers)} helper={getStatusPercent(activeUsers, users.length)} tone="emerald" />
				<CompactMetric icon={Users} label="Inactive Users" value={String(inactiveUsers)} helper={getStatusPercent(inactiveUsers, users.length)} tone="orange" />
				<CompactMetric icon={Mail} label="Invited Users" value={String(invitedUsers)} helper={getStatusPercent(invitedUsers, users.length)} tone="blue" />
			</div>
			<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5">
				<ModuleTable
					emptyDescription="Try a different name, email, status, or branch."
					emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
					emptyTitle="No users found"
					minWidthClassName="min-w-[72rem]"
					paginationLabel="users"
					paginationStorageKey={MasterSubscriberUserPaginationStorageKey}
					table={table}
					toolbar={
						<ModuleTableToolbar className="rounded-none border-x-0 border-t-0 shadow-none md:grid-cols-[minmax(22rem,1.5fr)_minmax(10rem,0.8fr)_minmax(12rem,0.8fr)_auto_auto]">
							<ModuleTableSearch
								label="Search users"
								onChange={updateQuery}
								placeholder="Search by name, email or phone..."
								value={query}
							/>
							<ModuleTableFilterSelect
								label="Status"
								onChange={(value) =>
									updateStatusFilter(
										value as MasterSubscriberManagementUserStatus | "All",
									)
								}
								options={createFilterOptions(
									MasterSubscriberManagementUserStatusOptions,
								)}
								value={statusFilter}
							/>
							<ModuleTableFilterSelect
								label="Branch Access"
								onChange={updateBranchFilter}
								options={createFilterOptions(branchOptions)}
								value={branchFilter}
							/>
							<ModuleTableResetButton onClick={resetFilters}>
								Reset
							</ModuleTableResetButton>
							<Link
								href={getMasterSubscriberManagementUserAddHref(
									recordId,
									company.id,
								)}
								className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[var(--skyblue)] bg-[var(--skyblue)] px-4 text-sm font-semibold text-white shadow-sm shadow-[rgb(var(--skyblue-rgb)/0.18)] transition hover:opacity-90"
							>
								<Plus className="h-4 w-4" aria-hidden="true" />
								Add User
							</Link>
						</ModuleTableToolbar>
					}
					variant="embedded"
					renderRow={({ id, original }) => (
						<UserTableRow
							key={id}
							onSendInvitation={sendInvitation}
							onToggleStatus={toggleUserStatus}
							user={original}
							editHref={getMasterSubscriberManagementUserEditHref(
								recordId,
								company.id,
								original.id,
							)}
							viewHref={getMasterSubscriberManagementUserViewHref(
								recordId,
								company.id,
								original.id,
							)}
						/>
					)}
				/>
			</div>
			<MasterSubscriberUserDrawer
				key={`${userDrawerMode ?? "closed"}-${userId ?? "add"}`}
				availableBranches={availableBranches}
				company={company}
				isOpen={Boolean(userDrawerMode)}
				mode={userDrawerMode ?? "add"}
				recordId={recordId}
				user={selectedUser}
			/>
		</div>
	);
}

function UserTableRow({
	editHref,
	onSendInvitation,
	onToggleStatus,
	user,
	viewHref,
}: {
	editHref: string;
	onSendInvitation: (user: MasterSubscriberManagementUserRecord) => void;
	onToggleStatus: (user: MasterSubscriberManagementUserRecord) => void;
	user: MasterSubscriberManagementUserRecord;
	viewHref: string;
}) {
	return (
		<tr className="module-table-row">
			<td>
				<div className="flex items-center gap-3">
					<MasterSubscriberInitialsAvatar
						initials={user.initials}
						tone={user.avatarTone}
					/>
					<span>
						<span className="block font-bold text-darknavy">
							{user.name}
						</span>
						<span className="mt-1 block text-xs font-semibold text-darknavy/60">
							{user.phone}
						</span>
					</span>
				</div>
			</td>
			<td className="font-medium text-darknavy/72">{user.email}</td>
			<td>
				<div className="flex flex-wrap gap-1.5">
					{user.branchAccess.map((branch) => (
						<span
							key={branch}
							className="rounded-md bg-skyblue/12 px-2 py-1 text-xs font-bold text-blue-700"
						>
							{branch}
						</span>
					))}
				</div>
			</td>
			<td>
				<MasterUserStatusBadge status={user.status} />
			</td>
			<td className="font-semibold text-darknavy/72">
				<span className="block">{user.lastActiveDate}</span>
				<span className="block">{user.lastActiveTime}</span>
			</td>
			<td className="font-semibold text-darknavy/72">{user.addedOn}</td>
			<td>
				<UserRecordActions
					editHref={editHref}
					onSendInvitation={() => onSendInvitation(user)}
					onToggleStatus={() => onToggleStatus(user)}
					user={user}
					viewHref={viewHref}
				/>
			</td>
		</tr>
	);
}

function UserRecordActions({
	editHref,
	onSendInvitation,
	onToggleStatus,
	user,
	viewHref,
}: {
	editHref: string;
	onSendInvitation: () => void;
	onToggleStatus: () => void;
	user: MasterSubscriberManagementUserRecord;
	viewHref: string;
}) {
	const isActive = user.status === "Active";
	const ToggleIcon = isActive ? ToggleLeft : ToggleRight;
	const nextStatus = isActive ? "Inactive" : "Active";

	return (
		<ModuleTableActions className="justify-center">
			<ModuleTableActionLink
				variant="view"
				href={viewHref}
				label={`View ${user.name}`}
			/>
			<ModuleTableActionLink
				variant="edit"
				href={editHref}
				label={`Edit ${user.name}`}
			/>
			<ModuleActionMenu
				icon={MoreVertical}
				label={`Open user options for ${user.name}`}
				items={[
					{
						icon: Send,
						label: "Send invitation",
						onSelect: onSendInvitation,
						type: "button",
					},
					{
						icon: ToggleIcon,
						label: `Set as ${nextStatus}`,
						onSelect: onToggleStatus,
						tone: isActive ? "danger" : "default",
						type: "button",
					},
				]}
			/>
		</ModuleTableActions>
	);
}

type MasterSubscriberUserDrawerFormValues = {
	branchAccess: string[];
	email: string;
	name: string;
	phone: string;
	status: MasterSubscriberManagementUserStatus;
};

function MasterSubscriberUserDrawer({
	availableBranches,
	company,
	isOpen,
	mode,
	recordId,
	user,
}: {
	availableBranches: MasterSubscriberManagementBranchRecord[];
	company: MasterSubscriberManagementCompanyRecord;
	isOpen: boolean;
	mode: "add" | "edit" | "view";
	recordId: string;
	user?: MasterSubscriberManagementUserRecord;
}) {
	const router = useRouter();
	const backHref = getMasterSubscriberManagementSectionHref(
		recordId,
		"users",
		company.id,
	);
	const formId = `master-subscriber-${company.id}-user-${mode}-form`;
	const isReadonly = mode === "view";
	const isMissingUser = (mode === "edit" || mode === "view") && !user;
	const [values, setValues] = useState<MasterSubscriberUserDrawerFormValues>(
		() => createMasterSubscriberUserDrawerValues(user, availableBranches),
	);
	const drawerTitle =
		mode === "add"
			? "Add User"
			: user
				? `${mode === "edit" ? "Edit" : "View"} ${user.name}`
				: mode === "edit"
					? "Edit User"
					: "View User";

	function closeDrawer() {
		router.push(backHref);
	}

	function updateField<Key extends keyof MasterSubscriberUserDrawerFormValues>(
		field: Key,
		value: MasterSubscriberUserDrawerFormValues[Key],
	) {
		setValues((current) => ({
			...current,
			[field]: value,
		}));
	}

	function toggleBranchAccess(branchName: string) {
		if (isReadonly) {
			return;
		}

		setValues((current) => {
			const nextBranchAccess = current.branchAccess.includes(branchName)
				? current.branchAccess.filter((branch) => branch !== branchName)
				: [...current.branchAccess, branchName];

			return {
				...current,
				branchAccess: nextBranchAccess,
			};
		});
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		closeDrawer();
	}

	return (
		<ModuleDrawer
			description={`${company.name} / ${mode === "add"
				? "Create a user record"
				: mode === "edit"
					? "Update user access"
					: "Review user access"
				}`}
			eyebrow="Subscriber user management"
			footer={
				<div className="flex flex-col justify-end gap-2 sm:flex-row">
					<button
						type="button"
						onClick={closeDrawer}
						className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-darknavy/10 bg-white px-4 text-sm font-bold text-darknavy/70 shadow-sm shadow-darknavy/5 transition hover:bg-skyblue/10"
					>
						<X className="h-4 w-4" aria-hidden="true" />
						{isReadonly ? "Close" : "Cancel"}
					</button>
					{isReadonly && user ? (
						<Link
							href={getMasterSubscriberManagementUserEditHref(
								recordId,
								company.id,
								user.id,
							)}
							className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--skyblue)] bg-[var(--skyblue)] px-4 text-sm font-bold text-white shadow-sm shadow-[rgb(var(--skyblue-rgb)/0.18)] transition hover:opacity-90"
						>
							<Edit3 className="h-4 w-4" aria-hidden="true" />
							Edit User
						</Link>
					) : (
						<button
							type="submit"
							form={formId}
							disabled={isMissingUser}
							className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--skyblue)] bg-[var(--skyblue)] px-4 text-sm font-bold text-white shadow-sm shadow-[rgb(var(--skyblue-rgb)/0.18)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<Save className="h-4 w-4" aria-hidden="true" />
							{mode === "edit" ? "Save Changes" : "Save User"}
						</button>
					)}
				</div>
			}
			isOpen={isOpen}
			maxWidthClassName="max-w-3xl"
			onClose={closeDrawer}
			title={drawerTitle}
		>
			{isMissingUser ? (
				<div className="p-6">
					<div className="rounded-lg border border-dashed border-darknavy/15 bg-offwhite/60 p-5 text-sm font-semibold text-darknavy/60">
						The selected user is not available for this company.
					</div>
				</div>
			) : (
				<form
					id={formId}
					onSubmit={handleSubmit}
					className="grid gap-6 p-6"
				>
					<SubscriberUserFormSection title="User">
						<SubscriberUserTextField
							isReadonly={isReadonly}
							label="Full Name"
							value={values.name}
							onChange={(value) => updateField("name", value)}
						/>
						<SubscriberUserTextField
							isReadonly={isReadonly}
							label="Email"
							type="email"
							value={values.email}
							onChange={(value) => updateField("email", value)}
						/>
						<SubscriberUserTextField
							isReadonly={isReadonly}
							label="Phone"
							type="tel"
							value={values.phone}
							onChange={(value) => updateField("phone", value)}
						/>
						<SubscriberUserSelectField
							isReadonly={isReadonly}
							label="Status"
							options={MasterSubscriberManagementUserStatusOptions}
							value={values.status}
							onChange={(value) =>
								updateField(
									"status",
									value as MasterSubscriberManagementUserStatus,
								)
							}
						/>
					</SubscriberUserFormSection>
					<SubscriberUserFormSection title="Branch Access">
						<div className="grid gap-2 md:col-span-2 xl:col-span-3">
							{availableBranches.map((branch) => (
								<label
									key={branch.id}
									className="flex min-h-11 items-center gap-3 rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy/70 shadow-sm"
								>
									<input
										type="checkbox"
										checked={values.branchAccess.includes(branch.name)}
										disabled={isReadonly}
										onChange={() => toggleBranchAccess(branch.name)}
										className="h-4 w-4 rounded border-darknavy/20 text-skyblue focus:ring-skyblue/20"
									/>
									<span className="min-w-0 flex-1">
										<span className="block truncate">{branch.name}</span>
										<span className="mt-0.5 block text-xs font-semibold text-darknavy/45">
											{branch.type}
										</span>
									</span>
								</label>
							))}
						</div>
					</SubscriberUserFormSection>
				</form>
			)}
		</ModuleDrawer>
	);
}

function SubscriberUserFormSection({
	children,
	title,
}: {
	children: ReactNode;
	title: string;
}) {
	return (
		<section className="grid gap-4 border-b border-darknavy/10 pb-6 last:border-b-0 last:pb-0">
			<h2 className="text-sm font-semibold uppercase text-darknavy/45">
				{title}
			</h2>
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
				{children}
			</div>
		</section>
	);
}

function SubscriberUserTextField({
	isReadonly,
	label,
	type = "text",
	value,
	onChange,
}: {
	isReadonly: boolean;
	label: string;
	type?: InputHTMLAttributes<HTMLInputElement>["type"];
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<label className="grid gap-2">
			<span className="text-sm font-semibold text-darknavy/62">
				{label}
			</span>
			<input
				disabled={isReadonly}
				type={type}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				className={SubscriberBranchControlClassName}
			/>
		</label>
	);
}

function SubscriberUserSelectField({
	isReadonly,
	label,
	options,
	value,
	onChange,
}: {
	isReadonly: boolean;
	label: string;
	options: readonly string[];
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<label className="grid gap-2">
			<span className="text-sm font-semibold text-darknavy/62">
				{label}
			</span>
			<select
				disabled={isReadonly}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				className={joinClasses(
					SubscriberBranchControlClassName,
					"app-select-control",
				)}
			>
				{options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
		</label>
	);
}

function createMasterSubscriberUserDrawerValues(
	user: MasterSubscriberManagementUserRecord | undefined,
	availableBranches: MasterSubscriberManagementBranchRecord[],
): MasterSubscriberUserDrawerFormValues {
	if (user) {
		return {
			branchAccess: user.branchAccess,
			email: user.email,
			name: user.name,
			phone: user.phone,
			status: user.status,
		};
	}

	return {
		branchAccess: availableBranches[0]?.name ? [availableBranches[0].name] : [],
		email: "",
		name: "",
		phone: "",
		status: "Invited",
	};
}

function StorageSection({
	company,
}: {
	company: MasterSubscriberManagementCompanyRecord;
}) {
	const usedPercent = getUsagePercent(
		company.storageUsedGb,
		company.storageTotalGb,
	);
	const storageBreakdownRows = createStorageBreakdownRows(
		company.storageUsedGb,
	);

	return (
		<div className="grid gap-4">
			<div className="grid gap-4 xl:grid-cols-[0.9fr_1.2fr_0.9fr]">
				<Panel title="Storage Usage" titleAddon={<InfoIcon />}>
					<div className="flex flex-col items-center gap-6 sm:flex-row">
						<div
							className="grid h-32 w-32 shrink-0 place-items-center rounded-full"
							style={{
								background: `conic-gradient(rgb(var(--skyblue-rgb)) 0deg ${usedPercent * 3.6
									}deg, rgba(33,39,56,0.1) ${usedPercent * 3.6
									}deg 360deg)`,
							}}
						>
							<div className="grid h-24 w-24 place-items-center rounded-full bg-white text-center">
								<span className="text-2xl font-bold text-darknavy">
									{usedPercent}%
								</span>
								<span className="-mt-4 text-xs font-bold text-darknavy/65">
									Used
								</span>
							</div>
						</div>
						<div className="grid gap-3 text-sm font-semibold text-darknavy">
							<p>
								<span className="text-xl font-bold">
									{formatStorageGb(company.storageUsedGb)}
								</span>{" "}
								/ {formatStorageGb(company.storageTotalGb)}
							</p>
							<p className="text-darknavy/62">Total Storage</p>
							<p className="text-darknavy/70">
								Used {formatStorageGb(company.storageUsedGb)}
							</p>
							<p className="text-darknavy/70">
								Available {formatStorageGb(company.storageAvailableGb)}
							</p>
						</div>
					</div>
					<div className="mt-6 rounded-lg bg-emerald-500/12 p-3 text-sm font-semibold text-emerald-700">
						You have {formatStorageGb(company.storageAvailableGb)} of storage available.
					</div>
				</Panel>
				<Panel title="Storage Breakdown" titleAddon={<InfoIcon />}>
					<div className="grid gap-4">
						{storageBreakdownRows.map((item) => (
							<div
								key={item.category}
								className="grid grid-cols-[7rem_1fr_5rem_4rem] items-center gap-3 text-sm"
							>
								<span className="font-semibold text-darknavy/72">
									{item.category}
								</span>
								<span className="h-2 rounded-full bg-darknavy/10">
									<span
										className={joinClasses(
											"block h-2 rounded-full",
											item.colorClassName,
										)}
										style={{ width: `${item.percentage}%` }}
									/>
								</span>
								<span className="font-bold text-darknavy">{item.used}</span>
								<span className="text-right font-bold text-darknavy">
									{item.percentage}%
								</span>
							</div>
						))}
						<div className="grid grid-cols-[7rem_1fr_5rem_4rem] border-t border-darknavy/10 pt-3 text-sm font-bold text-darknavy">
							<span>Total</span>
							<span />
							<span>{formatStorageGb(company.storageUsedGb)}</span>
							<span className="text-right">100%</span>
						</div>
					</div>
				</Panel>
				<StorageActionsPanel />
			</div>
			<div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
				<TopBranchUsagePanel storageUsedGb={company.storageUsedGb} />
				<StorageDetailsPanel company={company} />
			</div>
		</div>
	);
}

function BillingInvoicesSection() {
	return (
		<div className="grid gap-4">
			<div className="grid gap-4 xl:grid-cols-4">
				<BillingCard title="Current Plan" value="$299 / month" icon={CreditCard}>
					<p className="mt-4 text-xs font-semibold text-darknavy/65">
						Next renewal on
					</p>
					<p className="mt-1 text-sm font-bold text-darknavy">June 12, 2024</p>
					<SmallButton className="mt-5 w-full">View Plan Details</SmallButton>
				</BillingCard>
				<BillingCard title="Current Period" value="May 12, 2024 - Jun 12, 2024" icon={CalendarDays}>
					<span className="mt-3 inline-flex rounded-md bg-emerald-500/14 px-2 py-1 text-xs font-bold text-emerald-700">
						21 days remaining
					</span>
					<p className="mt-5 border-t border-darknavy/10 pt-4 text-sm font-bold text-darknavy">
						Billing cycle Monthly
					</p>
				</BillingCard>
				<BillingCard title="Amount Due" value="$0.00" valueClassName="text-emerald-700" icon={CreditCard}>
					<p className="mt-3 text-sm font-semibold text-darknavy/65">
						No payment due
					</p>
					<SmallButton className="mt-8 w-full">View Invoices</SmallButton>
				</BillingCard>
				<BillingCard title="Payment Method" value="•••• •••• •••• 4242" icon={CreditCard}>
					<p className="mt-4 text-sm font-semibold text-darknavy/65">
						Expires 04/28
					</p>
					<SmallButton className="mt-7 w-full">Manage Payment Methods</SmallButton>
				</BillingCard>
			</div>
			<div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
				<InvoicesPanel />
				<BillingSummaryPanel />
			</div>
		</div>
	);
}

function RecentActivityPanel() {
	return (
		<Panel
			title="Recent Activity"
			actions={<SmallButton>View All Activity</SmallButton>}
		>
			<div className="grid gap-4 lg:grid-cols-4">
				{MasterSubscriberManagementActivities.map((activity) => (
					<div key={activity.id} className="relative flex gap-3">
						<span
							className={joinClasses(
								"flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
								getToneClassName(activity.tone),
							)}
						>
							<CheckCircle2 className="h-5 w-5" aria-hidden="true" />
						</span>
						<span className="min-w-0">
							<span className="block text-sm font-bold leading-6 text-darknavy">
								{activity.label}
							</span>
							<span className="mt-1 block text-xs font-semibold text-darknavy/60">
								{activity.date}
							</span>
						</span>
					</div>
				))}
			</div>
		</Panel>
	);
}

function PlanFeaturesPanel() {
	const features = [
		"Unlimited Invoices",
		"Advanced Reporting",
		"Multi-Branch Management",
		"Role-Based Access Control",
		"API Access",
		"Custom Fields",
		"Data Export",
		"Priority Support",
	];

	return (
		<Panel title="Plan Features">
			<div className="grid gap-3 sm:grid-cols-2">
				{features.map((feature) => (
					<span
						key={feature}
						className="inline-flex items-center gap-2 text-sm font-semibold text-darknavy/72"
					>
						<CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
						{feature}
					</span>
				))}
			</div>
			<Link
				href="#"
				className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--skyblue)]"
			>
				View all features
				<ArrowRight className="h-4 w-4" aria-hidden="true" />
			</Link>
		</Panel>
	);
}

function PlanHistoryPanel() {
	const rows = [
		["Accounting + Inventory", "Monthly", "$499.00", "May 12, 2024", "Jun 12, 2024", "Active"],
		["Inventory", "Monthly", "$399.00", "Apr 12, 2024", "May 12, 2024", "Completed"],
		["Accounting", "Monthly", "$399.00", "Mar 12, 2024", "Apr 12, 2024", "Completed"],
	];

	return (
		<Panel title="Plan History" actions={<SmallButton>View All History</SmallButton>}>
			<div className="overflow-x-auto">
				<table className="w-full min-w-[42rem] text-left text-sm">
					<thead className="bg-offwhite text-xs font-bold text-darknavy/70">
						<tr>
							{["Plan Name", "Billing Cycle", "Amount", "Start Date", "End Date", "Status"].map((heading) => (
								<th key={heading} className="px-3 py-3">{heading}</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y divide-darknavy/10">
						{rows.map((row) => (
							<tr key={`${row[0]}-${row[3]}`}>
								{row.map((cell, index) => (
									<td key={`${cell}-${index}`} className="px-3 py-3 font-semibold text-darknavy">
										{index === 5 ? <HistoryStatus value={cell} /> : cell}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</Panel>
	);
}

function StorageActionsPanel() {
	const actions = [
		{ helper: "Browse and manage company files", icon: Folder, label: "View Files" },
		{ helper: "Increase your storage limit", icon: Upload, label: "Upgrade Storage" },
		{ helper: "Free up storage space", icon: Trash2, label: "Clear Unused Files" },
	];

	return (
		<Panel title="Actions">
			<div className="grid gap-3">
				{actions.map((action) => {
					const Icon = action.icon;

					return (
						<button
							key={action.label}
							type="button"
							className="flex items-center gap-3 rounded-lg border border-darknavy/10 bg-offwhite/60 p-3 text-left transition hover:bg-skyblue/10"
						>
							<Icon className="h-5 w-5 text-[var(--skyblue)]" aria-hidden="true" />
							<span className="min-w-0 flex-1">
								<span className="block text-sm font-bold text-darknavy">
									{action.label}
								</span>
								<span className="mt-1 block text-xs font-semibold text-darknavy/60">
									{action.helper}
								</span>
							</span>
							<ArrowRight className="h-4 w-4 text-darknavy/45" aria-hidden="true" />
						</button>
					);
				})}
			</div>
			<div className="mt-5 flex items-center justify-between text-xs font-semibold text-darknavy/65">
				<span>Last cleanup: May 12, 2024</span>
				<span className="rounded-md bg-emerald-500/14 px-2 py-1 text-emerald-700">
					0.1 GB freed
				</span>
			</div>
		</Panel>
	);
}

function TopBranchUsagePanel({
	storageUsedGb,
}: {
	storageUsedGb: number;
}) {
	const branchStorageRows = createStorageBranchRows(storageUsedGb);

	return (
		<Panel title="Top Branch Usage" titleAddon={<InfoIcon />}>
			<div className="overflow-x-auto">
				<table className="w-full min-w-[48rem] text-left text-sm">
					<thead className="bg-offwhite text-xs font-bold text-darknavy/70">
						<tr>
							<th className="px-3 py-3">Branch</th>
							<th className="px-3 py-3">Used Storage</th>
							<th className="px-3 py-3">% of Total Used</th>
							<th className="px-3 py-3">Files</th>
							<th className="px-3 py-3">Last Activity</th>
							<th className="px-3 py-3" />
						</tr>
					</thead>
					<tbody className="divide-y divide-darknavy/10">
						{branchStorageRows.map((branch) => (
							<tr key={branch.id}>
								<td className="px-3 py-3">
									<span className="block font-bold text-darknavy">
										{branch.branch}
									</span>
									<span className="mt-1 block text-xs font-semibold text-darknavy/55">
										{branch.address}
									</span>
								</td>
								<td className="px-3 py-3">
									<span className="block font-bold text-darknavy">
										{branch.used}
									</span>
									<ProgressBar
										colorClassName={getStorageToneBar(branch.tone)}
										percent={branch.percentage}
									/>
								</td>
								<td className="px-3 py-3 font-bold text-darknavy">
									{branch.percentage}%
								</td>
								<td className="px-3 py-3 font-bold text-darknavy">
									{branch.files}
								</td>
								<td className="px-3 py-3 font-semibold text-darknavy/65">
									{branch.lastActivity}
								</td>
								<td className="px-3 py-3">
									<SmallButton>View Files</SmallButton>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div className="mt-5 text-center">
				<SmallButton>View All Branches</SmallButton>
			</div>
		</Panel>
	);
}

function StorageDetailsPanel({
	company,
}: {
	company: MasterSubscriberManagementCompanyRecord;
}) {
	return (
		<Panel title="Storage Details">
			<div className="grid gap-4 text-sm">
				<InlineStat
					label="Total Storage"
					value={formatStorageGb(company.storageTotalGb)}
				/>
				<InlineStat
					label="Used Storage"
					value={formatStorageGb(company.storageUsedGb)}
				/>
				<InlineStat
					label="Available Storage"
					value={formatStorageGb(company.storageAvailableGb)}
				/>
				<div className="border-t border-darknavy/10 pt-4" />
				<InlineStat label="Auto Cleanup" value={<EnabledBadge />} />
				<InlineStat label="Next Cleanup" value="May 26, 2024" />
				<div className="border-t border-darknavy/10 pt-4" />
				<InlineStat label="File Versioning" value={<EnabledBadge />} />
				<InlineStat label="Retention Period" value="30 days" />
			</div>
		</Panel>
	);
}

function InvoicesPanel() {
	return (
		<Panel
			title="Invoices"
			description="View and download all invoices for this company."
			actions={
				<div className="flex flex-wrap gap-2">
					<SmallButton>May 12, 2023 - May 12, 2024</SmallButton>
					<SmallButton>All Status</SmallButton>
					<SmallButton icon={Filter}>Filters</SmallButton>
				</div>
			}
		>
			<div className="overflow-x-auto">
				<table className="w-full min-w-[58rem] text-left text-sm">
					<thead className="bg-offwhite text-xs font-bold text-darknavy/70">
						<tr>
							{["Invoice #", "Date", "Description", "Billing Period", "Amount", "Status", "Actions"].map((heading) => (
								<th key={heading} className="px-3 py-3">{heading}</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y divide-darknavy/10">
						{MasterSubscriberManagementInvoices.map((invoice) => (
							<tr key={invoice.id}>
								<td className="px-3 py-3 font-bold text-darknavy">
									{invoice.id}
								</td>
								<td className="px-3 py-3 font-semibold text-darknavy/72">
									{invoice.date}
								</td>
								<td className="px-3 py-3 font-semibold text-darknavy/72">
									{invoice.description}
								</td>
								<td className="px-3 py-3 font-semibold text-darknavy/72">
									{invoice.billingPeriod}
								</td>
								<td className="px-3 py-3 font-bold text-darknavy">
									{invoice.amount}
								</td>
								<td className="px-3 py-3">
									<PaidBadge />
								</td>
								<td className="px-3 py-3">
									<div className="flex gap-2">
										<IconButton icon={Download} label="Download invoice" />
										<IconButton icon={FileText} label="View invoice" />
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<TableFooter label="invoices" total={12} />
		</Panel>
	);
}

function BillingSummaryPanel() {
	return (
		<Panel title="Billing Summary" description="Overview of your current billing.">
			<div className="grid gap-4 text-sm">
				<InlineStat label="Subtotal" value="$299.00" />
				<InlineStat label="Discount" value="$0.00" />
				<InlineStat label="Tax (0%)" value="$0.00" />
				<div className="border-t border-darknavy/10 pt-4">
					<InlineStat label="Total" value="$299.00 USD" strong />
				</div>
				<InlineStat label="Amount Paid" value="$299.00" />
				<InlineStat label="Amount Due" value="$0.00" valueClassName="text-emerald-700" />
			</div>
			<div className="mt-6 rounded-lg border border-darknavy/10 bg-offwhite/70 p-4">
				<h3 className="text-sm font-bold text-darknavy">
					Need to update billing info?
				</h3>
				<p className="mt-2 text-xs font-semibold leading-5 text-darknavy/62">
					Update your company billing details or download receipts.
				</p>
				<SmallButton className="mt-4 w-full">Manage Billing Details</SmallButton>
			</div>
		</Panel>
	);
}

function Panel({
	actions,
	children,
	description,
	icon: Icon,
	title,
	titleAddon,
}: {
	actions?: ReactNode;
	children: ReactNode;
	description?: string;
	icon?: LucideIcon;
	title: string;
	titleAddon?: ReactNode;
}) {
	return (
		<section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 xl:p-5">
			<div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<div className="flex items-center gap-2">
						{Icon ? (
							<span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/12 text-emerald-700">
								<Icon className="h-5 w-5" aria-hidden="true" />
							</span>
						) : null}
						<h2 className="text-base font-semibold text-darknavy">
							{title}
						</h2>
						{titleAddon}
					</div>
					{description ? (
						<p className="mt-1 text-xs font-semibold text-darknavy/60">
							{description}
						</p>
					) : null}
				</div>
				{actions}
			</div>
			{children}
		</section>
	);
}

function CompactMetric({
	helper,
	icon: Icon,
	label,
	tone,
	value,
}: {
	helper?: string;
	icon: LucideIcon;
	label: string;
	tone: "blue" | "emerald" | "orange" | "purple";
	value: string;
}) {
	return (
		<div className="flex items-center gap-4 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5">
			<span
				className={joinClasses(
					"flex h-12 w-12 items-center justify-center rounded-lg",
					getToneClassName(tone),
				)}
			>
				<Icon className="h-6 w-6" aria-hidden="true" />
			</span>
			<span>
				<span className="block text-sm font-semibold text-darknavy/65">
					{label}
				</span>
				<span className="mt-1 inline-flex items-end gap-3 text-3xl font-bold leading-none text-darknavy">
					{value}
					{helper ? (
						<span
							className={joinClasses(
								"pb-1 text-sm",
								tone === "orange"
									? "text-orange-600"
									: tone === "blue"
										? "text-blue-700"
										: "text-emerald-700",
							)}
						>
							{helper}
						</span>
					) : null}
				</span>
			</span>
		</div>
	);
}

const CompanyEditInputClassName =
	"h-11 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy shadow-sm shadow-darknavy/5 outline-none transition placeholder:text-darknavy/35 focus:border-[rgb(var(--skyblue-rgb)/0.45)] focus:ring-4 focus:ring-[rgb(var(--skyblue-rgb)/0.16)]";

const CompanyEditTextAreaClassName =
	"min-h-32 w-full resize-y rounded-lg border border-darknavy/10 bg-white px-3 py-3 text-sm font-semibold leading-6 text-darknavy shadow-sm shadow-darknavy/5 outline-none transition placeholder:text-darknavy/35 focus:border-[rgb(var(--skyblue-rgb)/0.45)] focus:ring-4 focus:ring-[rgb(var(--skyblue-rgb)/0.16)]";

function CompanyEditField({
	children,
	label,
}: {
	children: ReactNode;
	label: string;
}) {
	return (
		<label className="grid gap-2">
			<span className="text-sm font-semibold text-darknavy/62">{label}</span>
			{children}
		</label>
	);
}

function CompanyEditTaxpayerTypeToggle({
	onChange,
	value,
}: {
	onChange: (value: MasterSubscriberManagementTaxpayerType) => void;
	value: MasterSubscriberManagementTaxpayerType;
}) {
	const isIndividual = value === "individual";

	return (
		<div>
			<p className="mb-2 block text-sm font-semibold text-darknavy/62">
				Taxpayer Type
			</p>
			<div className="flex overflow-hidden rounded-lg border border-darknavy/10">
				<button
					type="button"
					aria-pressed={isIndividual}
					onClick={() => onChange("individual")}
					className={joinClasses(
						"flex-1 py-3 text-sm font-semibold transition",
						isIndividual
							? "bg-darknavy text-white"
							: "bg-white text-darknavy hover:bg-offwhite",
					)}
				>
					Individual
				</button>
				<button
					type="button"
					aria-pressed={!isIndividual}
					onClick={() => onChange("non-individual")}
					className={joinClasses(
						"flex-1 border-l border-darknavy/10 py-3 text-sm font-semibold transition",
						!isIndividual
							? "bg-darknavy text-white"
							: "bg-white text-darknavy hover:bg-offwhite",
					)}
				>
					Non-Individual
				</button>
			</div>
		</div>
	);
}

function DetailRow({
	label,
	link = false,
	value,
}: {
	label: string;
	link?: boolean;
	value: ReactNode;
}) {
	return (
		<div className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)]">
			<span className="text-sm font-semibold text-darknavy/62">{label}</span>
			<span
				className={joinClasses(
					"text-sm font-bold text-darknavy",
					link && "text-[var(--skyblue)]",
				)}
			>
				{value}
			</span>
		</div>
	);
}

function IconDetail({
	icon: Icon,
	label,
	value,
}: {
	icon: LucideIcon;
	label: string;
	value: ReactNode;
}) {
	return (
		<div className="grid grid-cols-[2.75rem_1fr] gap-3 border-b border-darknavy/10 pb-4">
			<span className="flex h-10 w-10 items-center justify-center rounded-lg bg-skyblue/12 text-[var(--skyblue)]">
				<Icon className="h-5 w-5" aria-hidden="true" />
			</span>
			<span>
				<span className="block text-sm font-semibold text-darknavy/62">
					{label}
				</span>
				<span className="mt-1 block text-sm font-bold text-darknavy">
					{value}
				</span>
			</span>
		</div>
	);
}

function UsageCount({
	helper,
	icon: Icon,
	label,
	tone,
	value,
}: {
	helper: string;
	icon: LucideIcon;
	label: string;
	tone: "blue" | "emerald" | "orange" | "purple";
	value: string;
}) {
	return (
		<div className="grid grid-cols-[3rem_1fr] gap-4">
			<span
				className={joinClasses(
					"flex h-12 w-12 items-center justify-center rounded-full",
					getToneClassName(tone),
				)}
			>
				<Icon className="h-5 w-5" aria-hidden="true" />
			</span>
			<div>
				<div className="flex items-center justify-between gap-3 text-sm font-bold text-darknavy">
					<span>{label}</span>
					<span className="text-xl leading-none">{value}</span>
				</div>
				<p className="mt-2 text-xs font-semibold text-darknavy/58">
					{helper}
				</p>
			</div>
		</div>
	);
}

function UsageMeter({
	colorClassName,
	icon: Icon,
	label,
	percent,
	value,
}: {
	colorClassName: string;
	icon: LucideIcon;
	label: string;
	percent: number;
	value: string;
}) {
	return (
		<div className="grid grid-cols-[3rem_1fr] gap-4">
			<span className="flex h-12 w-12 items-center justify-center rounded-full bg-darknavy/5 text-darknavy">
				<Icon className="h-5 w-5" aria-hidden="true" />
			</span>
			<div>
				<div className="flex items-center justify-between gap-3 text-sm font-bold text-darknavy">
					<span>{label}</span>
					<span>{value}</span>
				</div>
				<ProgressBar colorClassName={colorClassName} percent={percent} />
				<p className="mt-2 text-right text-xs font-bold text-darknavy/65">
					{percent}%
				</p>
			</div>
		</div>
	);
}

function SmallButton({
	children,
	className,
	icon: Icon,
	type = "button",
	...props
}: {
	icon?: LucideIcon;
} & ComponentPropsWithoutRef<"button">) {
	return (
		<button
			{...props}
			type={type}
			className={joinClasses(
				"inline-flex h-10 items-center justify-center gap-2 rounded-md border border-darknavy/10 bg-white px-4 text-sm font-bold text-[var(--skyblue)] shadow-sm shadow-darknavy/5 transition hover:bg-skyblue/10",
				className,
			)}
		>
			{Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
			{children}
		</button>
	);
}

function IconButton({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
	return (
		<button
			type="button"
			className="flex h-9 w-9 items-center justify-center rounded-md border border-darknavy/10 bg-white text-[var(--skyblue)] transition hover:bg-skyblue/10"
			aria-label={label}
		>
			<Icon className="h-4 w-4" aria-hidden="true" />
		</button>
	);
}

function PaginationSquare({
	active = false,
	label,
}: {
	active?: boolean;
	label: string;
}) {
	return (
		<button
			type="button"
			className={joinClasses(
				"flex h-9 w-9 items-center justify-center rounded-md border text-sm font-bold",
				active
					? "border-[var(--skyblue)] bg-skyblue/10 text-[var(--skyblue)]"
					: "border-darknavy/10 bg-white text-darknavy/55",
			)}
		>
			{label}
		</button>
	);
}

function TableFooter({
	label,
	pages = 1,
	total,
}: {
	label: string;
	pages?: number;
	total: number;
}) {
	return (
		<div className="flex flex-col gap-3 text-sm font-semibold text-darknavy/65 sm:flex-row sm:items-center sm:justify-between">
			<span>
				Showing 1 to {Math.min(5, total)} of {total} {label}
			</span>
			<div className="flex gap-2">
				<PaginationSquare label="<" />
				<PaginationSquare active label="1" />
				{pages > 1 ? <PaginationSquare label="2" /> : null}
				{pages > 2 ? <PaginationSquare label="3" /> : null}
				{pages > 4 ? <PaginationSquare label="4" /> : null}
				{pages > 5 ? <PaginationSquare label="..." /> : null}
				{pages > 6 ? <PaginationSquare label={String(pages)} /> : null}
				<PaginationSquare label=">" />
			</div>
		</div>
	);
}

function ProgressBar({
	colorClassName,
	percent,
}: {
	colorClassName: string;
	percent: number;
}) {
	return (
		<span className="mt-3 block h-2 rounded-full bg-darknavy/10">
			<span
				className={joinClasses("block h-2 rounded-full", colorClassName)}
				style={{ width: `${percent}%` }}
			/>
		</span>
	);
}

function BillingCard({
	children,
	icon: Icon,
	title,
	value,
	valueClassName,
}: {
	children?: ReactNode;
	icon: LucideIcon;
	title: string;
	value: string;
	valueClassName?: string;
}) {
	return (
		<section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5">
			<div className="flex items-start gap-3">
				<span className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-500/12 text-purple-700">
					<Icon className="h-5 w-5" aria-hidden="true" />
				</span>
				<div className="min-w-0">
					<h2 className="text-sm font-bold text-darknavy">{title}</h2>
					<p
						className={joinClasses(
							"mt-4 text-xl font-bold text-darknavy",
							valueClassName,
						)}
					>
						{value}
					</p>
				</div>
			</div>
			{children}
		</section>
	);
}

function InlineStat({
	label,
	strong = false,
	value,
	valueClassName,
}: {
	label: string;
	strong?: boolean;
	value: ReactNode;
	valueClassName?: string;
}) {
	return (
		<div className="flex items-center justify-between gap-3">
			<span className={joinClasses("font-semibold text-darknavy/65", strong && "text-darknavy")}>
				{label}
			</span>
			<span className={joinClasses("font-bold text-darknavy", valueClassName)}>
				{value}
			</span>
		</div>
	);
}

function PaidBadge() {
	return (
		<span className="inline-flex rounded-md bg-emerald-500/14 px-2 py-1 text-xs font-bold text-emerald-700">
			Paid
		</span>
	);
}

function EnabledBadge() {
	return (
		<span className="inline-flex rounded-md bg-emerald-500/14 px-2 py-1 text-xs font-bold text-emerald-700">
			Enabled
		</span>
	);
}

function HistoryStatus({ value }: { value: string }) {
	return (
		<span
			className={joinClasses(
				"inline-flex rounded-md px-2 py-1 text-xs font-bold",
				value === "Active"
					? "bg-emerald-500/14 text-emerald-700"
					: "bg-skyblue/12 text-blue-700",
			)}
		>
			{value}
		</span>
	);
}

function InfoIcon() {
	return <Info className="h-4 w-4 text-[var(--skyblue)]" aria-hidden="true" />;
}

function createActionColumn<TRecord>(
	header: string,
	className: string,
): ColumnDef<TRecord> {
	return {
		id: "actions",
		header,
		enableSorting: false,
		meta: { className },
	};
}

function createBranchColumn(
	key: MasterSubscriberBranchTableColumnKey,
	header: string,
	className: string,
): ColumnDef<MasterSubscriberManagementBranchRecord> {
	return {
		accessorKey: key,
		header,
		sortingFn: "alphanumeric",
		meta: { className },
	};
}

function createUserColumn(
	key: MasterSubscriberUserTableColumnKey,
	header: string,
	className: string,
): ColumnDef<MasterSubscriberManagementUserRecord> {
	if (key === "branchAccess") {
		return {
			id: key,
			accessorFn: (user) => user.branchAccess.join(", "),
			header,
			sortingFn: "alphanumeric",
			meta: { className },
		};
	}

	if (key === "lastActive") {
		return {
			id: key,
			accessorFn: (user) =>
				`${user.lastActiveDate} ${user.lastActiveTime}`.trim(),
			header,
			sortingFn: "alphanumeric",
			meta: { className },
		};
	}

	return {
		accessorKey: key,
		header,
		sortingFn: "alphanumeric",
		meta: { className },
	};
}

function createFilterOptions(options: readonly string[]) {
	return [
		{ label: "All", value: "All" },
		...options.map((option) => ({ label: option, value: option })),
	];
}

function createCompanyInformationEditValues(
	company: MasterSubscriberManagementCompanyRecord,
): CompanyInformationEditValues {
	const industryValues = getCompanyEditIndustryValues(company);

	return {
		address: company.addressLines.join("\n"),
		contactEmail: company.contactEmail,
		contactNumber: company.contactNumber,
		firstName: company.firstName ?? "",
		industry: industryValues.industry,
		industryOther: industryValues.industryOther,
		lastName: company.lastName ?? "",
		middleName: company.middleName ?? "",
		name: company.name,
		reportEndDate: company.reportEndDate,
		reportStartDate: company.reportStartDate,
		status: company.status,
		taxpayerType: getCompanyTaxpayerType(company),
		tin: FormatTinNumber(company.tin),
		website: company.website,
	};
}

function getCompanyTaxpayerType(
	company: MasterSubscriberManagementCompanyRecord,
): MasterSubscriberManagementTaxpayerType {
	return company.taxpayerType ?? "non-individual";
}

function getCompanyEditIndustryValues(
	company: MasterSubscriberManagementCompanyRecord,
) {
	const industry = company.industry.trim();

	if (!industry) {
		return { industry: "", industryOther: "" };
	}

	if (isCompanyIndustryOption(industry)) {
		return {
			industry,
			industryOther: company.industryOther ?? "",
		};
	}

	return {
		industry: "Others",
		industryOther: company.industryOther ?? industry,
	};
}

function isCompanyIndustryOption(value: string): value is CompanyIndustryOption {
	return OnboardingNonIndividualTypeOptions.includes(
		value as CompanyIndustryOption,
	);
}

function formatCompanyTaxpayerType(
	value: MasterSubscriberManagementTaxpayerType,
) {
	return value === "individual" ? "Individual" : "Non-Individual";
}

function formatCompanyIndustry(company: MasterSubscriberManagementCompanyRecord) {
	if (company.industry === "Others") {
		return company.industryOther || "Others";
	}

	return company.industry;
}

function formatCompanyAddress(company: MasterSubscriberManagementCompanyRecord) {
	return company.addressLines.filter(Boolean).join(", ");
}

function formatCompanyReportDate(value: string) {
	return FormatOnboardingReportDateLabel(value) || value;
}

function createCompanyBranchRows(
	company: MasterSubscriberManagementCompanyRecord,
): MasterSubscriberManagementBranchRecord[] {
	const branchTones = ["blue", "cyan", "purple"] as const;
	const baseUsers = Math.floor(company.userCount / company.branchCount);
	const extraUsers = company.userCount % company.branchCount;

	return Array.from({ length: company.branchCount }, (_, index) => ({
		addedOn: company.dateAdded,
		address: `${100 + index * 25} Test Avenue, Suite ${index + 1}00, New York, NY 1000${index + 1}, USA`,
		contactNumber: company.contactNumber,
		email:
			index === 0
				? company.contactEmail
				: `branch${index + 1}@${slugifyName(company.name)}.com`,
		id: `${company.id}-branch-${index + 1}`,
		isMain: index === 0,
		linkedMainBranchId:
			index === 0 ? "" : `${company.id}-branch-1`,
		name:
			index === 0
				? `${company.name} Head Office`
				: `${company.name} Branch ${index + 1}`,
		status:
			company.branchCount === 3 && index === company.branchCount - 1
				? "Inactive"
				: "Active",
		tin:
			index === 0
				? FormatTinNumber(company.tin)
				: createBranchTin(company.tin, index),
		tone: branchTones[index] ?? "blue",
		type: index === 0 ? "Head Office" : "Satellite",
		users: baseUsers + (index < extraUsers ? 1 : 0),
	}));
}

function createCompanyUserRows(
	company: MasterSubscriberManagementCompanyRecord,
): MasterSubscriberManagementUserRecord[] {
	const avatarTones = ["blue", "orange", "purple", "rose", "slate"] as const;
	const branches = createCompanyBranchRows(company);
	const companySlug = slugifyName(company.name);

	return Array.from({ length: company.userCount }, (_, index) => {
		const userNumber = index + 1;
		const status: MasterSubscriberManagementUserStatus =
			userNumber === company.userCount && company.userCount >= 8
				? "Invited"
				: userNumber % 7 === 0
					? "Inactive"
					: "Active";

		return {
			addedOn: company.dateAdded,
			avatarTone: avatarTones[index % avatarTones.length] ?? "blue",
			branchAccess: [
				branches[index % branches.length]?.name ?? `${company.name} Head Office`,
			],
			email: `user${String(userNumber).padStart(2, "0")}@${companySlug}.com`,
			id: `${company.id}-user-${userNumber}`,
			initials: `T${userNumber}`,
			lastActiveDate: status === "Invited" ? "-" : "May 24, 2024",
			lastActiveTime: status === "Invited" ? "" : "10:00 AM",
			name: `Test User ${String(userNumber).padStart(2, "0")}`,
			phone: `+1 555-90${String(userNumber).padStart(2, "0")}`,
			status,
		};
	});
}

function getStatusPercent(count: number, total: number) {
	if (total === 0) {
		return "0%";
	}

	return `${Math.round((count / total) * 100)}%`;
}

function getUsagePercent(value: number, limit: number) {
	if (limit === 0) {
		return 0;
	}

	return Math.min(100, Math.round((value / limit) * 100));
}

function createSubscriptionPlanDisplay(
	company: MasterSubscriberManagementCompanyRecord,
): MasterSubscriberSubscriptionPlanDisplay {
	const planOption = getSubscriptionPlanOptionByName(company.planName);
	const billingCycle = normalizeSubscriptionBillingCycle(company.billingCycle);

	if (planOption) {
		return createSubscriptionPlanDisplayFromOption(planOption, billingCycle);
	}

	return {
		amount: company.amount,
		billingCycle,
		description:
			company.planDescription ||
			"Custom subscription plan.",
		id: `custom-${company.id}`,
		monthlyAmount: billingCycle === "Monthly" ? company.amount : "",
		name: company.planName,
		yearlyAmount: billingCycle === "Yearly" ? company.amount : "",
	};
}

function createSubscriptionPlanDisplayFromOption(
	plan: MasterSubscriberManagementSubscriptionPlanOption,
	billingCycle: MasterSubscriberManagementSubscriptionBillingCycle,
): MasterSubscriberSubscriptionPlanDisplay {
	return {
		...plan,
		amount: getSubscriptionPlanAmount(plan, billingCycle),
		billingCycle,
	};
}

function getSubscriptionPlanAmount(
	plan: MasterSubscriberManagementSubscriptionPlanOption,
	billingCycle: MasterSubscriberManagementSubscriptionBillingCycle,
) {
	return billingCycle === "Yearly" ? plan.yearlyAmount : plan.monthlyAmount;
}

function normalizeSubscriptionBillingCycle(
	billingCycle: string,
): MasterSubscriberManagementSubscriptionBillingCycle {
	return billingCycle === "Yearly" || billingCycle === "Annual"
		? "Yearly"
		: "Monthly";
}

function getSelectableSubscriptionPlanId(planId: string) {
	return (
		getSubscriptionPlanOptionById(planId)?.id ??
		MasterSubscriberManagementSubscriptionPlanOptions[0].id
	);
}

function getSubscriptionPlanOptionById(planId: string) {
	return MasterSubscriberManagementSubscriptionPlanOptions.find(
		(plan) => plan.id === planId,
	);
}

function getSubscriptionPlanOptionByName(planName: string) {
	return MasterSubscriberManagementSubscriptionPlanOptions.find(
		(plan) => plan.name === planName,
	);
}

function formatStorageGb(value: number) {
	const roundedValue = Number(value.toFixed(2));

	return `${Number.isInteger(roundedValue) ? roundedValue.toFixed(0) : roundedValue} GB`;
}

function createStorageBreakdownRows(storageUsedGb: number) {
	return MasterSubscriberManagementStorageBreakdown.map((item) => ({
		...item,
		used: formatStorageGb((storageUsedGb * item.percentage) / 100),
	}));
}

function createStorageBranchRows(storageUsedGb: number) {
	return MasterSubscriberManagementStorageBranches.map((branch) => ({
		...branch,
		used: formatStorageGb((storageUsedGb * branch.percentage) / 100),
	}));
}

function slugifyName(value: string) {
	return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function createBranchTin(companyTin: string, branchIndex: number) {
	const digits = companyTin.replace(/\D/g, "").padEnd(12, "0").slice(0, 9);
	const branchSuffix = String(branchIndex).padStart(3, "0");

	return FormatTinNumber(`${digits}${branchSuffix}`);
}

function getToneClassName(tone: "blue" | "emerald" | "orange" | "purple") {
	switch (tone) {
		case "blue":
			return "bg-skyblue/14 text-blue-700";
		case "emerald":
			return "bg-emerald-500/14 text-emerald-700";
		case "orange":
			return "bg-orange-500/14 text-orange-700";
		case "purple":
			return "bg-purple-500/14 text-purple-700";
	}
}

function getStorageToneBar(
	tone: "blue" | "emerald" | "orange" | "purple" | "slate",
) {
	switch (tone) {
		case "blue":
			return "bg-skyblue";
		case "emerald":
			return "bg-emerald-500";
		case "orange":
			return "bg-orange-500";
		case "purple":
			return "bg-purple-500";
		case "slate":
			return "bg-slate-400";
	}
}
