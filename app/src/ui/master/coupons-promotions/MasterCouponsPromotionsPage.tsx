"use client";

import {
	BadgePercent,
	Check,
	Edit3,
	Plus,
	RotateCcw,
	Save,
	Tags,
	Ticket,
	ToggleLeft,
	ToggleRight,
} from "lucide-react";
import {
	MasterCouponPromotionDiscountKindOptions,
	MasterCouponPromotionStatusOptions,
	MasterCouponPromotionTargetOptions,
	MasterCouponPromotionTypeOptions,
} from "@/app/src/constants/master/coupons-promotions/MasterCouponPromotionConstants";
import {
	formatMasterCouponPromotionDate,
	formatMasterCouponPromotionValue,
} from "@/app/src/data/master/coupons-promotions/MasterCouponPromotionData";
import { useMasterCouponsPromotionsPage } from "@/app/src/hooks/master/coupons-promotions/useMasterCouponsPromotionsPage";
import type {
	MasterCouponPromotionDiscountKind,
	MasterCouponPromotionFormErrors,
	MasterCouponPromotionFormValues,
	MasterCouponPromotionRecord,
	MasterCouponPromotionStatus,
	MasterCouponPromotionTarget,
	MasterCouponPromotionType,
} from "@/app/src/types/master/coupons-promotions/MasterCouponPromotionTypes";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

const ControlClassName =
	"h-11 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy shadow-sm transition placeholder:text-darknavy/35 focus:border-skyblue focus:outline-none focus:ring-4 focus:ring-skyblue/15";
const FieldLabelClassName = "grid gap-1.5 text-sm font-semibold text-darknavy/58";
const RecordActionClassName =
	"inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-darknavy/10 bg-white px-3 text-xs font-semibold text-darknavy/70 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/25";

export function MasterCouponsPromotionsPage() {
	const page = useMasterCouponsPromotionsPage();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="card"
				titleAs="h1"
				eyebrow="Subscription & Billing"
				title="Coupons & Promotions"
				description="Manage promo codes, coupons, vouchers, eligibility, expiration, and activation status."
				actions={
					<>
						<button
							type="button"
							onClick={page.resetForm}
							className={moduleHeaderActionClassNames.secondary}
						>
							<RotateCcw className="h-4 w-4" aria-hidden="true" />
							Reset
						</button>
						<button
							type="button"
							onClick={page.saveRecord}
							className={moduleHeaderActionClassNames.primary}
						>
							{page.editingRecordId ? (
								<Save className="h-4 w-4" aria-hidden="true" />
							) : (
								<Plus className="h-4 w-4" aria-hidden="true" />
							)}
							{page.editingRecordId ? "Update" : "Create"}
						</button>
					</>
				}
			/>

			<MasterCouponPromotionSummaryCards summary={page.summary} />

			<div className="grid gap-5 2xl:grid-cols-[minmax(22rem,0.45fr)_minmax(0,1fr)]">
				<MasterCouponPromotionForm
					editingRecordId={page.editingRecordId}
					errors={page.formErrors}
					values={page.formValues}
					onReset={page.resetForm}
					onSave={page.saveRecord}
					onUpdate={page.updateForm}
				/>
				<MasterCouponPromotionList
					records={page.records}
					onEdit={page.editRecord}
					onToggleStatus={page.toggleRecordStatus}
				/>
			</div>
		</section>
	);
}

function MasterCouponPromotionSummaryCards({
	summary,
}: {
	summary: {
		activeRecords: number;
		couponRecords: number;
		promoRecords: number;
		voucherRecords: number;
	};
}) {
	const metrics = [
		{
			icon: Check,
			label: "Active",
			tone: "bg-citron/35 text-darknavy",
			value: summary.activeRecords,
		},
		{
			icon: BadgePercent,
			label: "Promos",
			tone: "bg-skyblue/12 text-darknavy",
			value: summary.promoRecords,
		},
		{
			icon: Tags,
			label: "Coupons",
			tone: "bg-offwhite text-darknavy",
			value: summary.couponRecords,
		},
		{
			icon: Ticket,
			label: "Vouchers",
			tone: "bg-coralpink/12 text-coralpink",
			value: summary.voucherRecords,
		},
	];

	return (
		<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
			{metrics.map((metric) => {
				const Icon = metric.icon;

				return (
					<article
						key={metric.label}
						className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm"
					>
						<div className="flex items-center justify-between gap-3">
							<p className="text-sm font-medium text-darknavy/58">
								{metric.label}
							</p>
							<span
								className={joinClasses(
									"flex h-9 w-9 items-center justify-center rounded-lg",
									metric.tone,
								)}
							>
								<Icon className="h-4 w-4" aria-hidden="true" />
							</span>
						</div>
						<p className="mt-3 text-2xl font-semibold text-darknavy">
							{metric.value}
						</p>
					</article>
				);
			})}
		</div>
	);
}

