"use client";

import type { ReactNode } from "react";
import Link from "next/link";
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
	Search,
	Trash2,
	Upload,
	Users,
	type LucideIcon,
} from "lucide-react";
import {
	MasterSubscriberManagementCompanySections,
	getMasterSubscriberManagementSectionHref,
	getMasterSubscriberManagementSectionPageTitle,
	getMasterSubscriberManagementViewHref,
} from "@/app/src/constants/master/subscriber-management/MasterSubscriberManagementConstants";
import {
	MasterSubscriberManagementActivities,
	MasterSubscriberManagementBranches,
	MasterSubscriberManagementInvoices,
	MasterSubscriberManagementStorageBranches,
	MasterSubscriberManagementStorageBreakdown,
	MasterSubscriberManagementUsers,
	getMasterSubscriberManagementCompaniesForSubscriber,
	getMasterSubscriberManagementCompany,
	getMasterSubscriberManagementSubscriber,
} from "@/app/src/data/master/subscriber-management/MasterSubscriberManagementData";
import type {
	MasterSubscriberManagementCompanyRecord,
	MasterSubscriberManagementCompanySection,
	MasterSubscriberManagementListRecord,
} from "@/app/src/types/master/subscriber-management/MasterSubscriberManagementTypes";
import { MasterSubscriberManagementMoreActions } from "@/app/src/ui/master/subscriber-management/MasterSubscriberManagementActions";
import {
	MasterBranchTypeBadge,
	MasterCompanyStatusBadge,
	MasterSubscriberIcon,
	MasterSubscriberInitialsAvatar,
	MasterUserStatusBadge,
} from "@/app/src/ui/master/subscriber-management/MasterSubscriberManagementBadges";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function MasterSubscriberManagementCompanyPage({
	recordId,
	section,
}: {
	recordId: string;
	section: MasterSubscriberManagementCompanySection;
}) {
	const subscriber = getMasterSubscriberManagementSubscriber(recordId);
	const companies =
		getMasterSubscriberManagementCompaniesForSubscriber(recordId);
	const company = getMasterSubscriberManagementCompany(recordId);
	const pageTitle = getMasterSubscriberManagementSectionPageTitle(section);

	return (
		<section className="grid gap-5">
			<CompanyPageHeader
				company={company}
				pageTitle={pageTitle}
				section={section}
				subscriber={subscriber}
			/>
			<div className="grid gap-4 xl:grid-cols-[22rem_minmax(0,1fr)]">
				<SubscriberCompanySidebar
					companies={companies}
					recordId={subscriber.id}
					selectedCompanyId={company.id}
				/>
				<div className="min-w-0 rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5">
					<CompanyPanelHeader
						company={company}
						recordId={subscriber.id}
						section={section}
					/>
					<CompanySectionTabs
						activeSection={section}
						recordId={subscriber.id}
					/>
					<div className="p-4 xl:p-5">
						{section === "company-information" ? (
							<CompanyInformationSection company={company} />
						) : null}
						{section === "subscription-and-plan" ? (
							<SubscriptionPlanSection company={company} />
						) : null}
						{section === "branches" ? (
							<BranchesSection company={company} />
						) : null}
						{section === "users" ? <UsersSection /> : null}
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

function CompanyPageHeader({
	company,
	pageTitle,
	section,
	subscriber,
}: {
	company: MasterSubscriberManagementCompanyRecord;
	pageTitle: string;
	section: MasterSubscriberManagementCompanySection;
	subscriber: MasterSubscriberManagementListRecord;
}) {
	const action =
		section === "branches"
			? "Add Branch"
			: section === "users"
				? "Add User"
				: "";

	return (
		<header className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
			<div>
				<div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-darknavy/65">
					<Link
						href={getMasterSubscriberManagementViewHref(subscriber.id)}
						className="transition hover:text-darknavy"
					>
						Subscribers
					</Link>
					<span>/</span>
					<span>{company.name}</span>
					<span>/</span>
					<span className="text-darknavy">{pageTitle}</span>
				</div>
				<h1 className="mt-5 text-3xl font-semibold leading-tight text-darknavy">
					{pageTitle}
				</h1>
				<p className="mt-2 text-sm font-medium leading-6 text-darknavy/65">
					{getPageDescription(section)}
				</p>
			</div>
			<div className="flex flex-wrap gap-2 lg:justify-end">
				<MasterSubscriberManagementMoreActions recordId={subscriber.id} />
				{action ? (
					<button
						type="button"
						className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[var(--skyblue)] bg-[var(--skyblue)] px-4 text-sm font-semibold text-white shadow-sm shadow-[rgb(var(--skyblue-rgb)/0.18)] transition hover:opacity-90"
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						{action}
					</button>
				) : null}
			</div>
		</header>
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
	const tones = ["blue", "orange", "cyan", "orange", "purple"] as const;

	return (
		<aside className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5">
			<h2 className="text-lg font-semibold text-darknavy">Companies</h2>
			<div className="mt-4 grid grid-cols-[1fr_auto] gap-3">
				<label className="relative">
					<span className="sr-only">Search company name</span>
					<Search
						className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/45"
						aria-hidden="true"
					/>
					<input
						className="h-11 w-full rounded-lg border border-darknavy/10 bg-white pl-10 pr-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-[rgb(var(--skyblue-rgb)/0.45)] focus:ring-4 focus:ring-[rgb(var(--skyblue-rgb)/0.16)]"
						placeholder="Search company name..."
					/>
				</label>
				<button
					type="button"
					className="flex h-11 w-11 items-center justify-center rounded-lg border border-darknavy/10 bg-white text-darknavy transition hover:bg-skyblue/10"
					aria-label="Filter companies"
				>
					<Filter className="h-4 w-4" aria-hidden="true" />
				</button>
			</div>
			<div className="mt-4 grid gap-3">
				{companies.map((company, index) => (
					<Link
						key={company.id}
						href={getMasterSubscriberManagementSectionHref(
							recordId,
							"company-information",
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
			</div>
			<div className="mt-36 flex items-center justify-between gap-3 text-xs font-semibold text-darknavy/65 xl:mt-64">
				<span>Showing 1 to {companies.length} of {companies.length} companies</span>
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
	recordId,
	section,
}: {
	company: MasterSubscriberManagementCompanyRecord;
	recordId: string;
	section: MasterSubscriberManagementCompanySection;
}) {
	const buttonLabel =
		section === "company-information"
			? "Edit Company"
			: section === "subscription-and-plan"
				? "Edit Subscription"
				: "View Company";

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
			<Link
				href={getMasterSubscriberManagementViewHref(recordId)}
				className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-darknavy/10 bg-white px-4 text-sm font-semibold text-[var(--skyblue)] shadow-sm shadow-darknavy/5 transition hover:bg-skyblue/10"
			>
				{buttonLabel === "View Company" ? (
					<ExternalLink className="h-4 w-4" aria-hidden="true" />
				) : (
					<Edit3 className="h-4 w-4" aria-hidden="true" />
				)}
				{buttonLabel}
			</Link>
		</div>
	);
}

function CompanySectionTabs({
	activeSection,
	recordId,
}: {
	activeSection: MasterSubscriberManagementCompanySection;
	recordId: string;
}) {
	return (
		<nav className="flex overflow-x-auto border-b border-darknavy/10 px-4 xl:px-5">
			{MasterSubscriberManagementCompanySections.map((section) => {
				const Icon = section.icon;
				const isActive = section.key === activeSection;

				return (
					<Link
						key={section.key}
						href={getMasterSubscriberManagementSectionHref(
							recordId,
							section.key,
						)}
						className={joinClasses(
							"relative inline-flex h-14 min-w-max items-center gap-2 px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--skyblue-rgb)/0.2)]",
							isActive
								? "text-[var(--skyblue)]"
								: "text-darknavy/70 hover:text-darknavy",
						)}
					>
						<Icon className="h-4 w-4" aria-hidden="true" />
						{section.label}
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
	return (
		<div className="grid gap-4">
			<div className="grid gap-4 xl:grid-cols-3">
				<CompactMetric
					icon={Building2}
					label="Total Companies"
					value="5"
					tone="blue"
				/>
				<CompactMetric
					icon={MapPin}
					label="Total Branches"
					value="18"
					tone="emerald"
				/>
				<CompactMetric icon={Users} label="Total Users" value="125" tone="purple" />
			</div>
			<Panel title="Company Information">
				<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.85fr)]">
					<div className="grid gap-3">
						<DetailRow label="Company Name" value={company.name} />
						<DetailRow label="Contact Email" value={company.contactEmail} />
						<DetailRow label="Contact No." value={company.contactNumber} />
						<DetailRow label="Website" value={company.website} link />
						<DetailRow label="Industry" value={company.industry} />
						<DetailRow label="TIN" value={company.tin} />
						<DetailRow
							label="Status"
							value={<MasterCompanyStatusBadge status={company.status} />}
						/>
					</div>
					<div className="border-darknavy/10 lg:border-l lg:pl-6">
						<h3 className="text-sm font-bold text-darknavy">Address</h3>
						<div className="mt-4 grid gap-2 text-sm font-semibold leading-6 text-darknavy/72">
							{company.addressLines.map((line) => (
								<p key={line}>{line}</p>
							))}
						</div>
						<div className="mt-6 border-t border-darknavy/10 pt-5">
							<DetailRow label="Date Added" value={company.dateAdded} />
						</div>
					</div>
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
									{company.planName}
								</h3>
								<span className="rounded-md bg-purple-500/12 px-2 py-1 text-xs font-bold text-purple-700">
									Current Plan
								</span>
							</div>
							<p className="mt-3 max-w-sm text-sm font-medium leading-6 text-darknavy/65">
								{company.planDescription}
							</p>
						</div>
					</div>
					<div className="grid gap-4 md:grid-cols-2">
						<IconDetail icon={GitBranch} label="Billing Cycle" value={company.billingCycle} />
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
						<IconDetail icon={Database} label="Amount" value={company.amount} />
					</div>
				</div>
			</Panel>
			<Panel
				title="Plan Usage"
				actions={<SmallButton>View Usage Details</SmallButton>}
				description="Your usage and limits for the current plan."
			>
				<div className="grid gap-5 lg:grid-cols-3">
					<UsageMeter
						colorClassName="bg-emerald-500"
						icon={MapPin}
						label="Branches"
						percent={72}
						value="18 / 25"
					/>
					<UsageMeter
						colorClassName="bg-purple-500"
						icon={Users}
						label="Users"
						percent={83}
						value="125 / 150"
					/>
					<UsageMeter
						colorClassName="bg-orange-500"
						icon={Database}
						label="Storage"
						percent={45}
						value="45 GB / 100 GB"
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
				<SmallButton>Change Plan</SmallButton>
			</div>
		</div>
	);
}

function BranchesSection({
	company,
}: {
	company: MasterSubscriberManagementCompanyRecord;
}) {
	return (
		<div className="grid gap-4">
			<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
				<CompactMetric icon={Building2} label="Total Branches" value={String(company.branchCount)} tone="blue" />
				<CompactMetric icon={CheckCircle2} label="Active Branches" value="4" tone="emerald" />
				<CompactMetric icon={Building2} label="Inactive Branches" value="1" tone="orange" />
				<CompactMetric icon={Users} label="Total Users Across Branches" value={String(company.userCount)} tone="purple" />
			</div>
			<div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(12rem,0.8fr)_minmax(12rem,0.8fr)_auto]">
				<SearchInput placeholder="Search branch name, address..." />
				<SelectControl label="Status" />
				<SelectControl label="Branch Type" />
				<SmallButton icon={Filter}>Filters</SmallButton>
			</div>
			<div className="overflow-x-auto rounded-lg border border-darknavy/10">
				<table className="w-full min-w-[58rem] border-collapse text-left text-sm">
					<thead className="bg-offwhite text-xs font-bold text-darknavy/70">
						<tr>
							<th className="px-4 py-4">Branch Name</th>
							<th className="px-4 py-4">Address</th>
							<th className="px-4 py-4">Users</th>
							<th className="px-4 py-4">Status</th>
							<th className="px-4 py-4">Added On</th>
							<th className="px-4 py-4 text-center">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-darknavy/10">
						{MasterSubscriberManagementBranches.map((branch) => (
							<tr key={branch.id} className="transition hover:bg-skyblue/10">
								<td className="px-4 py-4">
									<div className="flex items-center gap-3">
										<MasterSubscriberIcon
											tone={branch.tone}
											className="h-10 w-10"
										/>
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
								<td className="px-4 py-4 font-semibold leading-6 text-darknavy/72">
									{branch.address}
								</td>
								<td className="px-4 py-4 font-bold text-darknavy">
									<span className="inline-flex items-center gap-2">
										<Users className="h-4 w-4 text-purple-600" aria-hidden="true" />
										{branch.users}
									</span>
								</td>
								<td className="px-4 py-4">
									<MasterCompanyStatusBadge status={branch.status} />
								</td>
								<td className="px-4 py-4 font-semibold text-darknavy/72">
									{branch.addedOn}
								</td>
								<td className="px-4 py-4">
									<TableActions />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<TableFooter label="branches" total={5} />
		</div>
	);
}

function UsersSection() {
	return (
		<div className="grid gap-4">
			<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
				<CompactMetric icon={Users} label="Total Users" value="35" tone="purple" />
				<CompactMetric icon={Users} label="Active Users" value="30" helper="85.7%" tone="emerald" />
				<CompactMetric icon={Users} label="Inactive Users" value="3" helper="8.6%" tone="orange" />
				<CompactMetric icon={Mail} label="Invited Users" value="2" helper="5.7%" tone="blue" />
			</div>
			<div className="grid gap-3 md:grid-cols-[minmax(0,1.5fr)_minmax(12rem,0.8fr)_minmax(12rem,0.8fr)_auto_auto]">
				<SearchInput placeholder="Search by name, email or phone..." />
				<SelectControl label="Status" />
				<SelectControl label="Branch Access" value="All Branches" />
				<SmallButton icon={Filter}>Filters</SmallButton>
				<SmallButton>Clear</SmallButton>
			</div>
			<div className="overflow-x-auto rounded-lg border border-darknavy/10">
				<table className="w-full min-w-[64rem] border-collapse text-left text-sm">
					<thead className="bg-offwhite text-xs font-bold text-darknavy/70">
						<tr>
							<th className="px-4 py-4">User</th>
							<th className="px-4 py-4">Email</th>
							<th className="px-4 py-4">Branch Access</th>
							<th className="px-4 py-4">Status</th>
							<th className="px-4 py-4">Last Active</th>
							<th className="px-4 py-4">Added On</th>
							<th className="px-4 py-4 text-center">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-darknavy/10">
						{MasterSubscriberManagementUsers.map((user) => (
							<tr key={user.id} className="transition hover:bg-skyblue/10">
								<td className="px-4 py-4">
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
								<td className="px-4 py-4 font-medium text-darknavy/72">
									{user.email}
								</td>
								<td className="px-4 py-4">
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
								<td className="px-4 py-4">
									<MasterUserStatusBadge status={user.status} />
								</td>
								<td className="px-4 py-4 font-semibold text-darknavy/72">
									<span className="block">{user.lastActiveDate}</span>
									<span className="block">{user.lastActiveTime}</span>
								</td>
								<td className="px-4 py-4 font-semibold text-darknavy/72">
									{user.addedOn}
								</td>
								<td className="px-4 py-4">
									<TableActions />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<TableFooter label="users" total={35} pages={7} />
		</div>
	);
}

function StorageSection({
	company,
}: {
	company: MasterSubscriberManagementCompanyRecord;
}) {
	const usedPercent = Math.round(
		(company.storageUsedGb / company.storageTotalGb) * 100,
	);

	return (
		<div className="grid gap-4">
			<div className="grid gap-4 xl:grid-cols-[0.9fr_1.2fr_0.9fr]">
				<Panel title="Storage Usage" titleAddon={<InfoIcon />}>
					<div className="flex flex-col items-center gap-6 sm:flex-row">
						<div
							className="grid h-32 w-32 shrink-0 place-items-center rounded-full"
							style={{
								background: `conic-gradient(rgb(var(--skyblue-rgb)) 0deg ${
									usedPercent * 3.6
								}deg, rgba(33,39,56,0.1) ${
									usedPercent * 3.6
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
									{company.storageUsedGb} GB
								</span>{" "}
								/ {company.storageTotalGb} GB
							</p>
							<p className="text-darknavy/62">Total Storage</p>
							<p className="text-darknavy/70">Used {company.storageUsedGb} GB</p>
							<p className="text-darknavy/70">Available {company.storageAvailableGb} GB</p>
						</div>
					</div>
					<div className="mt-6 rounded-lg bg-emerald-500/12 p-3 text-sm font-semibold text-emerald-700">
						You have {company.storageAvailableGb} GB of storage available.
					</div>
				</Panel>
				<Panel title="Storage Breakdown" titleAddon={<InfoIcon />}>
					<div className="grid gap-4">
						{MasterSubscriberManagementStorageBreakdown.map((item) => (
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
							<span>45 GB</span>
							<span className="text-right">100%</span>
						</div>
					</div>
				</Panel>
				<StorageActionsPanel />
			</div>
			<div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
				<TopBranchUsagePanel />
				<StorageDetailsPanel />
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
		["Professional Plan", "Annual", "$2,499.00", "May 12, 2024", "May 12, 2025", "Active"],
		["Professional Plan", "Annual", "$2,499.00", "May 12, 2023", "May 12, 2024", "Completed"],
		["Basic Plan", "Annual", "$1,499.00", "May 12, 2022", "May 12, 2023", "Completed"],
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
					2.4 GB freed
				</span>
			</div>
		</Panel>
	);
}

function TopBranchUsagePanel() {
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
						{MasterSubscriberManagementStorageBranches.map((branch) => (
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

function StorageDetailsPanel() {
	return (
		<Panel title="Storage Details">
			<div className="grid gap-4 text-sm">
				<InlineStat label="Total Storage" value="100 GB" />
				<InlineStat label="Used Storage" value="45 GB" />
				<InlineStat label="Available Storage" value="55 GB" />
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

function SearchInput({ placeholder }: { placeholder: string }) {
	return (
		<label className="relative">
			<span className="sr-only">{placeholder}</span>
			<Search
				className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/45"
				aria-hidden="true"
			/>
			<input
				className="h-12 w-full rounded-lg border border-darknavy/10 bg-white pl-11 pr-4 text-sm font-semibold text-darknavy shadow-sm shadow-darknavy/5 outline-none transition placeholder:text-darknavy/35 focus:border-[rgb(var(--skyblue-rgb)/0.45)] focus:ring-4 focus:ring-[rgb(var(--skyblue-rgb)/0.16)]"
				placeholder={placeholder}
			/>
		</label>
	);
}

function SelectControl({
	label,
	value = "All",
}: {
	label: string;
	value?: string;
}) {
	return (
		<label className="relative">
			<span className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs font-semibold text-darknavy/70">
				{label}
			</span>
			<select
				className="h-12 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy shadow-sm shadow-darknavy/5 outline-none transition focus:border-[rgb(var(--skyblue-rgb)/0.45)] focus:ring-4 focus:ring-[rgb(var(--skyblue-rgb)/0.16)]"
				value={value}
				onChange={() => undefined}
			>
				<option>{value}</option>
			</select>
		</label>
	);
}

function SmallButton({
	children,
	className,
	icon: Icon,
}: {
	children: ReactNode;
	className?: string;
	icon?: LucideIcon;
}) {
	return (
		<button
			type="button"
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

function TableActions() {
	return (
		<div className="flex justify-center gap-2">
			<IconButton icon={Edit3} label="Edit record" />
			<IconButton icon={MoreVertical} label="More actions" />
		</div>
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

function getPageDescription(section: MasterSubscriberManagementCompanySection) {
	switch (section) {
		case "company-information":
			return "View and manage all companies under this subscriber.";
		case "subscription-and-plan":
			return "View and manage the subscription plan details for this company.";
		case "branches":
			return "View and manage all branches under this company.";
		case "users":
			return "View and manage all users under this company.";
		case "storage":
			return "View and manage storage usage for this company.";
		case "billing-and-invoices":
			return "View and manage billing information and invoices for this company.";
	}
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
