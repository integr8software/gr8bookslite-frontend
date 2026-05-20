"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronsUpDown,
	Download,
	Edit3,
	Filter,
	Home,
	Landmark,
	Plus,
	Search,
	Trash2,
	Upload,
	X,
} from "lucide-react";
import {
	AccountCategories,
	AccountStatuses,
	AccountTabs,
	AccountTypes,
	NormalBalances,
	StatementGroups,
	StatementSections,
} from "@/app/src/constants/modules/charts-of-accounts/ChartsOfAccountsConstants";
import {
	EmptyAccountFormValues,
	EmptyBankDetails,
} from "@/app/src/data/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsData";
import { useChartsOfAccounts } from "@/app/src/hooks/modules/maintenance/financial-management/charts-of-accounts/useChartsOfAccounts";
import type {
	AccountSortKey,
	ChartAccount,
	ChartAccountFormValues,
} from "@/app/src/types/modules/charts-of-accounts/ChartsOfAccountsTypes";

export function ChartsOfAccountsMain() {
	const coa = useChartsOfAccounts();

	return (
		<section className="-mx-3 -my-4 min-h-[calc(100dvh-5rem)] bg-slate-100 text-slate-950 sm:-mx-5 lg:-mx-6">
			<div className="min-h-[calc(100dvh-5rem)]">
				<div className="min-w-0">
					<main className="grid gap-5 p-4 sm:p-6">
						<PageHeader onAddAccount={coa.openAddDrawer} />

						<Card className="overflow-hidden">
							<div className="border-b border-slate-200 p-4 sm:p-5">
								<Tabs
									value={coa.activeTab}
									options={[...AccountTabs]}
									onChange={coa.setActiveTab}
								/>
								<div className="mt-5 grid gap-3 xl:grid-cols-[minmax(16rem,1fr)_13rem_13rem_11rem_auto]">
									<div className="relative">
										<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
										<Input
											value={coa.searchQuery}
											onChange={(event) => coa.setSearchQuery(event.target.value)}
											placeholder="Search account number or name"
											className="pl-9"
										/>
									</div>
									<Select
										value={coa.accountTypeFilter}
										onChange={(event) =>
											coa.setAccountTypeFilter(event.target.value as never)
										}
									>
										<option value="All">Account Type</option>
										{AccountTypes.map((type) => (
											<option key={type} value={type}>
												{type}
											</option>
										))}
									</Select>
									<Select
										value={coa.statementGroupFilter}
										onChange={(event) =>
											coa.setStatementGroupFilter(event.target.value as never)
										}
									>
										<option value="All">Statement Group</option>
										{StatementGroups.map((group) => (
											<option key={group} value={group}>
												{group}
											</option>
										))}
									</Select>
									<Select
										value={coa.statusFilter}
										onChange={(event) =>
											coa.setStatusFilter(event.target.value as never)
										}
									>
										<option value="All">Status</option>
										{AccountStatuses.map((status) => (
											<option key={status} value={status}>
												{status}
											</option>
										))}
									</Select>
									<Button variant="secondary">
										<Filter className="h-4 w-4" aria-hidden="true" />
										Filter
									</Button>
								</div>
							</div>

							<AccountTable
								expandedIds={coa.expandedIds}
								isLoading={coa.isLoading}
								page={coa.page}
								rows={coa.paginatedAccounts}
								sortDirection={coa.sortDirection}
								sortKey={coa.sortKey}
								totalPages={coa.totalPages}
								totalRows={coa.visibleAccounts.length}
								onDelete={coa.deleteAccount}
								onEdit={coa.openEditDrawer}
								onPageChange={coa.setPage}
								onSort={coa.handleSort}
								onToggleExpanded={coa.toggleExpanded}
							/>
						</Card>
					</main>
				</div>
			</div>

			<AccountDrawer
				account={coa.drawerAccount}
				accounts={coa.flatAccounts.map((item) => item.account)}
				isOpen={coa.isDrawerOpen}
				onClose={coa.closeDrawer}
				onSave={coa.saveAccount}
			/>
		</section>
	);
}

