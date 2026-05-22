"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, CreditCard, ImageUp, X } from "lucide-react";
import {
	WorkspaceCompaniesHref,
} from "@/app/src/constants/modules/workspace-companies/WorkspaceCompanyConstants";
import { OnboardingNonIndividualTypeOptions } from "@/app/src/data/onboarding/OnboardingData";
import { useWorkspaceCompanyAction } from "@/app/src/hooks/modules/workspace/companies/useWorkspaceCompanyAction";
import type {
	WorkspaceCompanyFormErrors,
	WorkspaceCompanyFormValues,
} from "@/app/src/types/modules/workspace-companies/WorkspaceCompanyTypes";
import {
	DefaultPhilippineContactNumber,
	FormatPhilippineContactNumber,
	PhilippineContactNumberPlaceholder,
} from "@/app/src/data/shared/ContactData";
import { FormatTinNumber } from "@/app/src/data/shared/TaxData";
import { WorkspaceCompanyActionHeader } from "./WorkspaceCompanyActionHeader";
import {
	WorkspaceCompanyField,
	WorkspaceCompanyFieldClassName,
	WorkspaceCompanySection,
} from "./WorkspaceCompanyFormPrimitives";
import { WorkspaceCompanyNotFound } from "./WorkspaceCompanyNotFound";
import { WorkspaceBillingImpactConfirmDialog } from "@/app/src/ui/modules/workspace/shared/WorkspaceBillingImpactConfirmDialog";

const CompanyFormId = "workspace-company-form";
const WorkspaceBillingPaymentMethods = [
	{
		id: "current-card",
		label: "Use current PayMongo card - Visa ending 4242",
	},
	{
		id: "card-visa-1881",
		label: "PayMongo Visa ending 1881",
	},
	{
		id: "card-mastercard-5820",
		label: "PayMongo Mastercard ending 5820",
	},
	{
		id: "new-paymongo-card",
		label: "Add new PayMongo card",
	},
] as const;

export function WorkspaceCompanyAction() {
	const action = useWorkspaceCompanyAction();
	const [isBillingConfirmOpen, setIsBillingConfirmOpen] = useState(false);

	if (action.needsRecord && !action.existingCompany) {
		return (
			<WorkspaceCompanyNotFound
				href={WorkspaceCompaniesHref}
				title="Company Not Found"
			/>
		);
	}

	return (
		<section className="grid gap-5">
			<WorkspaceCompanyActionHeader
				cancelHref={action.cancelHref}
				description={
					action.mode === "edit"
						? "Update company identity, subscription plan, and workspace availability."
						: "Create a company profile before adding company users and branches."
				}
				eyebrowIcon={Building2}
				eyebrowLabel="Workspace directory"
				formId={CompanyFormId}
				isReadonly={false}
				mode={action.mode}
				saveLabel="Save Company"
				title={action.mode === "edit" ? "Edit Company" : "Add Company"}
			/>
			<CompanyDetailsFields
				errors={action.errors}
				showBillingDetails={action.mode === "add"}
				values={action.values}
				onInputChange={action.handleInputChange}
				onSubmit={(event) => {
					if (action.mode === "edit") {
						action.handleSubmit(event);
						return;
					}

					event.preventDefault();

					if (action.validateCompany()) {
						setIsBillingConfirmOpen(true);
					}
				}}
				onUpdateField={action.updateField}
			/>
			<WorkspaceBillingImpactConfirmDialog
				isOpen={isBillingConfirmOpen}
				isPending={action.isMutating}
				title="Create company?"
				resourceName={action.values.companyName || "this company"}
				description="Creating this company may affect workspace billing, including company access costs, payments, or deductions. Confirm before saving the company."
				onCancel={() => setIsBillingConfirmOpen(false)}
				onConfirm={() => {
					setIsBillingConfirmOpen(false);
					action.saveCompany();
				}}
			/>
		</section>
	);
}