function MasterCouponPromotionForm({
	editingRecordId,
	errors,
	values,
	onReset,
	onSave,
	onUpdate,
}: {
	editingRecordId: string | null;
	errors: MasterCouponPromotionFormErrors;
	values: MasterCouponPromotionFormValues;
	onReset: () => void;
	onSave: () => void;
	onUpdate: (values: Partial<MasterCouponPromotionFormValues>) => void;
}) {
	return (
		<article className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<div className="flex flex-col gap-3 border-b border-darknavy/10 p-5 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="text-xs font-semibold uppercase tracking-wide text-skyblue">
						{editingRecordId ? "Edit Record" : "New Record"}
					</p>
					<h2 className="mt-2 text-lg font-semibold text-darknavy">
						Promotion Setup
					</h2>
				</div>
				<div className="flex flex-wrap gap-2">
					<button
						type="button"
						onClick={onReset}
						className={moduleHeaderActionClassNames.secondary}
					>
						<RotateCcw className="h-4 w-4" aria-hidden="true" />
						Reset
					</button>
					<button
						type="button"
						onClick={onSave}
						className={moduleHeaderActionClassNames.primary}
					>
						{editingRecordId ? (
							<Save className="h-4 w-4" aria-hidden="true" />
						) : (
							<Plus className="h-4 w-4" aria-hidden="true" />
						)}
						{editingRecordId ? "Update" : "Create"}
					</button>
				</div>
			</div>

			<div className="grid gap-4 p-5">
				<TextField
					error={errors.name}
					label="Name"
					value={values.name}
					onChange={(name) => onUpdate({ name })}
				/>
				<TextField
					error={errors.code}
					label="Code"
					value={values.code}
					onChange={(code) => onUpdate({ code })}
				/>
				<div className="grid gap-4 sm:grid-cols-2">
					<SelectField
						label="Type"
						value={values.type}
						options={MasterCouponPromotionTypeOptions}
						onChange={(type) =>
							onUpdate({ type: type as MasterCouponPromotionType })
						}
					/>
					<SelectField
						label="Target"
						value={values.target}
						options={MasterCouponPromotionTargetOptions}
						onChange={(target) =>
							onUpdate({ target: target as MasterCouponPromotionTarget })
						}
					/>
				</div>
				<div className="grid gap-4 sm:grid-cols-2">
					<SelectField
						label="Discount"
						value={values.discountKind}
						options={MasterCouponPromotionDiscountKindOptions}
						onChange={(discountKind) =>
							onUpdate({
								discountKind:
									discountKind as MasterCouponPromotionDiscountKind,
							})
						}
					/>
					<NumberField
						error={errors.value}
						label="Value"
						value={values.value}
						onChange={(value) => onUpdate({ value })}
					/>
				</div>
				<div className="grid gap-4 sm:grid-cols-2">
					<label className={FieldLabelClassName}>
						Expires
						<input
							type="date"
							value={values.expiresAt}
							onChange={(event) =>
								onUpdate({ expiresAt: event.target.value })
							}
							className={ControlClassName}
						/>
						<FieldError message={errors.expiresAt} />
					</label>
					<SelectField
						label="Status"
						value={values.status}
						options={MasterCouponPromotionStatusOptions}
						onChange={(status) =>
							onUpdate({ status: status as MasterCouponPromotionStatus })
						}
					/>
				</div>
			</div>
		</article>
	);
}

