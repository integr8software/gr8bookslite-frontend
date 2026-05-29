"use client";

import {
	BadgePercent,
	Building2,
	CheckCircle2,
	CreditCard,
	ReceiptText,
	TicketPercent,
	WalletCards,
} from "lucide-react";
import { useWorkspaceBillingSubscriptionPage } from "@/app/src/hooks/workspace/billing-and-subscription/useWorkspaceBillingSubscriptionPage";
import type {
	WorkspaceBillingCompanyAccount,
	WorkspaceBillingPaymentMethodRecord,
	WorkspaceBillingPromotionOption,
} from "@/app/src/types/workspace/billing-and-subscription/WorkspaceBillingSubscriptionTypes";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleMetrics } from "@/app/src/ui/shared/module/ModuleMetrics";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import {
	formatWorkspaceBillingCurrency,
	formatWorkspaceBillingDate,
	formatWorkspaceBillingPromotionExpiry,
	formatWorkspaceBillingPromotionValue,
} from "@/app/src/data/workspace/billing-and-subscription/WorkspaceBillingSubscriptionData";

export function WorkspaceBillingSubscriptionPage() {
	const page = useWorkspaceBillingSubscriptionPage();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="card"
				titleAs="h1"
				eyebrow="Workspace billing"
				title="Billing & Subscription"
				description="Company subscription billing with card selection, computed price, and subscriber-assigned promotion application."
			/>
			<ModuleMetrics
				metrics={[
					{
						icon: Building2,
						label: "Companies",
						helper: "Subscriber accounts",
						tone: "blue",
						value: page.summary.subscriberCount,
					},
					{
						icon: TicketPercent,
						label: "Available Promotions",
						helper: "Assigned from master",
						tone: "violet",
						value: page.summary.availablePromotions,
					},
					{
						icon: BadgePercent,
						label: "Applied Discounts",
						helper: "Current selection",
						tone: "emerald",
						value: formatWorkspaceBillingCurrency(page.summary.discountTotal),
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
			<div className="grid gap-4">
				{page.accounts.map((account) => (
					<WorkspaceBillingCompanyCard
						key={account.id}
						account={account}
						codeError={page.codeErrorsByCompany[account.id]}
						codeValue={page.codeValuesByCompany[account.id] ?? ""}
						paymentMethods={page.paymentMethods}
						selectedPaymentMethodId={page.getSelectedPaymentMethodId(
							account.id,
						)}
						onApplyPromotion={(promotionId) =>
							page.applyPromotion(account.id, promotionId)
						}
						onApplyPromotionCode={() => page.applyPromotionCode(account.id)}
						onClearPromotion={() => page.clearPromotion(account.id)}
						onPay={() => page.payCompany(account.id)}
						onUpdatePaymentMethod={(paymentMethodId) =>
							page.updatePaymentMethod(account.id, paymentMethodId)
						}
						onUpdatePromotionCode={(value) =>
							page.updatePromotionCode(account.id, value)
						}
					/>
				))}
			</div>
		</section>
	);
}

type WorkspaceBillingCompanyCardProps = {
	account: WorkspaceBillingCompanyAccount;
	codeError?: string;
	codeValue: string;
	paymentMethods: WorkspaceBillingPaymentMethodRecord[];
	selectedPaymentMethodId: string;
	onApplyPromotion: (promotionId: string) => void;
	onApplyPromotionCode: () => void;
	onClearPromotion: () => void;
	onPay: () => void;
	onUpdatePaymentMethod: (paymentMethodId: string) => void;
	onUpdatePromotionCode: (value: string) => void;
};

function WorkspaceBillingCompanyCard({
	account,
	codeError,
	codeValue,
	paymentMethods,
	selectedPaymentMethodId,
	onApplyPromotion,
	onApplyPromotionCode,
	onClearPromotion,
	onPay,
	onUpdatePaymentMethod,
	onUpdatePromotionCode,
}: WorkspaceBillingCompanyCardProps) {
	const selectedPaymentMethod = paymentMethods.find(
		(method) => method.id === selectedPaymentMethodId,
	);

	return (
		<article className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm shadow-darknavy/5">
			<div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-2">
						<h2 className="text-lg font-semibold text-darknavy">
							{account.name}
						</h2>
						<span
							className={joinClasses(
								"inline-flex rounded-md px-2.5 py-1 text-xs font-semibold",
								getCompanyStatusClassName(account.status),
							)}
						>
							{account.status}
						</span>
					</div>
					<p className="mt-1 text-sm leading-6 text-darknavy/62">
						{account.planName} for {account.ownerName}
					</p>
					<div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-darknavy/70">
						<span className="rounded-md bg-offwhite px-2.5 py-1">
							{account.billingCycle}
						</span>
						<span className="rounded-md bg-offwhite px-2.5 py-1">
							Renews {formatWorkspaceBillingDate(account.renewalDate)}
						</span>
						<span className="rounded-md bg-offwhite px-2.5 py-1">
							{account.companyCount} companies
						</span>
						<span className="rounded-md bg-offwhite px-2.5 py-1">
							{account.branchCount} branches
						</span>
						<span className="rounded-md bg-offwhite px-2.5 py-1">
							{account.userCount} users
						</span>
					</div>
				</div>
				<div className="min-w-[12rem] text-left xl:text-right">
					<p className="text-xs font-bold uppercase tracking-[0.12em] text-darknavy/45">
						Payable
					</p>
					<p className="mt-1 text-2xl font-semibold text-darknavy">
						{formatWorkspaceBillingCurrency(account.totalDue)}
					</p>
					{account.discountAmount > 0 ? (
						<p className="mt-1 text-sm font-medium text-emerald-600">
							{formatWorkspaceBillingCurrency(account.discountAmount)} discount
						</p>
					) : null}
				</div>
			</div>

			<div className="mt-5 grid gap-5 border-t border-darknavy/10 pt-5 lg:grid-cols-[1fr_1.1fr_0.95fr]">
				<PriceBreakdown account={account} />
				<PaymentMethodField
					paymentMethods={paymentMethods}
					selectedPaymentMethod={selectedPaymentMethod}
					selectedPaymentMethodId={selectedPaymentMethodId}
					onUpdatePaymentMethod={onUpdatePaymentMethod}
				/>
				<PromotionField
					account={account}
					codeError={codeError}
					codeValue={codeValue}
					onApplyPromotion={onApplyPromotion}
					onApplyPromotionCode={onApplyPromotionCode}
					onClearPromotion={onClearPromotion}
					onUpdatePromotionCode={onUpdatePromotionCode}
				/>
			</div>

			<div className="mt-5 flex flex-col gap-3 border-t border-darknavy/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
				<p className="text-sm text-darknavy/62">
					{selectedPaymentMethod
						? `${selectedPaymentMethod.brand} ending ${selectedPaymentMethod.last4}`
						: "No card selected"}
					{account.appliedPromotion
						? ` with ${account.appliedPromotion.code}`
						: ""}
				</p>
				<button
					type="button"
					onClick={onPay}
					className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-darknavy px-4 text-sm font-semibold text-offwhite shadow-sm transition hover:bg-coralpink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-coralpink/20"
				>
					<WalletCards className="h-4 w-4" aria-hidden="true" />
					Pay Now
				</button>
			</div>
		</article>
	);
}

function PriceBreakdown({
	account,
}: {
	account: WorkspaceBillingCompanyAccount;
}) {
	const rows = [
		["Plan base", account.baseAmount],
		["Usage and add-ons", account.overageAmount],
		["Subtotal", account.subtotal],
		["Promotion", -account.discountAmount],
	] as const;

	return (
		<section>
			<div className="flex items-center gap-2 text-sm font-semibold text-darknavy">
				<ReceiptText className="h-4 w-4 text-skyblue" aria-hidden="true" />
				Price
			</div>
			<dl className="mt-3 divide-y divide-darknavy/10 text-sm">
				{rows.map(([label, value]) => (
					<div key={label} className="flex items-center justify-between gap-4 py-2">
						<dt className="text-darknavy/58">{label}</dt>
						<dd
							className={joinClasses(
								"font-semibold text-darknavy",
								value < 0 && "text-emerald-600",
							)}
						>
							{formatWorkspaceBillingCurrency(value)}
						</dd>
					</div>
				))}
			</dl>
		</section>
	);
}

type PaymentMethodFieldProps = {
	paymentMethods: WorkspaceBillingPaymentMethodRecord[];
	selectedPaymentMethod?: WorkspaceBillingPaymentMethodRecord;
	selectedPaymentMethodId: string;
	onUpdatePaymentMethod: (paymentMethodId: string) => void;
};

function PaymentMethodField({
	paymentMethods,
	selectedPaymentMethod,
	selectedPaymentMethodId,
	onUpdatePaymentMethod,
}: PaymentMethodFieldProps) {
	return (
		<section>
			<label className="block">
				<span className="flex items-center gap-2 text-sm font-semibold text-darknavy">
					<CreditCard className="h-4 w-4 text-skyblue" aria-hidden="true" />
					Payment card
				</span>
				<select
					value={selectedPaymentMethodId}
					onChange={(event) => onUpdatePaymentMethod(event.target.value)}
					className="mt-3 h-10 w-full rounded-md border border-darknavy/12 bg-white px-3 text-sm font-medium text-darknavy shadow-sm outline-none transition focus:border-skyblue focus:ring-4 focus:ring-skyblue/15"
				>
					{paymentMethods.map((method) => (
						<option key={method.id} value={method.id}>
							{method.label} - {method.brand} {method.last4}
						</option>
					))}
				</select>
			</label>
			{selectedPaymentMethod ? (
				<div className="mt-3 grid gap-1 text-sm text-darknavy/62">
					<p className="font-semibold text-darknavy">
						{selectedPaymentMethod.holderName}
					</p>
					<p>
						{selectedPaymentMethod.brand} ending {selectedPaymentMethod.last4}
					</p>
					<p>Expires {selectedPaymentMethod.expiryLabel}</p>
				</div>
			) : null}
		</section>
	);
}

type PromotionFieldProps = {
	account: WorkspaceBillingCompanyAccount;
	codeError?: string;
	codeValue: string;
	onApplyPromotion: (promotionId: string) => void;
	onApplyPromotionCode: () => void;
	onClearPromotion: () => void;
	onUpdatePromotionCode: (value: string) => void;
};

function PromotionField({
	account,
	codeError,
	codeValue,
	onApplyPromotion,
	onApplyPromotionCode,
	onClearPromotion,
	onUpdatePromotionCode,
}: PromotionFieldProps) {
	return (
		<section>
			<div className="flex items-center gap-2 text-sm font-semibold text-darknavy">
				<TicketPercent className="h-4 w-4 text-skyblue" aria-hidden="true" />
				Promotion
			</div>
			<div className="mt-3 flex gap-2">
				<label className="min-w-0 flex-1">
					<span className="sr-only">Coupon, voucher, or promo code</span>
					<input
						value={codeValue}
						onChange={(event) => onUpdatePromotionCode(event.target.value)}
						placeholder="Code"
						className={joinClasses(
							"h-10 w-full rounded-md border bg-white px-3 text-sm font-medium uppercase text-darknavy shadow-sm outline-none transition placeholder:normal-case placeholder:text-darknavy/35 focus:ring-4",
							codeError
								? "border-coralpink/50 focus:border-coralpink focus:ring-coralpink/15"
								: "border-darknavy/12 focus:border-skyblue focus:ring-skyblue/15",
						)}
					/>
				</label>
				<button
					type="button"
					onClick={onApplyPromotionCode}
					className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy shadow-sm transition hover:border-skyblue/60 hover:bg-skyblue/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15"
				>
					<CheckCircle2 className="h-4 w-4" aria-hidden="true" />
					Apply
				</button>
			</div>
			{codeError ? (
				<p className="mt-2 text-xs font-medium text-coralpink">{codeError}</p>
			) : null}
			{account.appliedPromotion ? (
				<div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
					<div className="flex items-center justify-between gap-2">
						<p className="font-semibold">
							{account.appliedPromotion.code} applied
						</p>
						<button
							type="button"
							onClick={onClearPromotion}
							className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
						>
							Clear
						</button>
					</div>
				</div>
			) : null}
			<div className="mt-3 flex flex-wrap gap-2">
				{account.eligiblePromotions.length > 0 ? (
					account.eligiblePromotions.map((promotion) => (
						<PromotionChip
							key={promotion.assignmentId}
							isApplied={account.appliedPromotion?.id === promotion.id}
							promotion={promotion}
							onApply={() => onApplyPromotion(promotion.id)}
						/>
					))
				) : (
					<p className="text-sm text-darknavy/55">No assigned code available.</p>
				)}
			</div>
		</section>
	);
}

function PromotionChip({
	isApplied,
	promotion,
	onApply,
}: {
	isApplied: boolean;
	promotion: WorkspaceBillingPromotionOption;
	onApply: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onApply}
			className={joinClasses(
				"inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-left text-xs font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15",
				isApplied
					? "border-emerald-300 bg-emerald-50 text-emerald-800"
					: "border-darknavy/10 bg-white text-darknavy hover:border-skyblue/60 hover:bg-skyblue/10",
			)}
			title={`${promotion.name}: ${formatWorkspaceBillingPromotionValue(
				promotion,
			)} until ${formatWorkspaceBillingPromotionExpiry(promotion.expiresAt)}`}
		>
			<span>{promotion.code}</span>
			<span className="text-darknavy/50">{promotion.type}</span>
		</button>
	);
}

function getCompanyStatusClassName(status: WorkspaceBillingCompanyAccount["status"]) {
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