function CompanyDetailsFields({
	errors,
	showBillingDetails,
	values,
	onInputChange,
	onSubmit,
	onUpdateField,
}: {
	errors: WorkspaceCompanyFormErrors;
	showBillingDetails: boolean;
	values: WorkspaceCompanyFormValues;
	onInputChange: (
		event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => void;
	onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
	onUpdateField: (field: keyof WorkspaceCompanyFormValues, value: string) => void;
}) {
	const logoInputRef = useRef<HTMLInputElement | null>(null);
	const [logoInputKey, setLogoInputKey] = useState(0);
	const [logoPreviewUrl, setLogoPreviewUrl] = useState(values.logoUrl);
	const isIndividual = values.taxpayerType === "individual";
	const isOtherOrganizationType = values.nonIndividualType === "Others";

	useEffect(() => {
		return () => {
			if (logoPreviewUrl.startsWith("blob:")) {
				URL.revokeObjectURL(logoPreviewUrl);
			}
		};
	}, [logoPreviewUrl]);

	function updateLogoPreviewUrl(nextPreviewUrl: string) {
		setLogoPreviewUrl((current) => {
			if (current.startsWith("blob:")) {
				URL.revokeObjectURL(current);
			}

			return nextPreviewUrl;
		});
	}

	function handleLogoChange(file: File | undefined) {
		if (!file) {
			return;
		}

		if (!file.type.startsWith("image/")) {
			setLogoInputKey((current) => current + 1);
			return;
		}

		onUpdateField("logoName", file.name);
		const nextPreviewUrl = URL.createObjectURL(file);
		onUpdateField("logoUrl", nextPreviewUrl);
		updateLogoPreviewUrl(nextPreviewUrl);
	}

	function handleLogoRemove() {
		onUpdateField("logoName", "");
		onUpdateField("logoUrl", "");
		updateLogoPreviewUrl("");
		setLogoInputKey((current) => current + 1);
	}

	return (
		<form id={CompanyFormId} onSubmit={onSubmit}>
			<input type="submit" hidden />
			<WorkspaceCompanySection
				title="Company Details"
				description="These details appear in the workspace company list and company switcher surfaces."
			>
				<div className="grid gap-4">
					<div>
						<p className="mb-2 block text-sm font-semibold text-darknavy">
							Taxpayer Type
						</p>
						<div className="flex overflow-hidden rounded-lg border border-darknavy/10">
							<button
								type="button"
								onClick={() => onUpdateField("taxpayerType", "individual")}
								className={`flex-1 py-3 text-sm font-semibold transition ${
									isIndividual
										? "bg-darknavy text-white"
										: "bg-white text-darknavy hover:bg-offwhite"
								}`}
							>
								Individual
							</button>
							<button
								type="button"
								onClick={() => onUpdateField("taxpayerType", "non-individual")}
								className={`flex-1 border-l border-darknavy/10 py-3 text-sm font-semibold transition ${
									!isIndividual
										? "bg-darknavy text-white"
										: "bg-white text-darknavy hover:bg-offwhite"
								}`}
							>
								Non-Individual
							</button>
						</div>
					</div>

					{isIndividual ? (
						<div className="grid gap-4 lg:grid-cols-3">
							<WorkspaceCompanyField label="Last Name" error={errors.lastName} required>
								<input
									name="lastName"
									value={values.lastName}
									onChange={onInputChange}
									className={WorkspaceCompanyFieldClassName}
								/>
							</WorkspaceCompanyField>
							<WorkspaceCompanyField label="First Name" error={errors.firstName} required>
								<input
									name="firstName"
									value={values.firstName}
									onChange={onInputChange}
									className={WorkspaceCompanyFieldClassName}
								/>
							</WorkspaceCompanyField>
							<WorkspaceCompanyField label="Middle Name" error={errors.middleName}>
								<input
									name="middleName"
									value={values.middleName}
									onChange={onInputChange}
									className={WorkspaceCompanyFieldClassName}
								/>
							</WorkspaceCompanyField>
						</div>
					) : (
						<div className="grid gap-4 lg:grid-cols-2">
							<WorkspaceCompanyField
								label="Company / Organization Name"
								error={errors.companyName}
								required
							>
								<input
									name="companyName"
									value={values.companyName}
									onChange={onInputChange}
									className={WorkspaceCompanyFieldClassName}
								/>
							</WorkspaceCompanyField>
							<WorkspaceCompanyField
								label="Organization Type"
								error={errors.nonIndividualType}
								required
							>
								<select
									name="nonIndividualType"
									value={values.nonIndividualType}
									onChange={onInputChange}
									className={WorkspaceCompanyFieldClassName}
								>
									<option value="">Select organization type</option>
									{OnboardingNonIndividualTypeOptions.map((option) => (
										<option key={option} value={option}>
											{option}
										</option>
									))}
								</select>
							</WorkspaceCompanyField>
							{isOtherOrganizationType ? (
								<WorkspaceCompanyField
									label="Please Specify"
									error={errors.nonIndividualTypeOther}
									required
								>
									<input
										name="nonIndividualTypeOther"
										value={values.nonIndividualTypeOther}
										onChange={onInputChange}
										className={WorkspaceCompanyFieldClassName}
									/>
								</WorkspaceCompanyField>
							) : null}
						</div>
					)}

					<CompanyLogoField
						error={errors.logoName}
						fileName={values.logoName}
						inputKey={logoInputKey}
						inputRef={logoInputRef}
						previewUrl={logoPreviewUrl}
						onChange={handleLogoChange}
						onRemove={handleLogoRemove}
					/>

					<div className="grid gap-4 lg:grid-cols-2">
					<WorkspaceCompanyField label="TIN" error={errors.tin} required>
						<input
							name="tin"
							value={values.tin}
							onChange={(event) =>
								onUpdateField("tin", FormatTinNumber(event.target.value))
							}
							inputMode="numeric"
							maxLength={15}
							className={WorkspaceCompanyFieldClassName}
							placeholder="123-456-789-000"
						/>
					</WorkspaceCompanyField>
					</div>
				</div>
			</WorkspaceCompanySection>

			<WorkspaceCompanySection
				title="Contact"
				description="Workspace admins use these fields to identify the company owner and billing contact."
				className="mt-5"
			>
				<div className="grid gap-4 lg:grid-cols-2">
					<WorkspaceCompanyField label="Email" error={errors.email} required>
						<input
							name="email"
							type="email"
							value={values.email}
							onChange={onInputChange}
							className={WorkspaceCompanyFieldClassName}
						/>
					</WorkspaceCompanyField>
					<WorkspaceCompanyField
						label="Contact No."
						error={errors.contactNumber}
						required
					>
						<input
							name="contactNumber"
							type="tel"
							inputMode="numeric"
							maxLength={16}
							value={values.contactNumber}
							onChange={(event) =>
								onUpdateField(
									"contactNumber",
									FormatPhilippineContactNumber(event.target.value),
								)
							}
							onFocus={() => {
								if (!values.contactNumber) {
									onUpdateField("contactNumber", DefaultPhilippineContactNumber);
								}
							}}
							className={WorkspaceCompanyFieldClassName}
							placeholder={PhilippineContactNumberPlaceholder}
						/>
					</WorkspaceCompanyField>
					<div className="lg:col-span-2">
						<WorkspaceCompanyField
							label="Address"
							error={errors.address}
							required
						>
							<input
								name="address"
								value={values.address}
								onChange={onInputChange}
								className={WorkspaceCompanyFieldClassName}
							/>
						</WorkspaceCompanyField>
					</div>
					<WorkspaceCompanyField label="Report Start Date" error={errors.reportStartDate} required>
						<input
							name="reportStartDate"
							type="date"
							value={values.reportStartDate}
							onChange={onInputChange}
							className={WorkspaceCompanyFieldClassName}
						/>
					</WorkspaceCompanyField>
					<WorkspaceCompanyField label="Report End Date" error={errors.reportEndDate} required>
						<input
							name="reportEndDate"
							type="date"
							value={values.reportEndDate}
							onChange={onInputChange}
							className={WorkspaceCompanyFieldClassName}
						/>
					</WorkspaceCompanyField>
					<div className="lg:col-span-2">
						<WorkspaceCompanyField label="Company Website (Optional)" error={errors.website}>
							<input
								name="website"
								type="url"
								value={values.website}
								onChange={onInputChange}
								className={WorkspaceCompanyFieldClassName}
								placeholder="https://acmecorp.com"
							/>
						</WorkspaceCompanyField>
					</div>
				</div>
			</WorkspaceCompanySection>

			{showBillingDetails ? (
				<WorkspaceCompanySection
					title="Billing Details"
					description="Choose a saved PayMongo payment method or add card details for the new company."
					className="mt-5"
				>
					<div className="grid gap-4">
						<div className="rounded-xl border border-darknavy/10 bg-offwhite/50 p-4">
							<div className="mb-4 flex items-start gap-3">
								<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-darknavy shadow-sm">
									<CreditCard className="h-5 w-5" aria-hidden="true" />
								</span>
								<div>
									<p className="text-sm font-semibold text-darknavy">
										PayMongo payment method
									</p>
									<p className="mt-1 text-sm leading-6 text-darknavy/60">
										Use the selected card for this company workspace billing.
									</p>
								</div>
							</div>
							<div className="grid gap-4 lg:grid-cols-2">
								<WorkspaceCompanyField
									label="Payment Method"
									error={errors.billingPaymentMethodId}
									required
								>
									<select
										name="billingPaymentMethodId"
										value={values.billingPaymentMethodId}
										onChange={onInputChange}
										className={WorkspaceCompanyFieldClassName}
									>
										{WorkspaceBillingPaymentMethods.map((method) => (
											<option key={method.id} value={method.id}>
												{method.label}
											</option>
										))}
									</select>
								</WorkspaceCompanyField>
							</div>
						</div>

						{values.billingPaymentMethodId === "new-paymongo-card" ? (
							<div className="grid gap-4 rounded-xl border border-darknavy/10 bg-white p-4 lg:grid-cols-2">
								<WorkspaceCompanyField
									label="Cardholder Name"
									error={errors.billingCardholderName}
									required
								>
									<input
										name="billingCardholderName"
										value={values.billingCardholderName}
										onChange={onInputChange}
										autoComplete="cc-name"
										className={WorkspaceCompanyFieldClassName}
										placeholder="John Doe"
									/>
								</WorkspaceCompanyField>
								<WorkspaceCompanyField
									label="Billing Email"
									error={errors.billingEmail}
									required
								>
									<input
										name="billingEmail"
										type="email"
										value={values.billingEmail}
										onChange={onInputChange}
										autoComplete="email"
										className={WorkspaceCompanyFieldClassName}
										placeholder="billing@company.com"
									/>
								</WorkspaceCompanyField>
								<div className="lg:col-span-2">
									<WorkspaceCompanyField
										label="Card Number"
										error={errors.billingCardNumber}
										required
									>
										<input
											name="billingCardNumber"
											value={values.billingCardNumber}
											onChange={onInputChange}
											inputMode="numeric"
											maxLength={23}
											autoComplete="cc-number"
											className={WorkspaceCompanyFieldClassName}
											placeholder="1234 5678 9012 3456"
										/>
									</WorkspaceCompanyField>
								</div>
								<WorkspaceCompanyField
									label="Expiry Month"
									error={errors.billingExpiryMonth}
									required
								>
									<input
										name="billingExpiryMonth"
										value={values.billingExpiryMonth}
										onChange={onInputChange}
										inputMode="numeric"
										maxLength={2}
										autoComplete="cc-exp-month"
										className={WorkspaceCompanyFieldClassName}
										placeholder="MM"
									/>
								</WorkspaceCompanyField>
								<WorkspaceCompanyField
									label="Expiry Year"
									error={errors.billingExpiryYear}
									required
								>
									<input
										name="billingExpiryYear"
										value={values.billingExpiryYear}
										onChange={onInputChange}
										inputMode="numeric"
										maxLength={4}
										autoComplete="cc-exp-year"
										className={WorkspaceCompanyFieldClassName}
										placeholder="YYYY"
									/>
								</WorkspaceCompanyField>
								<WorkspaceCompanyField
									label="CVC"
									error={errors.billingCvc}
									required
								>
									<input
										name="billingCvc"
										value={values.billingCvc}
										onChange={onInputChange}
										inputMode="numeric"
										maxLength={4}
										autoComplete="cc-csc"
										className={WorkspaceCompanyFieldClassName}
										placeholder="123"
									/>
								</WorkspaceCompanyField>
								<div className="lg:col-span-2">
									<WorkspaceCompanyField
										label="Billing Address"
										error={errors.billingAddress}
										required
									>
										<input
											name="billingAddress"
											value={values.billingAddress}
											onChange={onInputChange}
											className={WorkspaceCompanyFieldClassName}
											placeholder="123 Main St, City, Province"
										/>
									</WorkspaceCompanyField>
								</div>
							</div>
						) : null}
					</div>
				</WorkspaceCompanySection>
			) : null}
		</form>
	);
}

function CompanyLogoField({
	error,
	fileName,
	inputKey,
	inputRef,
	previewUrl,
	onChange,
	onRemove,
}: {
	error?: string;
	fileName: string;
	inputKey: number;
	inputRef: React.RefObject<HTMLInputElement | null>;
	previewUrl: string;
	onChange: (file: File | undefined) => void;
	onRemove: () => void;
}) {
	return (
		<div>
			<p className="mb-2 block text-sm font-semibold text-darknavy">Logo</p>
			<label className="flex h-12 cursor-pointer overflow-hidden rounded-lg border border-darknavy/10 bg-white">
				<span className="flex w-12 items-center justify-center bg-darknavy text-white">
					<ImageUp className="h-5 w-5" aria-hidden="true" />
				</span>
				<span className="flex min-w-0 flex-1 items-center px-4 text-sm font-medium text-darknavy/65">
					<span className="truncate">{fileName || "Upload image"}</span>
				</span>
				{fileName ? (
					<button
						type="button"
						onClick={(event) => {
							event.preventDefault();
							event.stopPropagation();
							onRemove();
						}}
						aria-label="Remove uploaded image"
						className="flex w-12 items-center justify-center text-darknavy/60 transition hover:text-darknavy"
					>
						<X className="h-4 w-4" aria-hidden="true" />
					</button>
				) : null}
				<input
					key={inputKey}
					ref={inputRef}
					type="file"
					accept="image/*"
					className="sr-only"
					onChange={(event) => onChange(event.target.files?.[0])}
				/>
			</label>
			{previewUrl ? (
				<div className="mt-3 rounded-md border border-darknavy/10 p-3">
					<div className="relative h-32 w-full overflow-hidden rounded-sm bg-white">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={previewUrl}
							alt="Company logo preview"
							className="h-full w-full object-contain p-3"
						/>
					</div>
				</div>
			) : null}
			<p className="mt-2 text-sm text-darknavy/55">
				Upload your company or personal logo. Max 5MB.
			</p>
			{error ? (
				<p className="mt-2 text-sm font-medium text-coralpink">{error}</p>
			) : null}
		</div>
	);
}
