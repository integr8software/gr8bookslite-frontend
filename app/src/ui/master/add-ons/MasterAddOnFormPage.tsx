"use client";

import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import {
	MasterAddOnsHref,
	MasterAddOnStatusOptions,
} from "@/app/src/constants/master/add-ons/MasterAddOnConstants";
import { useMasterAddOnFormPage } from "@/app/src/hooks/master/add-ons/useMasterAddOnFormPage";
import type { MasterAddOnStatus } from "@/app/src/types/master/add-ons/MasterAddOnTypes";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

const ControlClassName =
	"h-11 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy shadow-sm transition placeholder:text-darknavy/35 focus:border-skyblue focus:outline-none focus:ring-4 focus:ring-skyblue/15";
const FieldLabelClassName =
	"grid gap-1.5 text-sm font-semibold text-darknavy/58";

const MockModules = [
	{ id: "feat-fin-reports", label: "Financial Reports", group: "Financial Management" },
	{ id: "feat-analytics-dashboard", label: "Analytics Dashboard", group: "Financial Management" },
	{ id: "feat-rest-api", label: "REST API", group: "System Integration" },
	{ id: "feat-webhooks", label: "Webhooks", group: "System Integration" },
	{ id: "feat-currency-exchange", label: "Currency Exchange", group: "Financial Management" },
	{ id: "feat-multi-currency-journal", label: "Multi-Currency Journal", group: "Financial Management" },
	{ id: "feat-forex-gain-loss", label: "Forex Gain/Loss", group: "Financial Management" },
	{ id: "feat-employee-mgmt", label: "Employee Management", group: "Human Resources" },
	{ id: "feat-payroll", label: "Payroll Processing", group: "Human Resources" },
	{ id: "feat-time-tracking", label: "Time & Attendance", group: "Human Resources" },
	{ id: "feat-leave-mgmt", label: "Leave Management", group: "Human Resources" },
	{ id: "feat-asset-register", label: "Asset Register", group: "Asset Management" },
	{ id: "feat-depreciation", label: "Depreciation Schedules", group: "Asset Management" },
];

type MasterAddOnFormPageProps = {
	mode: "add" | "edit";
	recordId?: string;
};

