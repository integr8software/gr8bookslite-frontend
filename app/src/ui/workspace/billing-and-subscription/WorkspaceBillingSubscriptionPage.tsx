"use client";

import {
	Building2,
	CalendarClock,
	ChevronDown,
	ChevronRight,
	CreditCard,
	GitBranch,
	Plus,
	ReceiptText,
	Search,
	TicketPercent,
	Users,
	X,
} from "lucide-react";
import {
	formatWorkspaceBillingCurrency,
	formatWorkspaceBillingDate,
	formatWorkspaceBillingPromotionExpiry,
	formatWorkspaceBillingPromotionValue,
} from "@/app/src/data/workspace/billing-and-subscription/WorkspaceBillingSubscriptionData";
import { useWorkspaceBillingSubscriptionPage } from "@/app/src/hooks/workspace/billing-and-subscription/useWorkspaceBillingSubscriptionPage";
import type {
	WorkspaceBillingAddOnQuote,
	WorkspaceBillingCompanyAccount,
	WorkspaceBillingPaymentMethodRecord,
	WorkspaceBillingPromotionOption,
} from "@/app/src/types/workspace/billing-and-subscription/WorkspaceBillingSubscriptionTypes";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleInfoTooltip as InfoTooltip } from "@/app/src/ui/shared/module/ModuleInfoTooltip";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { WorkspaceBillingSubscriptionRecordActions } from "@/app/src/ui/workspace/billing-and-subscription/WorkspaceBillingSubscriptionRecordActions";
import { WorkspaceBillingSpotlightTutorial } from "@/app/src/ui/workspace/billing-and-subscription/WorkspaceBillingSpotlightTutorial";

