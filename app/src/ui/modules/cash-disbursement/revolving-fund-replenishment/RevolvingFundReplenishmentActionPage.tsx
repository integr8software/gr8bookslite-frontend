"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Home, Save, X } from "lucide-react";
import { RevolvingFundReplenishmentHref } from "@/app/src/constants/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentConstants";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

export function RevolvingFundReplenishmentActionPage() {
	const pathname = usePathname();
	const mode = pathname.includes("/view/")
		? "view"
		: pathname.includes("/edit/")
			? "edit"
			: "add";
	const isReadonly = mode === "view";

	return (
		<section className="grid gap-5 text-darknavy">
				<ModuleHeader
					variant="panel"
					title={
						mode === "view"
							? "View Revolving Fund Replenishment"
							: mode === "edit"
								? "Edit Revolving Fund Replenishment"
								: "Add Revolving Fund Replenishment"
					}
					titleAs="h1"
					description="Capture replenishment details for revolving fund liquidation."
					eyebrow={
						<>
							<Home className="h-3.5 w-3.5" aria-hidden="true" />
							Cash disbursement
						</>
					}
					actions={
						<>
							<Link
								href={RevolvingFundReplenishmentHref}
								className={moduleHeaderActionClassNames.secondary}
							>
								{isReadonly ? (
									<ArrowLeft className="h-4 w-4" aria-hidden="true" />
								) : (
									<X className="h-4 w-4" aria-hidden="true" />
								)}
								{isReadonly ? "Back" : "Cancel"}
							</Link>
							{isReadonly ? null : (
								<button
									type="submit"
									form="revolving-fund-replenishment-form"
									className={moduleHeaderActionClassNames.primary}
								>
									<Save className="h-4 w-4" aria-hidden="true" />
									Save
								</button>
							)}
						</>
					}
				/>

				<form
					id="revolving-fund-replenishment-form"
					className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm"
					onSubmit={(event) => event.preventDefault()}
				>
					<div className="grid gap-4 lg:grid-cols-3">
						<FormField label="Replenishment No." fieldId="advance-replenishment-number">
							<input
								id="advance-replenishment-number"
								name="replenishmentNumber"
								readOnly
								value="RFR000001"
								className={fieldClassName}
							/>
						</FormField>
						<FormField label="Branch" fieldId="advance-replenishment-branch">
							<input
								id="advance-replenishment-branch"
								name="branch"
								readOnly={isReadonly}
								defaultValue="All Branches"
								className={fieldClassName}
							/>
						</FormField>
						<FormField label="Status" fieldId="advance-replenishment-status">
							<input
								id="advance-replenishment-status"
								name="status"
								defaultValue="Draft"
								readOnly
								className={fieldClassName}
							/>
						</FormField>
						<FormField label="Revolving Fund No." fieldId="advance-reference">
							<input
								id="advance-reference"
								name="revolvingFundNumber"
								readOnly={isReadonly}
								placeholder="RF000001"
								className={fieldClassName}
							/>
						</FormField>
						<FormField label="Replenishment Date" fieldId="advance-replenishment-date">
							<input
								id="advance-replenishment-date"
								name="replenishmentDate"
								type="date"
								readOnly={isReadonly}
								className={fieldClassName}
							/>
						</FormField>
						<FormField label="Amount" fieldId="advance-replenishment-amount">
							<input
								id="advance-replenishment-amount"
								name="amount"
								type="number"
								min={0}
								step="0.01"
								readOnly={isReadonly}
								placeholder="0.00"
								className={fieldClassName}
							/>
						</FormField>
						<FormField
							label="Remarks"
							fieldId="advance-replenishment-remarks"
							wide
						>
							<textarea
								id="advance-replenishment-remarks"
								name="remarks"
								readOnly={isReadonly}
								className={`${fieldClassName} min-h-24 py-3`}
							/>
						</FormField>
					</div>
				</form>
		</section>
	);
}

function FormField({
	children,
	fieldId,
	label,
	wide,
}: {
	children: React.ReactNode;
	fieldId: string;
	label: string;
	wide?: boolean;
}) {
	return (
		<div className={wide ? "lg:col-span-3" : undefined}>
			<label
				htmlFor={fieldId}
				className="mb-2 block text-sm font-semibold text-darknavy"
			>
				{label}
			</label>
			{children}
		</div>
	);
}

const fieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-default disabled:bg-offwhite/65 disabled:text-darknavy read-only:bg-offwhite/65";
