"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Check, RefreshCw, Save, Search } from "lucide-react";
import {
	MasterPromotionDiscountKindOptions,
	MasterPromotionExpirationModeOptions,
	MasterPromotionLimitModeOptions,
	MasterPromotionStatusOptions,
	MasterPromotionTargetOptions,
	MasterPromotionTypeOptions,
	MasterPromotionsHref,
	normalizeMasterPromotionTargetPlanIds,
} from "@/app/src/constants/master/promotions/MasterPromotionConstants";
import { useMasterPromotionFormPage } from "@/app/src/hooks/master/promotions/useMasterPromotionFormPage";
import type {
	MasterPromotionDiscountKind,
	MasterPromotionExpirationMode,
	MasterPromotionFormErrors,
	MasterPromotionFormValues,
	MasterPromotionLimitMode,
	MasterPromotionStatus,
	MasterPromotionType,
} from "@/app/src/types/master/promotions/MasterPromotionTypes";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

const ControlClassName =
	"h-11 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy shadow-sm transition placeholder:text-darknavy/35 focus:border-skyblue focus:outline-none focus:ring-4 focus:ring-skyblue/15";
const FieldLabelClassName = "grid gap-1.5 text-sm font-semibold text-darknavy/58";

type MasterPromotionFormPageProps = {
	mode: "add" | "edit";
	recordId?: string;
};

export function MasterPromotionFormPage({
	mode,
	recordId,
}: MasterPromotionFormPageProps) {
	const page = useMasterPromotionFormPage({ mode, recordId });

	if (page.isMissingRecord) {
		return (
			<ModuleNotFound
				title="Promotion not found"
				description="The selected promotion record is not available in the promotions list."
				actionHref={MasterPromotionsHref}
				actionLabel="Back to promotions"
			/>
		);
	}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="card"
				titleAs="h1"
				eyebrow="Discounts"
				title={mode === "edit" ? "Edit Promotion" : "Add Promotion"}
				description="Set the campaign identity, target plans, value, limit, expiration, and status."
				actions={
					<>
						<Link
							href={MasterPromotionsHref}
							className={moduleHeaderActionClassNames.secondary}
						>
							<ArrowLeft className="h-4 w-4" aria-hidden="true" />
							Back
						</Link>
						<button
							type="button"
							onClick={page.saveRecord}
							className={moduleHeaderActionClassNames.primary}
						>
							<Save className="h-4 w-4" aria-hidden="true" />
							Save
						</button>
					</>
				}
			/>
			<MasterPromotionForm
				errors={page.errors}
				values={page.values}
				onGenerateCode={page.generatePromotionCode}
				onSave={page.saveRecord}
				onUpdate={page.updateValues}
			/>
		</section>
	);
}