export function WorkspaceBillingSubscriptionPage() {
	const page = useWorkspaceBillingSubscriptionPage();

	return (
		<section className="grid gap-5">
			<WorkspaceBillingSpotlightTutorial />
			<ModuleHeader
				data-spotlight-id="workspace-billing-header"
				variant="card"
				titleAs="h1"
				eyebrow="Workspace billing"
				title="Billing & Subscription"
				description={`${page.subscriber.name} subscription billing, company pricing, renewal checks, cards, and promotions.`}
			/>
			<div data-spotlight-id="workspace-billing-metrics">
				<ModuleStatisticCards
					items={[
					{
						icon: Building2,
						label: "Companies",
						helper: page.subscriber.planName,
						tone: "blue",
						value: page.summary.subscriberCount,
					},
					{
						icon: CalendarClock,
						label: "Renewal Checks",
						helper: "Due soon or overdue",
						tone: "amber",
						value: page.summary.renewalAlerts,
					},
					{
						icon: GitBranch,
						label: "Usage and add-ons",
						helper: "Branches and users",
						tone: "violet",
						value: formatWorkspaceBillingCurrency(page.summary.addOnTotal),
					},
					{
						icon: ReceiptText,
						label: "Payable Total",
						helper: `${page.summary.pastDueCompanies} past due`,
						tone: "cyan",
						value: formatWorkspaceBillingCurrency(page.summary.dueTotal),
					},
					]}
				/>
			</div>

			<section
				data-spotlight-id="workspace-billing-table"
				className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5"
			>
				<div
					data-spotlight-id="workspace-billing-filters"
					className="grid gap-3 border-b border-darknavy/10 p-4 lg:grid-cols-[minmax(18rem,1fr)_13rem]"
				>
					<label className="relative block min-w-0">
						<span className="sr-only">Search companies</span>
						<Search
							className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/42"
							aria-hidden="true"
						/>
						<input
							type="search"
							value={page.query}
							onChange={(event) => page.setQuery(event.target.value)}
							placeholder="Search company, renewal, or code"
							className="h-11 w-full rounded-md border border-darknavy/10 bg-white pl-10 pr-3 text-sm text-darknavy shadow-sm outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-4 focus:ring-skyblue/15"
						/>
					</label>
					<label className="block">
						<span className="sr-only">Renewal filter</span>
						<select
							value={page.renewalFilter}
							onChange={(event) =>
								page.setRenewalFilter(
									event.target.value as typeof page.renewalFilter,
								)
							}
							className="h-11 w-full rounded-md border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy shadow-sm outline-none transition focus:border-skyblue focus:ring-4 focus:ring-skyblue/15"
						>
							{page.renewalFilterOptions.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</label>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full min-w-[86rem] border-collapse text-left text-sm text-darknavy">
						<thead className="bg-offwhite text-xs font-bold uppercase tracking-[0.08em] text-darknavy/55">
							<tr>
								<th className="w-[20rem] px-4 py-3">Company</th>
								<th className="w-[14rem] px-4 py-3">Price</th>
								<th className="w-[17rem] px-4 py-3">Usage and add-ons</th>
								<th className="w-[13rem] px-4 py-3">Renewal</th>
								<th className="w-[15rem] px-4 py-3">Card</th>
								<th className="w-[18rem] px-4 py-3">Promotion</th>
								<th className="w-[6rem] px-4 py-3 text-right">Action</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-darknavy/10">
							{page.filteredAccounts.length > 0 ? (
								page.filteredAccounts.map((account) => {
									const selectedPaymentMethod =
										page.paymentMethods.find(
											(method) =>
												method.id ===
												page.getSelectedPaymentMethodId(account.id),
										) ?? page.paymentMethods[0];
									const isExpanded =
										page.expandedCompanyId === account.id;

									return (
										<CompanyBillingRows
											key={account.id}
											account={account}
											isExpanded={isExpanded}
											paymentMethods={page.paymentMethods}
											selectedPaymentMethod={selectedPaymentMethod}
											selectedPaymentMethodId={page.getSelectedPaymentMethodId(
												account.id,
											)}
											onApplyPromotion={(assignmentId) =>
												page.applyPromotion(account.id, assignmentId)
											}
											onApplyPromotionCode={() =>
												page.applyPromotionCode(account.id)
											}
											onAddPaymentMethod={page.addPaymentMethod}
											onCancelSubscription={() =>
												page.cancelSubscription(account.id)
											}
											onClearPromotion={() => page.clearPromotion(account.id)}
											onPay={() => page.payCompany(account.id)}
											onPromotionCodeChange={(code) =>
												page.updatePromotionCode(account.id, code)
											}
											onToggleExpanded={() =>
												page.setExpandedCompanyId(
													isExpanded ? null : account.id,
												)
											}
											promotionCodeError={page.getPromotionCodeError(
												account.id,
											)}
											promotionCodeValue={page.getPromotionCodeValue(
												account.id,
											)}
											onUpdatePaymentMethod={(paymentMethodId) =>
												page.updatePaymentMethod(
													account.id,
													paymentMethodId,
												)
											}
										/>
									);
								})
							) : (
								<tr>
									<td
										colSpan={7}
										className="px-4 py-10 text-center text-sm font-medium text-darknavy/55"
									>
										No companies match the current billing filters.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</section>
		</section>
	);
}

type CompanyBillingRowsProps = {
	account: WorkspaceBillingCompanyAccount;
	isExpanded: boolean;
	paymentMethods: WorkspaceBillingPaymentMethodRecord[];
	selectedPaymentMethod?: WorkspaceBillingPaymentMethodRecord;
	selectedPaymentMethodId: string;
	onApplyPromotion: (assignmentId: string) => void;
	onApplyPromotionCode: () => void;
	onAddPaymentMethod: () => void;
	onCancelSubscription: () => void;
	onClearPromotion: () => void;
	onPay: () => void;
	onPromotionCodeChange: (code: string) => void;
	onToggleExpanded: () => void;
	onUpdatePaymentMethod: (paymentMethodId: string) => void;
	promotionCodeError?: string;
	promotionCodeValue: string;
};

function CompanyBillingRows({
	account,
	isExpanded,
	paymentMethods,
	selectedPaymentMethod,
	selectedPaymentMethodId,
	onApplyPromotion,
	onApplyPromotionCode,
	onAddPaymentMethod,
	onCancelSubscription,
	onClearPromotion,
	onPay,
	onPromotionCodeChange,
	onToggleExpanded,
	onUpdatePaymentMethod,
	promotionCodeError,
	promotionCodeValue,
}: CompanyBillingRowsProps) {
	const ToggleIcon = isExpanded ? ChevronDown : ChevronRight;

	return (
		<>
			<tr className="align-top transition hover:bg-skyblue/5">
				<td className="px-4 py-4">
					<div className="flex min-w-0 gap-2">
						<button
							type="button"
							onClick={onToggleExpanded}
							className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-darknavy/10 bg-white text-darknavy/65 transition hover:border-skyblue hover:text-darknavy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15"
							aria-label={`${isExpanded ? "Collapse" : "Expand"} ${account.name}`}
						>
							<ToggleIcon className="h-4 w-4" aria-hidden="true" />
						</button>
						<div className="min-w-0">
							<p className="truncate font-semibold text-darknavy">
								{account.name}
							</p>
							<p className="mt-1 truncate text-xs font-semibold uppercase tracking-wide text-darknavy/38">
								{account.planName}
							</p>
							<div className="mt-2 flex flex-wrap gap-1.5">
								<span
									className={joinClasses(
										"rounded-md px-2 py-0.5 text-xs font-semibold",
										getCompanyStatusClassName(account.status),
									)}
								>
									{account.status}
								</span>
								<span className="rounded-md bg-offwhite px-2 py-0.5 text-xs font-semibold text-darknavy/65">
									{account.billingCycle}
								</span>
							</div>
						</div>
					</div>
				</td>
				<td className="px-4 py-4">
					<p className="font-semibold text-darknavy">
						{formatWorkspaceBillingCurrency(account.totalDue)}
					</p>
					<p className="mt-1 inline-flex items-center gap-1 text-xs text-darknavy/55">
						<span>Base {formatWorkspaceBillingCurrency(account.baseAmount)}</span>
						<InfoTooltip
							label={`${account.planName} base price breakdown`}
							title={account.planPrice.tooltip}
						/>
					</p>
					{account.discountAmount > 0 ? (
						<p className="mt-1 text-xs font-semibold text-emerald-600">
							Less {formatWorkspaceBillingCurrency(account.discountAmount)}
						</p>
					) : null}
				</td>
				<td className="px-4 py-4">
					<AddOnMiniSummary addOns={account.addOns} />
				</td>
				<td className="px-4 py-4">
					<RenewalBadge account={account} />
				</td>
				<td className="px-4 py-4">
					<PaymentMethodSelect
						paymentMethods={paymentMethods}
						selectedPaymentMethodId={selectedPaymentMethodId}
						onAddPaymentMethod={onAddPaymentMethod}
						onUpdatePaymentMethod={onUpdatePaymentMethod}
					/>
				</td>
				<td className="px-4 py-4">
					<PromotionSummary promotion={account.appliedPromotion} />
				</td>
				<td className="px-4 py-4">
					<WorkspaceBillingSubscriptionRecordActions
						account={account}
						onCancelSubscription={onCancelSubscription}
						onPay={onPay}
					/>
				</td>
			</tr>
			{isExpanded ? (
				<tr>
					<td colSpan={7} className="bg-offwhite/70 px-4 py-4">
						<ExpandedCompanyBilling
							account={account}
							selectedPaymentMethod={selectedPaymentMethod}
							onApplyPromotion={onApplyPromotion}
							onApplyPromotionCode={onApplyPromotionCode}
							onClearPromotion={onClearPromotion}
							onPromotionCodeChange={onPromotionCodeChange}
							promotionCodeError={promotionCodeError}
							promotionCodeValue={promotionCodeValue}
						/>
					</td>
				</tr>
			) : null}
		</>
	);
}

function AddOnMiniSummary({ addOns }: { addOns: WorkspaceBillingAddOnQuote[] }) {
	return (
		<div className="grid gap-1.5">
			{addOns.map((addOn) => (
				<div key={addOn.key} className="flex items-center gap-2 text-xs">
					{addOn.key === "branch" ? (
						<GitBranch className="h-3.5 w-3.5 text-darknavy/45" />
					) : (
						<Users className="h-3.5 w-3.5 text-darknavy/45" />
					)}
					<span className="font-semibold text-darknavy">
						{addOn.actualCount}
					</span>
					<span className="text-darknavy/55">{addOn.label}</span>
					<span className="ml-auto font-semibold text-darknavy/70">
						{formatWorkspaceBillingCurrency(addOn.billingAmount)}
					</span>
				</div>
			))}
		</div>
	);
}

function RenewalBadge({
	account,
}: {
	account: WorkspaceBillingCompanyAccount;
}) {
	if (account.status === "Trial" && account.trialStatusLabel) {
		return (
			<div className="grid gap-1">
				<span
					className={joinClasses(
						"inline-flex w-fit rounded-md px-2.5 py-1 text-xs font-semibold ring-1",
						getTrialStateClassName(account.trialDaysRemaining),
					)}
				>
					{account.trialStatusLabel}
				</span>
				<span className="text-xs font-medium text-darknavy/55">
					Ends {formatWorkspaceBillingDate(account.trialEndsAt ?? account.renewalDate)}
				</span>
			</div>
		);
	}

	return (
		<div className="grid gap-1">
			<span
				className={joinClasses(
					"inline-flex w-fit rounded-md px-2.5 py-1 text-xs font-semibold ring-1",
					getRenewalStateClassName(account.renewalState),
				)}
			>
				{account.renewalStatusLabel}
			</span>
			<span className="text-xs font-medium text-darknavy/55">
				{formatWorkspaceBillingDate(account.renewalDate)}
			</span>
		</div>
	);
}

function PaymentMethodSelect({
	onAddPaymentMethod,
	paymentMethods,
	selectedPaymentMethodId,
	onUpdatePaymentMethod,
}: {
	onAddPaymentMethod: () => void;
	paymentMethods: WorkspaceBillingPaymentMethodRecord[];
	selectedPaymentMethodId: string;
	onUpdatePaymentMethod: (paymentMethodId: string) => void;
}) {
	return (
		<div className="flex gap-2">
			<label className="min-w-0 flex-1">
				<span className="sr-only">Payment card</span>
				<select
					value={selectedPaymentMethodId}
					onChange={(event) => onUpdatePaymentMethod(event.target.value)}
					className="h-9 w-full rounded-md border border-darknavy/10 bg-white px-2 text-xs font-semibold text-darknavy shadow-sm outline-none transition focus:border-skyblue focus:ring-4 focus:ring-skyblue/15"
				>
					{paymentMethods.map((method) => (
						<option key={method.id} value={method.id}>
							{method.brand} {method.last4}
						</option>
					))}
				</select>
			</label>
			<button
				type="button"
				onClick={onAddPaymentMethod}
				aria-label="Add card"
				className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-darknavy/10 bg-white text-darknavy shadow-sm transition hover:border-skyblue/60 hover:bg-skyblue/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15"
			>
				<Plus className="h-4 w-4" aria-hidden="true" />
			</button>
		</div>
	);
}

type BillingDetailBadgeTone = "neutral" | "discount" | "percent";

type PriceLineBadge = {
	label: string;
	tone?: BillingDetailBadgeTone;
};

type PriceLineComparison = {
	discountPercent: number;
	regularValue: number;
};

function PromotionSummary({
	promotion,
}: {
	promotion: WorkspaceBillingPromotionOption | null;
}) {
	if (!promotion) {
		return <span className="text-xs font-medium text-darknavy/45">None</span>;
	}

	return (
		<div className="grid gap-1.5">
			<span className="font-semibold text-darknavy">{promotion.code}</span>
			<span className="flex flex-wrap gap-1">
				<BillingDetailBadge label={promotion.type} />
				<BillingDetailBadge
					label={formatWorkspaceBillingPromotionValue(promotion)}
					tone={getPromotionValueBadgeTone(promotion)}
				/>
			</span>
		</div>
	);
}

type ExpandedCompanyBillingProps = {
	account: WorkspaceBillingCompanyAccount;
	selectedPaymentMethod?: WorkspaceBillingPaymentMethodRecord;
	onApplyPromotion: (assignmentId: string) => void;
	onApplyPromotionCode: () => void;
	onClearPromotion: () => void;
	onPromotionCodeChange: (code: string) => void;
	promotionCodeError?: string;
	promotionCodeValue: string;
};

function ExpandedCompanyBilling({
	account,
	selectedPaymentMethod,
	onApplyPromotion,
	onApplyPromotionCode,
	onClearPromotion,
	onPromotionCodeChange,
	promotionCodeError,
	promotionCodeValue,
}: ExpandedCompanyBillingProps) {
	return (
		<div className="grid gap-4 lg:grid-cols-[1fr_1.1fr_1fr]">
			<section className="rounded-lg border border-darknavy/10 bg-white p-4">
				<div className="flex items-center gap-2 text-sm font-semibold text-darknavy">
					<ReceiptText className="h-4 w-4 text-skyblue" aria-hidden="true" />
					Price
				</div>
				<dl className="mt-3 divide-y divide-darknavy/10 text-sm">
					<PriceLine
						label="Company base"
						value={account.baseAmount}
						comparison={
							account.planPrice.discountAmount > 0
								? {
										discountPercent: account.planPrice.discountPercent,
										regularValue: account.planPrice.listAmount,
									}
								: undefined
						}
						tooltip={account.planPrice.tooltip}
					/>
					<PriceLine label="Usage and add-ons" value={account.addOnTotal} />
					<PriceLine label="Subtotal" value={account.subtotal} />
					<PriceLine
						label="Promotion"
						value={account.discountAmount > 0 ? -account.discountAmount : 0}
						badges={
							account.appliedPromotion
								? [
										{
											label: account.appliedPromotion.code,
										},
										{
											label: account.appliedPromotion.type,
										},
										{
											label: formatWorkspaceBillingPromotionValue(
												account.appliedPromotion,
											),
											tone: getPromotionValueBadgeTone(
												account.appliedPromotion,
											),
										},
									]
								: undefined
						}
						tone="discount"
					/>
					<PriceLine label="Payable" value={account.totalDue} tone="strong" />
				</dl>
			</section>

			<section className="rounded-lg border border-darknavy/10 bg-white p-4">
				<div className="flex items-center gap-2 text-sm font-semibold text-darknavy">
					<GitBranch className="h-4 w-4 text-skyblue" aria-hidden="true" />
					Usage and add-ons
				</div>
				<div className="mt-3 grid gap-3">
					{account.addOns.map((addOn) => (
						<AddOnDetail key={addOn.key} addOn={addOn} />
					))}
				</div>
			</section>

			<section className="rounded-lg border border-darknavy/10 bg-white p-4">
				<div className="flex items-center gap-2 text-sm font-semibold text-darknavy">
					<TicketPercent className="h-4 w-4 text-skyblue" aria-hidden="true" />
					Promotion
				</div>
				<div className="mt-3 grid gap-3">
					<AppliedPromotionDetail
						promotion={account.appliedPromotion}
						onClearPromotion={onClearPromotion}
					/>
					<PromotionDropdown
						account={account}
						onApplyPromotion={onApplyPromotion}
						onClearPromotion={onClearPromotion}
					/>
					<PromotionCodeForm
						error={promotionCodeError}
						value={promotionCodeValue}
						onApplyPromotionCode={onApplyPromotionCode}
						onChange={onPromotionCodeChange}
					/>
				</div>
				{selectedPaymentMethod ? (
					<div className="mt-4 rounded-md bg-offwhite px-3 py-2">
						<p className="text-xs text-darknavy/65">
							<CreditCard
								className="mr-1 inline h-3.5 w-3.5"
								aria-hidden="true"
							/>
							{selectedPaymentMethod.label}: {selectedPaymentMethod.brand} ending{" "}
							{selectedPaymentMethod.last4}, expires{" "}
							{selectedPaymentMethod.expiryLabel}
						</p>
					</div>
				) : null}
			</section>
		</div>
	);
}

function PriceLine({
	badges,
	comparison,
	helper,
	label,
	tone,
	tooltip,
	value,
}: {
	badges?: PriceLineBadge[];
	comparison?: PriceLineComparison;
	helper?: string;
	label: string;
	tone?: "discount" | "strong";
	tooltip?: string;
	value: number;
}) {
	const normalizedValue = Object.is(value, -0) ? 0 : value;

	return (
		<div className="flex items-center justify-between gap-4 py-2">
			<dt className="min-w-0 text-darknavy/58">
				<span className="inline-flex items-center gap-1">
					{label}
					<InfoTooltip label={`${label} details`} title={tooltip} />
				</span>
				{helper ? (
					<span className="mt-0.5 block text-xs text-darknavy/42">
						{helper}
					</span>
				) : null}
				{badges?.length ? (
					<span className="mt-1 flex flex-wrap gap-1.5">
						{badges.map((badge) => (
							<BillingDetailBadge
								key={`${badge.tone ?? "neutral"}-${badge.label}`}
								label={badge.label}
								tone={badge.tone}
							/>
						))}
					</span>
				) : null}
			</dt>
			<dd className="flex shrink-0 items-center gap-2">
				{comparison ? (
					<span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
						{comparison.discountPercent}% off
					</span>
				) : null}
				<span className="text-right">
					{comparison ? (
						<span className="block text-xs font-semibold text-darknavy/38 line-through">
							{formatWorkspaceBillingCurrency(comparison.regularValue)}
						</span>
					) : null}
					<span
						className={joinClasses(
							"block font-semibold text-darknavy",
							tone === "discount" && value < 0 && "text-emerald-600",
							tone === "strong" && "text-base",
						)}
					>
						{formatWorkspaceBillingCurrency(normalizedValue)}
					</span>
				</span>
			</dd>
		</div>
	);
}

function BillingDetailBadge({
	label,
	tone = "neutral",
}: {
	label: string;
	tone?: BillingDetailBadgeTone;
}) {
	return (
		<span
			className={joinClasses(
				"inline-flex w-fit rounded-md px-2 py-0.5 text-xs font-semibold ring-1",
				getBillingDetailBadgeClassName(tone),
			)}
		>
			{label}
		</span>
	);
}

function AddOnDetail({ addOn }: { addOn: WorkspaceBillingAddOnQuote }) {
	return (
		<div className="rounded-md border border-darknavy/10 px-3 py-2">
			<div className="flex items-center justify-between gap-3">
				<p className="inline-flex items-center gap-1 text-sm font-semibold text-darknavy">
					{addOn.label}
					<InfoTooltip
						label={`${addOn.label} reduction details`}
						title={addOn.reductionTooltip}
					/>
				</p>
				<div className="flex shrink-0 items-center gap-2">
					{addOn.reductionAmount > 0 ? (
						<span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
							{addOn.reductionPercent}% off
						</span>
					) : null}
					<div className="text-right">
						{addOn.reductionAmount > 0 ? (
							<p className="text-xs font-semibold text-darknavy/38 line-through">
								{formatWorkspaceBillingCurrency(addOn.grossBillingAmount)}
							</p>
						) : null}
						<p className="text-sm font-semibold text-darknavy">
							{formatWorkspaceBillingCurrency(addOn.billingAmount)}
						</p>
					</div>
				</div>
			</div>
			<p className="mt-1 text-xs leading-5 text-darknavy/55">
				{addOn.includedCount} included, {addOn.actualCount} active,{" "}
				{addOn.extraCount} add-on at{" "}
				{formatWorkspaceBillingCurrency(addOn.monthlyRate)} monthly
			</p>
		</div>
	);
}

function AppliedPromotionDetail({
	promotion,
	onClearPromotion,
}: {
	promotion: WorkspaceBillingPromotionOption | null;
	onClearPromotion: () => void;
}) {
	if (!promotion) {
		return null;
	}

	return (
		<div className="flex items-center gap-3 rounded-md bg-offwhite px-3 py-2">
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-semibold text-darknavy">
					{promotion.code}
				</p>
				<div className="mt-1 flex flex-wrap gap-1.5">
					<BillingDetailBadge label={promotion.type} />
					<BillingDetailBadge
						label={formatWorkspaceBillingPromotionValue(promotion)}
						tone={getPromotionValueBadgeTone(promotion)}
					/>
				</div>
			</div>
			<button
				type="button"
				onClick={onClearPromotion}
				aria-label={`Clear ${promotion.code}`}
				className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-darknavy/10 bg-white text-darknavy/55 transition hover:border-coralpink/30 hover:text-coralpink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-coralpink/15"
			>
				<X className="h-3.5 w-3.5" aria-hidden="true" />
			</button>
		</div>
	);
}

function PromotionDropdown({
	account,
	onApplyPromotion,
	onClearPromotion,
}: {
	account: WorkspaceBillingCompanyAccount;
	onApplyPromotion: (assignmentId: string) => void;
	onClearPromotion: () => void;
}) {
	const options = createPromotionDropdownOptions(account.possessedPromotions);
	const selectedPromotionId =
		account.appliedPromotion?.applicationMode === "Possession"
			? account.appliedPromotion.assignmentId
			: "";

	return (
		<AppAdvancedDropdown
			emptyMessage="No voucher or coupon available."
			isClearable
			menuPortal={false}
			options={options}
			placeholder="Select voucher or coupon"
			searchPlaceholder="Search voucher or coupon"
			showSelectedDetails
			value={selectedPromotionId}
			onChange={(value) => {
				const nextValue = Array.isArray(value) ? value[0] ?? "" : value;

				if (nextValue) {
					onApplyPromotion(nextValue);
					return;
				}

				onClearPromotion();
			}}
		/>
	);
}

function PromotionCodeForm({
	error,
	value,
	onApplyPromotionCode,
	onChange,
}: {
	error?: string;
	value: string;
	onApplyPromotionCode: () => void;
	onChange: (value: string) => void;
}) {
	return (
		<form
			className="grid gap-1.5"
			onSubmit={(event) => {
				event.preventDefault();
				onApplyPromotionCode();
			}}
		>
			<label className="block">
				<span className="sr-only">Promo code</span>
				<span className="flex gap-2">
					<input
						type="text"
						value={value}
						onChange={(event) => onChange(event.target.value)}
						placeholder="Enter promo code"
						className={joinClasses(
							"h-10 min-w-0 flex-1 rounded-md border bg-white px-3 text-sm font-semibold uppercase text-darknavy shadow-sm outline-none transition placeholder:normal-case placeholder:font-medium placeholder:text-darknavy/35 focus:border-skyblue focus:ring-4 focus:ring-skyblue/15",
							error ? "border-coralpink/50" : "border-darknavy/10",
						)}
					/>
					<button
						type="submit"
						className="inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-darknavy px-3 text-sm font-semibold text-offwhite shadow-sm transition hover:bg-coralpink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-coralpink/20"
					>
						Apply
					</button>
				</span>
			</label>
			{error ? (
				<p className="text-xs font-semibold text-coralpink">{error}</p>
			) : null}
		</form>
	);
}

function getPromotionValueBadgeTone(
	promotion: Pick<WorkspaceBillingPromotionOption, "discountKind">,
): BillingDetailBadgeTone {
	return promotion.discountKind === "Percent" ? "percent" : "discount";
}

function createPromotionDropdownOptions(
	promotions: WorkspaceBillingPromotionOption[],
): AppAdvancedDropdownOption[] {
	return promotions.map((promotion) => ({
		description: promotion.description,
		label: `${promotion.type} - ${formatWorkspaceBillingPromotionValue(
			promotion,
		)} - saves ${formatWorkspaceBillingCurrency(
			promotion.discountAmount,
		)} - ${formatWorkspaceBillingPromotionExpiry(
			promotion.expiresAt,
		)}`,
		name: promotion.code,
		value: promotion.assignmentId,
	}));
}

function getBillingDetailBadgeClassName(tone: BillingDetailBadgeTone) {
	switch (tone) {
		case "discount":
			return "bg-emerald-50 text-emerald-700 ring-emerald-200";
		case "percent":
			return "bg-citron/40 text-darknavy ring-citron/60";
		case "neutral":
			return "bg-offwhite text-darknavy/70 ring-darknavy/10";
	}
}

function getTrialStateClassName(daysRemaining: number | null) {
	if (daysRemaining !== null && daysRemaining <= 3) {
		return "bg-coralpink/12 text-coralpink ring-coralpink/20";
	}

	if (daysRemaining !== null && daysRemaining <= 7) {
		return "bg-citron/45 text-darknavy ring-citron/60";
	}

	if (daysRemaining !== null && daysRemaining <= 15) {
		return "bg-emerald-50 text-emerald-700 ring-emerald-200";
	}

	return "bg-skyblue/14 text-darknavy ring-skyblue/25";
}

function getCompanyStatusClassName(
	status: WorkspaceBillingCompanyAccount["status"],
) {
	switch (status) {
		case "Active":
			return "bg-citron/35 text-darknavy";
		case "Trial":
			return "bg-skyblue/18 text-darknavy";
		case "Past Due":
			return "bg-coralpink/15 text-coralpink";
		case "Scheduled":
			return "bg-darknavy/8 text-darknavy/70";
	}
}

function getRenewalStateClassName(
	state: WorkspaceBillingCompanyAccount["renewalState"],
) {
	switch (state) {
		case "Overdue":
			return "bg-coralpink/12 text-coralpink ring-coralpink/20";
		case "Due today":
			return "bg-citron/45 text-darknavy ring-citron/60";
		case "Due soon":
			return "bg-skyblue/14 text-darknavy ring-skyblue/25";
		case "Scheduled":
			return "bg-offwhite text-darknavy/70 ring-darknavy/10";
	}
}