function PageHeader({ onAddAccount }: { onAddAccount: () => void }) {
	return (
		<div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
			<div>
				<div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
					<Home className="h-3.5 w-3.5" aria-hidden="true" />
					Accounting master data
				</div>
				<h1 className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">
					Chart of Accounts
				</h1>
				<p className="mt-2 max-w-2xl text-sm text-slate-500">
					Manage all company accounts and financial statement mapping
				</p>
			</div>
			<div className="flex flex-wrap gap-2">
				<Button variant="secondary">
					<Upload className="h-4 w-4" aria-hidden="true" />
					Import
				</Button>
				<Button variant="secondary">
					<Download className="h-4 w-4" aria-hidden="true" />
					Export
				</Button>
				<Button onClick={onAddAccount}>
					<Plus className="h-4 w-4" aria-hidden="true" />
					Add Account
				</Button>
			</div>
		</div>
	);
}

type AccountTableProps = {
	expandedIds: Set<string>;
	isLoading: boolean;
	page: number;
	rows: Array<{ account: ChartAccount; level: number }>;
	sortDirection: "asc" | "desc";
	sortKey: AccountSortKey;
	totalPages: number;
	totalRows: number;
	onDelete: (accountId: string) => void;
	onEdit: (account: ChartAccount) => void;
	onPageChange: (page: number) => void;
	onSort: (key: AccountSortKey) => void;
	onToggleExpanded: (accountId: string) => void;
};