export function MasterAddOnFormPage({
	mode,
	recordId,
}: MasterAddOnFormPageProps) {
	const page = useMasterAddOnFormPage({ mode, recordId });

	if (page.isMissingRecord) {
		return (
			<ModuleNotFound
				title="Add-on not found"
				description="The selected add-on record is not available in the master add-on list."
				actionHref={MasterAddOnsHref}
				actionLabel="Back to add-ons"
			/>
		);
	}

	const groupedModules = MockModules.reduce(
		(acc, module) => {
			if (!acc[module.group]) acc[module.group] = [];
			acc[module.group].push(module);
			return acc;
		},
		{} as Record<string, typeof MockModules>,
	);

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="card"
				titleAs="h1"
				eyebrow="Subscription & Billing"
				title={mode === "edit" ? "Edit Add-On" : "Add Add-On"}
				description="Set the add-on identity, pricing terms, and module feature entitlements."
				actions={
					<>
						<Link
							href={MasterAddOnsHref}
							className={moduleHeaderActionClassNames.secondary}
						>
							<ArrowLeft
								className="h-4 w-4"
								aria-hidden="true"
							/>
							Back
						</Link>
						<button
							type="button"
							disabled={page.isSaving}
							onClick={page.saveRecord}
							className={moduleHeaderActionClassNames.primary}
						>
							<Save className="h-4 w-4" aria-hidden="true" />
							{page.isSaving ? "Saving…" : "Save"}
						</button>
					</>
				}
			/>

			{/* Identity & Metadata */}
			<div className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
				<h2 className="text-base font-semibold text-darknavy">
					Identity & Metadata
				</h2>
				<div className="mt-5 grid gap-5 sm:grid-cols-2">
					<label className={FieldLabelClassName}>
						<span>Name</span>
						<input
							type="text"
							value={page.values.name}
							onChange={(e) =>
								page.updateValues({ name: e.target.value })
							}
							className={ControlClassName}
							placeholder="e.g. Advanced Reporting"
						/>
						{page.errors.name ? (
							<p className="text-xs font-medium text-coralpink">
								{page.errors.name}
							</p>
						) : null}
					</label>
					<label className={FieldLabelClassName}>
						<span>Status</span>
						<select
							value={page.values.status}
							onChange={(e) =>
								page.updateValues({
									status: e.target
										.value as MasterAddOnStatus,
								})
							}
							className={ControlClassName}
						>
							{MasterAddOnStatusOptions.map((opt) => (
								<option key={opt} value={opt}>
									{opt}
								</option>
							))}
						</select>
					</label>
					<label
						className={joinClasses(
							FieldLabelClassName,
							"sm:col-span-2",
						)}
					>
						<span>Description</span>
						<textarea
							value={page.values.description}
							onChange={(e) =>
								page.updateValues({
									description: e.target.value,
								})
							}
							className={joinClasses(
								ControlClassName,
								"h-auto py-3",
							)}
							rows={3}
							placeholder="Describe this add-on..."
						/>
					</label>
				</div>

			</div>

			{/* Pricing */}
			<div className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
				<h2 className="text-base font-semibold text-darknavy">
					Pricing
				</h2>
				<div className="mt-5 grid gap-5 sm:grid-cols-2">
					<label className={FieldLabelClassName}>
						<span>Monthly Base Price (PHP)</span>
						<input
							type="number"
							min="0"
							step="0.01"
							value={page.values.monthlyPrice}
							onChange={(e) =>
								page.updateValues({
									monthlyPrice:
										parseFloat(e.target.value) || 0,
								})
							}
							className={ControlClassName}
						/>
						{page.errors.monthlyPrice ? (
							<p className="text-xs font-medium text-coralpink">
								{page.errors.monthlyPrice}
							</p>
						) : null}
					</label>
					<label className={FieldLabelClassName}>
						<span>Yearly Base Price (PHP)</span>
						<input
							type="number"
							min="0"
							step="0.01"
							value={page.values.yearlyPrice}
							onChange={(e) =>
								page.updateValues({
									yearlyPrice:
										parseFloat(e.target.value) || 0,
								})
							}
							className={ControlClassName}
						/>
						{page.errors.yearlyPrice ? (
							<p className="text-xs font-medium text-coralpink">
								{page.errors.yearlyPrice}
							</p>
						) : null}
					</label>
				</div>
			</div>

			{/* Module Selection */}
			<div className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
				<h2 className="text-base font-semibold text-darknavy">
					Module Selection
				</h2>
				{page.errors.featureIds ? (
					<p className="mt-2 text-sm font-medium text-coralpink">
						{page.errors.featureIds}
					</p>
				) : null}
				<div className="mt-5 grid gap-6">
					{Object.entries(groupedModules).map(
						([group, modules]) => (
							<div key={group}>
								<h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-darknavy/48">
									{group}
								</h3>
								<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
									{modules.map((module) => {
										const isChecked =
											page.values.featureIds.includes(
												module.id,
											);

										return (
											<label
												key={module.id}
												className={joinClasses(
													"flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition",
													isChecked
														? "border-skyblue bg-skyblue/5"
														: "border-darknavy/10 hover:border-darknavy/20",
												)}
											>
												<input
													type="checkbox"
													className="mt-0.5 h-4 w-4 shrink-0 rounded border-darknavy/20 text-skyblue focus:ring-skyblue"
													checked={isChecked}
													onChange={(e) => {
														const nextFeatureIds =
															e.target.checked
																? [
																		...page
																			.values
																			.featureIds,
																		module.id,
																	]
																: page.values.featureIds.filter(
																		(id) =>
																			id !==
																			module.id,
																	);
														page.updateValues({
															featureIds:
																nextFeatureIds,
														});
													}}
												/>
												<div className="grid gap-0.5">
													<span className="text-sm font-semibold text-darknavy">
														{module.label}
													</span>
													<span className="text-xs text-darknavy/48">
														{module.id}
													</span>
												</div>
											</label>
										);
									})}
								</div>
							</div>
						),
					)}
				</div>
			</div>
		</section>
	);
}