function MasterPromotionForm({
	errors,
	values,
	onGenerateCode,
	onSave,
	onUpdate,
}: {
	errors: MasterPromotionFormErrors;
	values: MasterPromotionFormValues;
	onGenerateCode: () => void;
	onSave: () => void;
	onUpdate: (values: Partial<MasterPromotionFormValues>) => void;
}) {
	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<div className="grid gap-5 p-5 xl:grid-cols-2">
				<div className="grid content-start gap-4">
					<div className="grid gap-4 md:grid-cols-2">
						<TextField
							error={errors.name}
							label="Name"
							value={values.name}
							onChange={(name) => onUpdate({ name })}
						/>
						<CodeField
							error={errors.code}
							label="Code"
							value={values.code}
							onGenerate={onGenerateCode}
							onChange={(code) => onUpdate({ code: code.toUpperCase() })}
						/>
					</div>
					<label className={FieldLabelClassName}>
						Description
						<textarea
							value={values.description}
							onChange={(event) =>
								onUpdate({ description: event.target.value })
							}
							rows={5}
							className="min-h-32 rounded-lg border border-darknavy/10 bg-white px-3 py-3 text-sm font-medium leading-6 text-darknavy shadow-sm transition placeholder:text-darknavy/35 focus:border-skyblue focus:outline-none focus:ring-4 focus:ring-skyblue/15"
						/>
						<FieldError message={errors.description} />
					</label>
					<SelectField
						label="Status"
						value={values.status}
						options={MasterPromotionStatusOptions}
						onChange={(status) =>
							onUpdate({ status: status as MasterPromotionStatus })
						}
					/>
				</div>
				<div className="grid content-start gap-4">
					<SelectField
						label="Type"
						value={values.type}
						options={MasterPromotionTypeOptions}
						onChange={(type) =>
							onUpdate({ type: type as MasterPromotionType })
						}
					/>
					<TargetPlanListField
						error={errors.targetPlanIds}
						value={values.targetPlanIds}
						onChange={(targetPlanIds) => onUpdate({ targetPlanIds })}
					/>
					<div className="grid gap-4 md:grid-cols-2">
						<SelectField
							label="Discount"
							value={values.discountKind}
							options={MasterPromotionDiscountKindOptions}
							onChange={(discountKind) =>
								onUpdate({
									discountKind:
										discountKind as MasterPromotionDiscountKind,
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
					<div className="grid gap-4 md:grid-cols-2">
						<SelectField
							label="Usage limit"
							value={values.limitMode}
							options={MasterPromotionLimitModeOptions}
							onChange={(limitMode) =>
								onUpdate({
									limitMode: limitMode as MasterPromotionLimitMode,
								})
							}
						/>
						{values.limitMode === "Limited" ? (
							<NumberField
								error={errors.redemptionLimit}
								label="Limit"
								value={values.redemptionLimit}
								onChange={(redemptionLimit) =>
									onUpdate({ redemptionLimit })
								}
							/>
						) : null}
					</div>
					<div className="grid gap-4 md:grid-cols-2">
						<SelectField
							label="Expiration"
							value={values.expirationMode}
							options={MasterPromotionExpirationModeOptions}
							onChange={(expirationMode) =>
								onUpdate({
									expirationMode:
										expirationMode as MasterPromotionExpirationMode,
								})
							}
						/>
						{values.expirationMode === "With expiration" ? (
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
						) : null}
					</div>
					<div className="flex justify-end">
						<button
							type="button"
							onClick={onSave}
							className={moduleHeaderActionClassNames.primary}
						>
							<Save className="h-4 w-4" aria-hidden="true" />
							Save
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

function CodeField({
	error,
	label,
	value,
	onChange,
	onGenerate,
}: {
	error?: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
	onGenerate: () => void;
}) {
	return (
		<label className={FieldLabelClassName}>
			{label}
			<span className="flex gap-2">
				<input
					value={value}
					onChange={(event) => onChange(event.target.value)}
					className={ControlClassName}
				/>
				<button
					type="button"
					onClick={onGenerate}
					className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy/70 shadow-sm transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15"
				>
					<RefreshCw className="h-4 w-4" aria-hidden="true" />
					Generate
				</button>
			</span>
			<FieldError message={error} />
		</label>
	);
}

function TargetPlanListField({
	error,
	value,
	onChange,
}: {
	error?: string;
	value: string[];
	onChange: (value: string[]) => void;
}) {
	const [query, setQuery] = useState("");
	const selectedValues = useMemo(() => new Set(value), [value]);
	const filteredOptions = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		if (!normalizedQuery) {
			return MasterPromotionTargetOptions;
		}

		return MasterPromotionTargetOptions.filter((option) =>
			[option.name, option.label, option.description, option.value]
				.filter(Boolean)
				.join(" ")
				.toLowerCase()
				.includes(normalizedQuery),
		);
	}, [query]);

	function toggleTargetPlan(targetPlanId: string) {
		const nextValues = selectedValues.has(targetPlanId)
			? value.filter((selectedValue) => selectedValue !== targetPlanId)
			: [...value, targetPlanId];

		onChange(normalizeMasterPromotionTargetPlanIds(nextValues, value));
	}

	return (
		<div className={FieldLabelClassName}>
			<div className="flex items-center justify-between gap-3">
				<span>Target plans</span>
				<span className="text-xs font-semibold text-darknavy/42">
					{value.length.toLocaleString("en-US")} selected
				</span>
			</div>
			<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
				<label className="relative block border-b border-darknavy/10 p-2">
					<span className="sr-only">Search target plans</span>
					<Search
						className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/35"
						aria-hidden="true"
					/>
					<input
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Search plans"
						className="h-10 w-full rounded-md border border-darknavy/10 bg-white pl-10 pr-3 text-sm font-semibold text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-4 focus:ring-skyblue/10"
					/>
				</label>
				<div className="grid max-h-72 gap-1 overflow-y-auto p-2">
					{filteredOptions.length > 0 ? (
						filteredOptions.map((option) => {
							const isSelected = selectedValues.has(option.value);

							return (
								<button
									key={option.value}
									type="button"
									aria-pressed={isSelected}
									onClick={() => toggleTargetPlan(option.value)}
									className={joinClasses(
										"flex min-h-14 w-full items-start gap-3 rounded-md px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15",
										isSelected
											? "bg-skyblue/12 text-darknavy"
											: "text-darknavy hover:bg-skyblue/10",
									)}
								>
									<span
										className={joinClasses(
											"mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border",
											isSelected
												? "border-skyblue bg-skyblue text-white"
												: "border-darknavy/18 bg-white text-transparent",
										)}
									>
										<Check className="h-3.5 w-3.5" aria-hidden="true" />
									</span>
									<span className="grid min-w-0 gap-0.5">
										<span className="truncate text-sm font-semibold">
											{option.name}
										</span>
										<span className="text-xs font-semibold text-darknavy/48">
											{option.label}
										</span>
										<span className="line-clamp-2 text-xs font-medium leading-4 text-darknavy/45">
											{option.description}
										</span>
									</span>
								</button>
							);
						})
					) : (
						<p className="px-3 py-6 text-center text-sm font-medium text-darknavy/45">
							No plans found.
						</p>
					)}
				</div>
			</div>
			<FieldError message={error} />
		</div>
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
				onChange={(event) => onChange(toNumber(event.target.value))}
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

function FieldError({ message }: { message?: string }) {
	if (!message) {
		return null;
	}

	return <span className="text-xs font-semibold text-coralpink">{message}</span>;
}

function toNumber(value: string) {
	const parsedValue = Number(value);

	return Number.isFinite(parsedValue) ? parsedValue : 0;
}