function AccountTable({
	expandedIds,
	isLoading,
	page,
	rows,
	sortDirection,
	sortKey,
	totalPages,
	totalRows,
	onDelete,
	onEdit,
	onPageChange,
	onSort,
	onToggleExpanded,
}: AccountTableProps) {
	const columns: Array<{ label: string; key?: AccountSortKey; className?: string }> = [
		{ label: "Account Number", key: "accountNumber", className: "min-w-36" },
		{ label: "Account Name", key: "accountName", className: "min-w-72" },
		{ label: "Account Type", key: "accountType", className: "min-w-32" },
		{ label: "Statement Group", key: "statementGroup", className: "min-w-40" },
		{ label: "Statement Section", className: "min-w-44" },
		{ label: "Normal Balance", key: "normalBalance", className: "min-w-36" },
		{ label: "Status", key: "status", className: "min-w-28" },
		{ label: "Actions", className: "sticky right-0 min-w-28 bg-slate-50 text-right" },
	];

	return (
		<div>
			<div className="max-h-[58vh] overflow-auto">
				<table className="w-full min-w-[78rem] border-collapse text-left">
					<thead className="sticky top-0 z-10 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
						<tr className="border-b border-slate-200">
							{columns.map((column) => (
								<th key={column.label} className={joinClasses("px-4 py-3", column.className)}>
									{column.key ? (
										<button
											type="button"
											onClick={() => onSort(column.key as AccountSortKey)}
											className="flex items-center gap-1 rounded text-left transition hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
										>
											{column.label}
											<ChevronsUpDown
												className={joinClasses(
													"h-3.5 w-3.5",
													sortKey === column.key && "text-blue-600",
													sortKey === column.key &&
														sortDirection === "desc" &&
														"rotate-180",
												)}
												aria-hidden="true"
											/>
										</button>
									) : (
										column.label
									)}
								</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100 bg-white">
						{isLoading ? (
							<SkeletonRows />
						) : rows.length > 0 ? (
							rows.map(({ account, level }) => (
								<motion.tr
									key={account.id}
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.18 }}
									className="group hover:bg-blue-50/40"
								>
									<td className="px-4 py-3 text-sm font-semibold text-slate-800">
										{account.accountNumber}
									</td>
									<td className="px-4 py-3">
										<div
											className="flex items-center gap-2"
											style={{ paddingLeft: `${level * 1.25}rem` }}
										>
											<button
												type="button"
												disabled={!account.children?.length}
												onClick={() => onToggleExpanded(account.id)}
												aria-label={`Toggle ${account.accountName}`}
												className={joinClasses(
													"flex h-7 w-7 items-center justify-center rounded-md transition",
													account.children?.length
														? "text-slate-500 hover:bg-white hover:text-blue-700"
														: "text-transparent",
												)}
											>
												<ChevronRight
													className={joinClasses(
														"h-4 w-4 transition",
														expandedIds.has(account.id) && "rotate-90",
													)}
													aria-hidden="true"
												/>
											</button>
											<div className="min-w-0">
												<p className="truncate text-sm font-semibold text-slate-950">
													{account.accountName}
												</p>
												<p className="truncate text-xs text-slate-500">
													{account.description || "No description"}
												</p>
											</div>
										</div>
									</td>
									<td className="px-4 py-3">
										<TypeBadge type={account.accountType} />
									</td>
									<td className="px-4 py-3 text-sm text-slate-600">
										{account.statementGroup}
									</td>
									<td className="px-4 py-3 text-sm text-slate-600">
										{account.statementSection}
									</td>
									<td className="px-4 py-3">
										<Badge variant={account.normalBalance === "Debit" ? "blue" : "violet"}>
											{account.normalBalance}
										</Badge>
									</td>
									<td className="px-4 py-3">
										<Badge variant={account.status === "Active" ? "green" : "gray"}>
											{account.status}
										</Badge>
									</td>
									<td className="sticky right-0 bg-white px-4 py-3 text-right shadow-[-12px_0_20px_rgba(255,255,255,0.86)] group-hover:bg-blue-50">
										<div className="flex justify-end gap-1">
											<Button
												size="icon"
												variant="ghost"
												aria-label={`Edit ${account.accountName}`}
												onClick={() => onEdit(account)}
											>
												<Edit3 className="h-4 w-4" aria-hidden="true" />
											</Button>
											<Button
												size="icon"
												variant="danger"
												aria-label={`Delete ${account.accountName}`}
												onClick={() => onDelete(account.id)}
											>
												<Trash2 className="h-4 w-4" aria-hidden="true" />
											</Button>
										</div>
									</td>
								</motion.tr>
							))
						) : (
							<tr>
								<td colSpan={8} className="px-4 py-16 text-center">
									<div className="mx-auto flex max-w-sm flex-col items-center">
										<span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
											<Search className="h-5 w-5" aria-hidden="true" />
										</span>
										<p className="mt-4 text-sm font-semibold text-slate-950">
											No accounts found
										</p>
										<p className="mt-1 text-sm text-slate-500">
											Adjust the filters or add a new ledger account.
										</p>
									</div>
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			<div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
				<span>
					Showing {rows.length} of {totalRows} accounts
				</span>
				<div className="flex items-center gap-2">
					<Button
						variant="secondary"
						disabled={page === 1}
						onClick={() => onPageChange(Math.max(1, page - 1))}
					>
						<ChevronLeft className="h-4 w-4" aria-hidden="true" />
						Previous
					</Button>
					<span className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">
						Page {page} of {totalPages}
					</span>
					<Button
						variant="secondary"
						disabled={page === totalPages}
						onClick={() => onPageChange(Math.min(totalPages, page + 1))}
					>
						Next
						<ChevronRight className="h-4 w-4" aria-hidden="true" />
					</Button>
				</div>
			</div>
		</div>
	);
}

function SkeletonRows() {
	return Array.from({ length: 8 }).map((_, index) => (
		<tr key={index} className="animate-pulse">
			{Array.from({ length: 8 }).map((__, cellIndex) => (
				<td key={cellIndex} className="px-4 py-4">
					<div className="h-4 rounded bg-slate-100" />
				</td>
			))}
		</tr>
	));
}

type AccountDrawerProps = {
	account: ChartAccount | null;
	accounts: ChartAccount[];
	isOpen: boolean;
	onClose: () => void;
	onSave: (values: ChartAccountFormValues) => void;
};

function AccountDrawer({ account, accounts, isOpen, onClose, onSave }: AccountDrawerProps) {
	return (
		<AnimatePresence>
			{isOpen ? (
				<AccountDrawerPanel
					key={account?.id ?? "new-account"}
					account={account}
					accounts={accounts}
					onClose={onClose}
					onSave={onSave}
				/>
			) : null}
		</AnimatePresence>
	);
}

function AccountDrawerPanel({
	account,
	accounts,
	onClose,
	onSave,
}: Omit<AccountDrawerProps, "isOpen">) {
	const [activeTab, setActiveTab] = useState<"Account Information" | "Bank Details">(
		"Account Information",
	);
	const [values, setValues] = useState<ChartAccountFormValues>(() =>
		account ? accountToFormValues(account) : EmptyAccountFormValues,
	);
	const [submitted, setSubmitted] = useState(false);

	const showBankDetails = values.accountCategory === "Cash in Bank";
	const isInvalid = submitted && (!values.accountNumber || !values.accountName);

	function updateField<Key extends keyof ChartAccountFormValues>(
		key: Key,
		value: ChartAccountFormValues[Key],
	) {
		setValues((current) => ({ ...current, [key]: value }));
	}

	function updateBankField(key: keyof NonNullable<ChartAccountFormValues["bankDetails"]>, value: string) {
		setValues((current) => ({
			...current,
			bankDetails: {
				...(current.bankDetails ?? EmptyBankDetails),
				[key]: value,
			},
		}));
	}

	function handleSubmit() {
		setSubmitted(true);
		if (!values.accountNumber || !values.accountName) {
			return;
		}
		onSave(values);
	}

	return (
		<>
					<motion.button
						type="button"
						aria-label="Close drawer overlay"
						className="fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-sm"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
					/>
					<motion.aside
						role="dialog"
						aria-modal="true"
						aria-label={account ? "Edit account" : "Add account"}
						className="fixed bottom-0 right-0 top-0 z-[60] flex w-full max-w-2xl flex-col bg-white shadow-[-30px_0_70px_rgba(15,23,42,0.22)]"
						initial={{ x: "100%" }}
						animate={{ x: 0 }}
						exit={{ x: "100%" }}
						transition={{ type: "spring", damping: 32, stiffness: 260 }}
					>
						<div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
							<div>
								<p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
									{account ? "Edit ledger account" : "Create ledger account"}
								</p>
								<h2 className="mt-1 text-xl font-semibold text-slate-950">
									{account ? account.accountName : "Add Account"}
								</h2>
								<p className="mt-1 text-sm text-slate-500">
									Configure reporting, hierarchy, and bank setup.
								</p>
							</div>
							<Button variant="ghost" size="icon" aria-label="Close drawer" onClick={onClose}>
								<X className="h-5 w-5" aria-hidden="true" />
							</Button>
						</div>

						<div className="border-b border-slate-200 px-6 py-4">
							<Tabs
								value={activeTab}
								options={showBankDetails ? ["Account Information", "Bank Details"] : ["Account Information"]}
								onChange={(tab) => setActiveTab(tab as never)}
							/>
						</div>

						<div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
							{activeTab === "Account Information" ? (
								<div className="grid gap-4 sm:grid-cols-2">
									<Field label="Account Number" error={isInvalid && !values.accountNumber ? "Required" : undefined}>
										<Input
											value={values.accountNumber}
											onChange={(event) => updateField("accountNumber", event.target.value)}
											className={submitted && !values.accountNumber ? "border-red-300 ring-2 ring-red-100" : undefined}
											placeholder="1110"
										/>
									</Field>
									<Field label="Account Name" error={isInvalid && !values.accountName ? "Required" : undefined}>
										<Input
											value={values.accountName}
											onChange={(event) => updateField("accountName", event.target.value)}
											className={submitted && !values.accountName ? "border-red-300 ring-2 ring-red-100" : undefined}
											placeholder="Cash in Bank - BDO"
										/>
									</Field>
									<Field label="Parent Account">
										<Select
											value={values.parentId ?? ""}
											onChange={(event) => updateField("parentId", event.target.value || null)}
										>
											<option value="">No parent account</option>
											{accounts
												.filter((item) => item.id !== account?.id)
												.map((item) => (
													<option key={item.id} value={item.id}>
														{item.accountNumber} - {item.accountName}
													</option>
												))}
										</Select>
									</Field>
									<Field label="Account Type">
										<Select
											value={values.accountType}
											onChange={(event) => updateField("accountType", event.target.value as never)}
										>
											{AccountTypes.map((type) => (
												<option key={type} value={type}>
													{type}
												</option>
											))}
										</Select>
									</Field>
									<Field label="Statement Group">
										<Select
											value={values.statementGroup}
											onChange={(event) => updateField("statementGroup", event.target.value as never)}
										>
											{StatementGroups.map((group) => (
												<option key={group} value={group}>
													{group}
												</option>
											))}
										</Select>
									</Field>
									<Field label="Statement Section">
										<Select
											value={values.statementSection}
											onChange={(event) => updateField("statementSection", event.target.value)}
										>
											{StatementSections.map((section) => (
												<option key={section} value={section}>
													{section}
												</option>
											))}
										</Select>
									</Field>
									<Field label="Normal Balance">
										<Select
											value={values.normalBalance}
											onChange={(event) => updateField("normalBalance", event.target.value as never)}
										>
											{NormalBalances.map((balance) => (
												<option key={balance} value={balance}>
													{balance}
												</option>
											))}
										</Select>
									</Field>
									<Field label="Account Category">
										<Select
											value={values.accountCategory}
											onChange={(event) => updateField("accountCategory", event.target.value as never)}
										>
											{AccountCategories.map((category) => (
												<option key={category} value={category}>
													{category}
												</option>
											))}
										</Select>
									</Field>
									<Field label="Description" className="sm:col-span-2">
										<textarea
											value={values.description}
											onChange={(event) => updateField("description", event.target.value)}
											placeholder="Internal reporting notes"
											className="min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
										/>
									</Field>
									<Field label="Status">
										<Select
											value={values.status}
											onChange={(event) => updateField("status", event.target.value as never)}
										>
											{AccountStatuses.map((status) => (
												<option key={status} value={status}>
													{status}
												</option>
											))}
										</Select>
									</Field>
									<label className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5">
										<span>
											<span className="block text-sm font-semibold text-slate-800">
												Show in Reports
											</span>
											<span className="text-xs text-slate-500">
												Include this account in financial statements
											</span>
										</span>
										<input
											type="checkbox"
											checked={values.showInReports}
											onChange={(event) => updateField("showInReports", event.target.checked)}
											className="h-5 w-5 rounded border-slate-300 text-blue-600"
										/>
									</label>
									{showBankDetails ? (
										<div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 sm:col-span-2">
											<div className="flex items-start gap-3">
												<Landmark className="mt-0.5 h-5 w-5 text-blue-700" aria-hidden="true" />
												<div>
													<p className="text-sm font-semibold text-slate-950">
														Bank details enabled
													</p>
													<p className="mt-1 text-sm text-slate-600">
														Use the Bank Details tab to maintain branch, currency, and opening balance information.
													</p>
												</div>
											</div>
										</div>
									) : null}
								</div>
							) : (
								<div className="grid gap-4 sm:grid-cols-2">
									{[
										["Bank Name", "bankName"],
										["Bank Account Number", "bankAccountNumber"],
										["Branch", "branch"],
										["SWIFT/BIC Code", "swiftCode"],
										["Currency", "currency"],
										["Account Type", "accountType"],
										["Opening Balance", "openingBalance"],
										["Opening Balance Date", "openingBalanceDate"],
										["Contact Person", "contactPerson"],
										["Contact Number", "contactNumber"],
									].map(([label, key]) => (
										<Field key={key} label={label}>
											<Input
												type={key === "openingBalanceDate" ? "date" : "text"}
												value={
													values.bankDetails?.[
														key as keyof NonNullable<ChartAccountFormValues["bankDetails"]>
													] ?? ""
												}
												onChange={(event) =>
													updateBankField(
														key as keyof NonNullable<ChartAccountFormValues["bankDetails"]>,
														event.target.value,
													)
												}
											/>
										</Field>
									))}
								</div>
							)}
						</div>

						<div className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-slate-200 bg-white px-6 py-4">
							<Button variant="secondary" onClick={onClose}>
								Cancel
							</Button>
							<Button onClick={handleSubmit}>
								{account ? "Save Changes" : "Create Account"}
							</Button>
						</div>
					</motion.aside>
		</>
	);
}

function accountToFormValues(account: ChartAccount): ChartAccountFormValues {
	return {
		accountNumber: account.accountNumber,
		accountName: account.accountName,
		parentId: account.parentId,
		accountType: account.accountType,
		statementGroup: account.statementGroup,
		statementSection: account.statementSection,
		normalBalance: account.normalBalance,
		accountCategory: account.accountCategory,
		description: account.description,
		status: account.status,
		showInReports: account.showInReports,
		bankDetails: account.bankDetails ?? EmptyBankDetails,
	};
}

function Field({
	children,
	className,
	error,
	label,
}: {
	children: ReactNode;
	className?: string;
	error?: string;
	label: string;
}) {
	return (
		<label className={joinClasses("grid gap-1.5", className)}>
			<span className="flex items-center justify-between text-sm font-semibold text-slate-700">
				{label}
				{error ? <span className="text-xs text-red-500">{error}</span> : null}
			</span>
			{children}
		</label>
	);
}

function TypeBadge({ type }: { type: ChartAccount["accountType"] }) {
	const variantByType = {
		Asset: "blue",
		Liability: "amber",
		Equity: "violet",
		Revenue: "green",
		Expense: "rose",
	} as const;

	return <Badge variant={variantByType[type]}>{type}</Badge>;
}

function Card({ children, className }: { children: ReactNode; className?: string }) {
	return (
		<div
			className={joinClasses(
				"rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70",
				className,
			)}
		>
			{children}
		</div>
	);
}

function Button({
	children,
	className,
	size = "default",
	variant = "primary",
	...props
}: ComponentProps<"button"> & {
	size?: "default" | "icon";
	variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
	return (
		<button
			type="button"
			className={joinClasses(
				"inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-45",
				size === "icon" ? "h-9 w-9" : "h-10 px-4",
				variant === "primary" &&
					"bg-blue-600 text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 focus-visible:ring-blue-500/20",
				variant === "secondary" &&
					"border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-blue-500/15",
				variant === "ghost" &&
					"text-slate-600 hover:bg-slate-100 hover:text-slate-950 focus-visible:ring-blue-500/15",
				variant === "danger" &&
					"text-red-600 hover:bg-red-50 focus-visible:ring-red-500/15",
				className,
			)}
			{...props}
		>
			{children}
		</button>
	);
}

function Input({ className, ...props }: ComponentProps<"input">) {
	return (
		<input
			className={joinClasses(
				"h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10",
				className,
			)}
			{...props}
		/>
	);
}

function Select({ children, className, ...props }: ComponentProps<"select">) {
	return (
		<div className="relative">
			<select
				className={joinClasses(
					"h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10",
					className,
				)}
				{...props}
			>
				{children}
			</select>
			<ChevronDown
				className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
				aria-hidden="true"
			/>
		</div>
	);
}

function Badge({
	children,
	variant = "gray",
}: {
	children: ReactNode;
	variant?: "blue" | "green" | "gray" | "amber" | "violet" | "rose";
}) {
	const classes = {
		blue: "bg-blue-50 text-blue-700 ring-blue-200",
		green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
		gray: "bg-slate-100 text-slate-600 ring-slate-200",
		amber: "bg-amber-50 text-amber-700 ring-amber-200",
		violet: "bg-violet-50 text-violet-700 ring-violet-200",
		rose: "bg-rose-50 text-rose-700 ring-rose-200",
	};

	return (
		<span
			className={joinClasses(
				"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
				classes[variant],
			)}
		>
			{children}
		</span>
	);
}

function Tabs<TValue extends string>({
	onChange,
	options,
	value,
}: {
	onChange: (value: TValue) => void;
	options: TValue[];
	value: TValue;
}) {
	return (
		<div className="flex gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1">
			{options.map((option) => (
				<button
					key={option}
					type="button"
					onClick={() => onChange(option)}
					className={joinClasses(
						"relative whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold transition",
						value === option ? "text-blue-700" : "text-slate-500 hover:text-slate-950",
					)}
				>
					{value === option ? (
						<motion.span
							layoutId={`tab-indicator-${options.join("-")}`}
							className="absolute inset-0 rounded-md bg-white shadow-sm"
							transition={{ type: "spring", damping: 28, stiffness: 320 }}
						/>
					) : null}
					<span className="relative">{option}</span>
				</button>
			))}
		</div>
	);
}

function joinClasses(...classes: Array<string | undefined | false>) {
	return classes.filter(Boolean).join(" ");
}
