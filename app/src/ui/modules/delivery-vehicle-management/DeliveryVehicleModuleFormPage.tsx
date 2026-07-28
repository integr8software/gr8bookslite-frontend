"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, Save, Truck } from "lucide-react";
import type {
	DeliveryVehicleField,
	DeliveryVehicleModuleConfig,
	DeliveryVehicleModuleRecord,
} from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";

type DeliveryVehicleModuleFormPageProps = {
	config: DeliveryVehicleModuleConfig;
	href: string;
	initialRecords: DeliveryVehicleModuleRecord[];
	validateRecord: (values: Record<string, string>) => Record<string, string>;
};

export function DeliveryVehicleModuleFormPage({
	config,
	href,
	initialRecords,
	validateRecord,
}: DeliveryVehicleModuleFormPageProps) {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const mode = pathname.includes("/view/") ? "view" : pathname.includes("/edit/") ? "edit" : "add";
	const records = useMemo(
		() => initialRecords.map((record) => ({ ...record, fields: { ...record.fields } })),
		[initialRecords],
	);
	const record = records.find((item) => item.id === params.recordId);
	const [values, setValues] = useState<Record<string, string>>(() =>
		record?.fields ?? createInitialValues(config.fields),
	);
	const [status, setStatus] = useState(record?.status ?? config.statuses[0] ?? "Draft");
	const [category, setCategory] = useState(record?.category ?? config.categories?.[0] ?? "");
	const [activeSectionKey, setActiveSectionKey] = useState(config.formSections?.[0]?.key ?? "");
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
	const isReadonly = mode === "view";
	const isNotFound = mode !== "add" && !record;
	const activeSection = config.formSections?.find((section) => section.key === activeSectionKey);
	const visibleFields = activeSection
		? config.fields.filter((field) => activeSection.fieldKeys.includes(field.key))
		: config.fields;
	const title =
		mode === "add"
			? config.primaryAction
			: mode === "edit"
				? `Edit ${config.noun}`
				: `${config.title} Details`;

	if (isNotFound) {
		return <DeliveryVehicleModuleNotFound config={config} href={href} />;
	}

	function updateField(fieldKey: string, value: string) {
		setValues((current) => ({ ...current, [fieldKey]: value }));
		setErrors((current) => {
			const nextErrors = { ...current };
			delete nextErrors[fieldKey];
			return nextErrors;
		});
	}

	function openSaveDialog() {
		const validationErrors = validateRecord(values);
		setErrors(validationErrors);

		if (Object.keys(validationErrors).length > 0) {
			const errorSection = config.formSections?.find((section) =>
				section.fieldKeys.some((fieldKey) => validationErrors[fieldKey]),
			);
			if (errorSection) {
				setActiveSectionKey(errorSection.key);
			}
			return;
		}

		setIsSaveDialogOpen(true);
	}

	function handleSave() {
		setIsSaveDialogOpen(false);
		router.push(href);
	}

	return (
		<form className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				actionsClassName="w-full justify-start sm:ml-auto sm:w-auto sm:justify-end sm:self-start"
				eyebrow={
					<>
						<Truck className="h-3.5 w-3.5" aria-hidden="true" />
						{config.code} - Delivery Vehicle Management
					</>
				}
				title={title}
				description={config.operationalNote}
				actions={
					<>
						<Link href={href} className={`${moduleHeaderActionClassNames.secondary} order-2 lg:order-1`}>
							<ArrowLeft className="h-4 w-4" aria-hidden="true" />
							Back
						</Link>
						{!isReadonly ? (
							<button type="button" className={`${moduleHeaderActionClassNames.primary} order-1 lg:order-2`} onClick={openSaveDialog}>
								<Save className="h-4 w-4" aria-hidden="true" />
								Save
							</button>
						) : null}
					</>
				}
			/>
			<section className="grid gap-5 rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
				<div className="flex flex-wrap items-center justify-between gap-3 border-b border-darknavy/10 pb-4">
					<div>
						<p className="text-xs font-bold uppercase text-darknavy/45">Reference</p>
						<h2 className="mt-1 text-lg font-semibold text-darknavy">
							{record?.code ?? `${config.code}-NEW`}
						</h2>
					</div>
					<ModuleStatusBadge status={status} />
				</div>
				{config.formSections ? (
					<div className="grid gap-3">
						<div className="flex gap-2 overflow-x-auto border-b border-darknavy/10">
							{config.formSections.map((section) => {
								const isActive = section.key === activeSectionKey;
								return (
									<button
										key={section.key}
										type="button"
										className={`min-h-11 shrink-0 border-b-2 px-3 text-sm font-semibold transition ${
											isActive
												? "border-skyblue text-skyblue"
												: "border-transparent text-darknavy/55 hover:border-darknavy/20 hover:text-darknavy"
										}`}
										onClick={() => setActiveSectionKey(section.key)}
									>
										{section.title}
									</button>
								);
							})}
						</div>
						{activeSection?.description ? (
							<p className="text-sm font-medium text-darknavy/55">{activeSection.description}</p>
						) : null}
					</div>
				) : null}
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{config.categories && !config.formSections ? (
						<label className="grid gap-2">
							<span className="text-sm font-semibold text-darknavy">Workspace</span>
							<select
								value={category}
								disabled={isReadonly}
								className={fieldClassName}
								onChange={(event) => setCategory(event.target.value)}
							>
								{config.categories.map((option) => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
						</label>
					) : null}
					{visibleFields.map((field) => (
						<DeliveryVehicleFieldInput
							key={field.key}
							error={errors[field.key]}
							field={field}
							readOnly={isReadonly}
							value={values[field.key] ?? ""}
							onChange={(value) => updateField(field.key, value)}
						/>
					))}
					{!config.formSections || activeSection?.includeStatus ? (
						<label className="grid gap-2">
							<span className="text-sm font-semibold text-darknavy">Status *</span>
							<select
								value={status}
								disabled={isReadonly}
								className={fieldClassName}
								onChange={(event) => setStatus(event.target.value)}
							>
								{config.statuses.map((option) => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
						</label>
					) : null}
				</div>
				{record?.alert ? (
					<p className="rounded-md bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
						{record.alert}
					</p>
				) : null}
			</section>
			<AppDialog
				confirmLabel="Confirm"
				description={`This saves the ${config.noun} in the mock ${config.title.toLowerCase()} workspace.`}
				iconTone="question"
				isOpen={isSaveDialogOpen}
				title={mode === "edit" ? "Save changes?" : `Save ${config.noun}?`}
				tone="success"
				onCancel={() => setIsSaveDialogOpen(false)}
				onConfirm={handleSave}
			/>
		</form>
	);
}

function DeliveryVehicleFieldInput({
	error,
	field,
	onChange,
	readOnly,
	value,
}: {
	error?: string;
	field: DeliveryVehicleField;
	readOnly: boolean;
	value: string;
	onChange: (value: string) => void;
}) {
	const label = `${field.label}${field.required ? " *" : ""}`;

	if (field.type === "textarea") {
		return (
			<label className="grid gap-2 md:col-span-2">
				<span className="text-sm font-semibold text-darknavy">{label}</span>
				<textarea
					value={value}
					readOnly={readOnly}
					className={`${fieldClassName} min-h-28 py-3`}
					onChange={(event) => onChange(event.target.value)}
				/>
				{error ? <span className="text-xs font-medium text-coralpink">{error}</span> : null}
			</label>
		);
	}

	if (field.type === "select") {
		return (
			<label className="grid gap-2">
				<span className="text-sm font-semibold text-darknavy">{label}</span>
				<select
					value={value}
					disabled={readOnly}
					className={fieldClassName}
					onChange={(event) => onChange(event.target.value)}
				>
					<option value="">Select {field.label.toLowerCase()}</option>
					{field.options?.map((option) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</select>
				{error ? <span className="text-xs font-medium text-coralpink">{error}</span> : null}
			</label>
		);
	}

	return (
		<label className="grid gap-2">
			<span className="text-sm font-semibold text-darknavy">{label}</span>
			<input
				type={field.type === "number" ? "text" : field.type ?? "text"}
				value={value}
				readOnly={readOnly}
				className={fieldClassName}
				onChange={(event) => onChange(event.target.value)}
			/>
			{error ? <span className="text-xs font-medium text-coralpink">{error}</span> : null}
		</label>
	);
}

function DeliveryVehicleModuleNotFound({
	config,
	href,
}: {
	config: DeliveryVehicleModuleConfig;
	href: string;
}) {
	return (
		<section className="rounded-lg border border-darknavy/10 bg-white p-8 text-center shadow-sm">
			<h1 className="text-xl font-semibold text-darknavy">{config.title} record not found</h1>
			<p className="mt-2 text-sm text-darknavy/55">The selected record may have been removed.</p>
			<Link href={href} className={`${moduleHeaderActionClassNames.secondary} mt-5`}>
				<ArrowLeft className="h-4 w-4" aria-hidden="true" />
				Back
			</Link>
		</section>
	);
}

function createInitialValues(fields: readonly DeliveryVehicleField[]) {
	return Object.fromEntries(fields.map((field) => [field.key, ""]));
}

const fieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-default disabled:bg-offwhite/65 disabled:text-darknavy read-only:bg-offwhite/65";
