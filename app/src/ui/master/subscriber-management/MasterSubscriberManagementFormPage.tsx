"use client";

import Link from "next/link";
import { ArrowLeft, Save, UserPlus } from "lucide-react";
import { MasterSubscriberManagementStatusOptions } from "@/app/src/constants/master/subscriber-management/MasterSubscriberManagementConstants";
import { useMasterSubscriberManagementFormPage } from "@/app/src/hooks/master/subscriber-management/useMasterSubscriberManagementFormPage";
import type { MasterSubscriberManagementStatus } from "@/app/src/types/master/subscriber-management/MasterSubscriberManagementTypes";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type MasterSubscriberManagementFormPageProps = {
	mode: "add" | "edit";
	recordId?: string;
	returnSource?: "list" | "view";
};

export function MasterSubscriberManagementFormPage({
	mode,
	recordId,
	returnSource,
}: MasterSubscriberManagementFormPageProps) {
	const page = useMasterSubscriberManagementFormPage({
		mode,
		recordId,
		returnSource,
	});
	const title =
		mode === "add" ? "Add Subscriber" : `Edit ${page.subscriber?.name}`;

	return (
		<section className="grid gap-5">
			<ModuleHeader
				titleAs="h1"
				title={title}
				description="Maintain the subscriber profile, owner contact, and platform account status."
				eyebrow={
					<>
						<UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
						Subscriber profile
					</>
				}
				actions={
					<Link
						href={page.cancelHref}
						className={moduleHeaderActionClassNames.secondary}
					>
						<ArrowLeft className="h-4 w-4" aria-hidden="true" />
						Back
					</Link>
				}
			/>
			<div className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm shadow-darknavy/5">
				<div className="grid gap-5 lg:grid-cols-2">
					<FormField
						error={page.errors.name}
						label="Subscriber Name"
						value={page.values.name}
						onChange={(value) => page.updateValue("name", value)}
					/>
					<FormField
						error={page.errors.email}
						label="Contact Email"
						type="email"
						value={page.values.email}
						onChange={(value) => page.updateValue("email", value)}
					/>
					<FormField
						error={page.errors.contactNumber}
						label="Contact No."
						value={page.values.contactNumber}
						onChange={(value) =>
							page.updateValue("contactNumber", value)
						}
					/>
					<label className="grid gap-2">
						<span className="text-sm font-semibold text-darknavy/70">
							Status
						</span>
						<select
							value={page.values.status}
							onChange={(event) =>
								page.updateStatus(
									event.target.value as MasterSubscriberManagementStatus,
								)
							}
							className="h-12 rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy shadow-sm shadow-darknavy/5 outline-none transition focus:border-[rgb(var(--skyblue-rgb)/0.45)] focus:ring-4 focus:ring-[rgb(var(--skyblue-rgb)/0.16)]"
						>
							{MasterSubscriberManagementStatusOptions.map((status) => (
								<option key={status} value={status}>
									{status}
								</option>
							))}
						</select>
						{page.errors.status ? (
							<span className="text-xs font-semibold text-coralpink">
								{page.errors.status}
							</span>
						) : null}
					</label>
				</div>
				<div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
					<Link
						href={page.cancelHref}
						className="inline-flex h-11 items-center justify-center rounded-md border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy/70 transition hover:bg-skyblue/10 hover:text-darknavy"
					>
						Cancel
					</Link>
					<button
						type="button"
						onClick={page.handleSubmit}
						className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[var(--skyblue)] bg-[var(--skyblue)] px-4 text-sm font-semibold text-white shadow-sm shadow-[rgb(var(--skyblue-rgb)/0.18)] transition hover:opacity-90"
					>
						<Save className="h-4 w-4" aria-hidden="true" />
						Save Subscriber
					</button>
				</div>
			</div>
		</section>
	);
}

function FormField({
	error,
	label,
	onChange,
	type = "text",
	value,
}: {
	error?: string;
	label: string;
	onChange: (value: string) => void;
	type?: "email" | "text";
	value: string;
}) {
	return (
		<label className="grid gap-2">
			<span className="text-sm font-semibold text-darknavy/70">{label}</span>
			<input
				type={type}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				className={joinClasses(
					"h-12 rounded-lg border bg-white px-3 text-sm font-semibold text-darknavy shadow-sm shadow-darknavy/5 outline-none transition placeholder:text-darknavy/35 focus:ring-4 focus:ring-[rgb(var(--skyblue-rgb)/0.16)]",
					error
						? "border-coralpink"
						: "border-darknavy/10 focus:border-[rgb(var(--skyblue-rgb)/0.45)]",
				)}
			/>
			{error ? (
				<span className="text-xs font-semibold text-coralpink">{error}</span>
			) : null}
		</label>
	);
}