function MasterCouponPromotionList({
	records,
	onEdit,
	onToggleStatus,
}: {
	records: MasterCouponPromotionRecord[];
	onEdit: (record: MasterCouponPromotionRecord) => void;
	onToggleStatus: (recordId: string) => void;
}) {
	return (
		<article className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<div className="flex flex-col gap-2 border-b border-darknavy/10 p-5 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="text-xs font-semibold uppercase tracking-wide text-skyblue">
						Record List
					</p>
					<h2 className="mt-2 text-lg font-semibold text-darknavy">
						Promo, Coupon, and Voucher Codes
					</h2>
				</div>
				<span className="rounded-md bg-offwhite px-3 py-1.5 text-xs font-semibold text-darknavy/58 ring-1 ring-darknavy/10">
					{records.length} records
				</span>
			</div>
			<div className="overflow-x-auto">
				<table className="min-w-[58rem] text-left">
					<thead className="bg-offwhite text-xs font-semibold uppercase tracking-wide text-darknavy/52">
						<tr>
							<th className="px-4 py-3">Code</th>
							<th className="px-4 py-3">Type</th>
							<th className="px-4 py-3">Target</th>
							<th className="px-4 py-3">Value</th>
							<th className="px-4 py-3">Expires</th>
							<th className="px-4 py-3">Status</th>
							<th className="px-4 py-3 text-right">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-darknavy/8">
						{records.map((record) => {
							const isActive = record.status === "Active";

							return (
								<tr key={record.id}>
									<td className="px-4 py-4">
										<p className="text-sm font-semibold text-darknavy">
											{record.name}
										</p>
										<p className="mt-1 text-xs font-semibold uppercase tracking-wide text-darknavy/42">
											{record.code}
										</p>
									</td>
									<td className="px-4 py-4 text-sm text-darknavy/65">
										{record.type}
									</td>
									<td className="px-4 py-4 text-sm text-darknavy/65">
										{record.target}
									</td>
									<td className="px-4 py-4 text-sm font-semibold text-darknavy">
										{formatMasterCouponPromotionValue(record)}
									</td>
									<td className="px-4 py-4 text-sm text-darknavy/65">
										{formatMasterCouponPromotionDate(record.expiresAt)}
									</td>
									<td className="px-4 py-4">
										<StatusBadge status={record.status} />
									</td>
									<td className="px-4 py-4">
										<div className="flex flex-wrap justify-end gap-2">
											<button
												type="button"
												onClick={() => onEdit(record)}
												className={RecordActionClassName}
											>
												<Edit3
													className="h-3.5 w-3.5"
													aria-hidden="true"
												/>
												Edit
											</button>
											<button
												type="button"
												onClick={() => onToggleStatus(record.id)}
												className={RecordActionClassName}
											>
												{isActive ? (
													<ToggleRight
														className="h-3.5 w-3.5"
														aria-hidden="true"
													/>
												) : (
													<ToggleLeft
														className="h-3.5 w-3.5"
														aria-hidden="true"
													/>
												)}
												{isActive ? "Inactivate" : "Activate"}
											</button>
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</article>
	);
}

function TextField({
	error,
	label,
	value,
	onChange,
}: {
	error?: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<label className={FieldLabelClassName}>
			{label}
			<input
				value={value}
				onChange={(event) => onChange(event.target.value)}
				className={ControlClassName}
			/>
			<FieldError message={error} />
		</label>
	);
}

function NumberField({
	error,
	label,
	value,
	onChange,
}: {
	error?: string;
	label: string;
	value: number;
	onChange: (value: number) => void;
}) {
	return (
		<label className={FieldLabelClassName}>
			{label}
			<input
				type="number"
				min={0}
				value={value}
				onChange={(event) => onChange(Number(event.target.value))}
				className={ControlClassName}
			/>
			<FieldError message={error} />
		</label>
	);
}

function SelectField<TOption extends string>({
	label,
	options,
	value,
	onChange,
}: {
	label: string;
	options: readonly TOption[];
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<label className={FieldLabelClassName}>
			{label}
			<select
				value={value}
				onChange={(event) => onChange(event.target.value)}
				className={joinClasses(ControlClassName, "app-select-control")}
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

function StatusBadge({ status }: { status: MasterCouponPromotionStatus }) {
	const classes = {
		Active: "bg-citron/30 text-darknavy ring-citron/45",
		Draft: "bg-skyblue/12 text-darknavy ring-skyblue/22",
		Inactive: "bg-coralpink/12 text-coralpink ring-coralpink/20",
	} satisfies Record<MasterCouponPromotionStatus, string>;

	return (
		<span
			className={joinClasses(
				"inline-flex w-fit rounded-md px-2.5 py-1 text-xs font-semibold ring-1",
				classes[status],
			)}
		>
			{status}
		</span>
	);
}

function FieldError({ message }: { message?: string }) {
	if (!message) {
		return null;
	}

	return <span className="text-xs font-semibold text-coralpink">{message}</span>;
}
