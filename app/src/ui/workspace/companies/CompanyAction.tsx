"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Building2, CreditCard, ImageUp, LoaderCircle, X } from "lucide-react";
import { WorkspaceCompaniesHref } from "@/app/src/constants/workspace/WorkspaceCompanyConstants";
import { GetAccessToken } from "@/app/src/data/auth/AuthSessionStorage";
import { OnboardingNonIndividualTypeOptions } from "@/app/src/data/onboarding/OnboardingData";
import { useBillingPaymentMethodsQuery } from "@/app/src/hooks/billing/useBillingPaymentMethodsQuery";
import { useBillingPlansQuery } from "@/app/src/hooks/billing/useBillingPlansQuery";
import { useWorkspaceCompanyAction } from "@/app/src/hooks/workspace/companies/useWorkspaceCompanyAction";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import type {
	BillingPaymentMethod,
	BillingPlan,
} from "@/app/src/data/billing/BillingTypes";
import type {
	WorkspaceCompanyFormErrors,
	WorkspaceCompanyFormValues,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";
import {
	DefaultPhilippineContactNumber,
	FormatPhilippineContactNumber,
	PhilippineContactNumberPlaceholder,
} from "@/app/src/data/shared/contact/ContactData";
import { FormatTinNumber } from "@/app/src/data/shared/tax/TaxData";
import { WorkspaceCompanyActionHeader } from "@/app/src/ui/workspace/companies/WorkspaceCompanyActionHeader";
import {
	WorkspaceCompanyField,
	WorkspaceCompanyFieldClassName,
	WorkspaceCompanySection,
} from "@/app/src/ui/workspace/companies/WorkspaceCompanyFormPrimitives";
import {
	WorkspaceCompanyAvatar,
	WorkspacePlanBadge,
	WorkspaceStatusBadge,
	WorkspaceTextBadge,
} from "@/app/src/ui/workspace/companies/WorkspaceCompanyBadges";
import { WorkspaceCompanyNotFound } from "@/app/src/ui/workspace/companies/WorkspaceCompanyNotFound";

const CompanyFormId = "workspace-company-form";
const SetupLaterPaymentMethod = {
	id: "setup-later",
	label: "Set up billing after creating company",
};
const NewPayMongoCardPaymentMethod = {
	id: "new-paymongo-card",
	label: "Add new PayMongo card",
};
const WorkspaceCompanyConfirmActionClassName =
	"theme-accent-contrast-text inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-skyblue px-5 text-sm font-semibold shadow-[0_12px_30px_rgb(var(--skyblue-rgb)/0.24)] transition hover:bg-skyblue/85 disabled:cursor-not-allowed disabled:bg-darknavy/25";

export function WorkspaceCompanyAction() {
	const action = useWorkspaceCompanyAction();
	const [isBillingConfirmOpen, setIsBillingConfirmOpen] = useState(false);
	const storedAccessToken = useAppStore((state) => state.accessToken);
	const accessToken = storedAccessToken ?? GetAccessToken();
	const plansQuery = useBillingPlansQuery({
		accessToken,
		scope: "ADDITIONAL_COMPANY",
	});
	const paymentMethodsQuery = useBillingPaymentMethodsQuery({ accessToken });
	const paymentMethodOptions = useMemo(
		() =>
			getPaymentMethodOptions(
				paymentMethodsQuery.data?.paymentMethods ?? [],
			),
		[paymentMethodsQuery.data?.paymentMethods],
	);

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
				isPending={action.isMutating}
				mode={action.mode}
				saveLabel="Save Company"
				title={action.mode === "edit" ? "Edit Company" : "Add Company"}
			/>
			{action.mode === "edit" && action.existingCompany ? (
				<EditCompanyOverview company={action.existingCompany} />
			) : null}
			<CompanyDetailsFields
				errors={action.errors}
				isLoadingPaymentMethods={paymentMethodsQuery.isLoading}
				isLoadingPlans={plansQuery.isLoading}
				paymentMethodOptions={paymentMethodOptions}
				plans={plansQuery.data?.plans ?? []}
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
				onUpdateLogoFile={action.updateLogoFile}
			/>
			<CompanyCreateConfirmDialog
				isOpen={isBillingConfirmOpen}
				isPending={action.isMutating}
				resourceName={action.values.companyName || "this company"}
				onCancel={() => setIsBillingConfirmOpen(false)}
				onConfirm={async () => {
					await action.saveCompany();
				}}
			/>
		</section>
	);
}

function EditCompanyOverview({
	company,
}: {
	company: NonNullable<
		ReturnType<typeof useWorkspaceCompanyAction>["existingCompany"]
	>;
}) {
	return (
		<section className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm sm:p-6">
			<div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
				<div className="flex min-w-0 items-start gap-4">
					<WorkspaceCompanyAvatar
						initials={company.initials}
						logoUrl={company.logoUrl}
						name={company.name}
					/>
					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-2">
							<WorkspaceStatusBadge status={company.status} />
							<WorkspacePlanBadge plan={company.plan} />
							<WorkspaceTextBadge>
								{company.companyType}
							</WorkspaceTextBadge>
						</div>
						<h2 className="mt-3 break-words text-xl font-semibold text-darknavy">
							{company.name}
						</h2>
						<p className="mt-1 break-words text-sm leading-6 text-darknavy/58">
							{company.address || "No address yet"}
						</p>
					</div>
				</div>
				<div className="grid grid-cols-2 gap-3 sm:min-w-72">
					<OverviewMetric
						label="Branches"
						value={company.totalBranches ?? 0}
					/>
					<OverviewMetric
						label="Users"
						value={company.totalUsers ?? 0}
					/>
				</div>
			</div>

			<div className="mt-6 grid gap-x-6 gap-y-4 border-t border-darknavy/10 pt-5 sm:grid-cols-2 xl:grid-cols-4">
				<OverviewDetail
					label="Primary Contact"
					value={company.primaryContact}
				/>
				<OverviewDetail label="Email" value={company.email} />
				<OverviewDetail
					label="Contact No."
					value={company.contactNumber}
				/>
				<OverviewDetail label="TIN" value={company.tin} />
				<OverviewDetail
					label="Report Start"
					value={company.reportStartDate}
				/>
				<OverviewDetail
					label="Report End"
					value={company.reportEndDate}
				/>
				<OverviewDetail
					label="Created By"
					value={company.createdByUser?.name}
				/>
				<OverviewDetail
					label="Creator Email"
					value={company.createdByUser?.email}
				/>
				<OverviewDetail label="Website" value={company.website} />
				<OverviewDetail label="Created" value={company.createdAt} />
			</div>
		</section>
	);
}

function OverviewMetric({ label, value }: { label: string; value: number }) {
	return (
		<div className="rounded-lg border border-darknavy/10 bg-offwhite/60 p-4">
			<p className="text-xs font-semibold uppercase tracking-wide text-darknavy/45">
				{label}
			</p>
			<p className="mt-2 text-2xl font-semibold text-darknavy">{value}</p>
		</div>
	);
}

function OverviewDetail({ label, value }: { label: string; value?: string }) {
	return (
		<div className="min-w-0">
			<p className="text-xs font-semibold uppercase tracking-wide text-darknavy/45">
				{label}
			</p>
			<p className="mt-1 break-words text-sm font-semibold text-darknavy">
				{value?.trim() || "-"}
			</p>
		</div>
	);
}

function CompanyDetailsFields({
	errors,
	isLoadingPaymentMethods,
	isLoadingPlans,
	paymentMethodOptions,
	plans,
	showBillingDetails,
	values,
	onInputChange,
	onSubmit,
	onUpdateField,
	onUpdateLogoFile,
}: {
	errors: WorkspaceCompanyFormErrors;
	isLoadingPaymentMethods: boolean;
	isLoadingPlans: boolean;
	paymentMethodOptions: { id: string; label: string }[];
	plans: BillingPlan[];
	showBillingDetails: boolean;
	values: WorkspaceCompanyFormValues;
	onInputChange: (
		event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => void;
	onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
	onUpdateField: (
		field: keyof WorkspaceCompanyFormValues,
		value: string,
	) => void;
	onUpdateLogoFile: (file: File | null) => void;
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
		onUpdateLogoFile(file);
		const nextPreviewUrl = URL.createObjectURL(file);
		onUpdateField("logoUrl", nextPreviewUrl);
		updateLogoPreviewUrl(nextPreviewUrl);
	}

	function handleLogoRemove() {
		onUpdateField("logoName", "");
		onUpdateField("logoUrl", "");
		onUpdateLogoFile(null);
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
								onClick={() =>
									onUpdateField("taxpayerType", "individual")
								}
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
								onClick={() =>
									onUpdateField(
										"taxpayerType",
										"non-individual",
									)
								}
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
							<WorkspaceCompanyField
								label="Last Name"
								error={errors.lastName}
								required
							>
								<input
									name="lastName"
									value={values.lastName}
									onChange={onInputChange}
									className={WorkspaceCompanyFieldClassName}
								/>
							</WorkspaceCompanyField>
							<WorkspaceCompanyField
								label="First Name"
								error={errors.firstName}
								required
							>
								<input
									name="firstName"
									value={values.firstName}
									onChange={onInputChange}
									className={WorkspaceCompanyFieldClassName}
								/>
							</WorkspaceCompanyField>
							<WorkspaceCompanyField
								label="Middle Name"
								error={errors.middleName}
							>
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
									<option value="">
										Select organization type
									</option>
									{OnboardingNonIndividualTypeOptions.map(
										(option) => (
											<option key={option} value={option}>
												{option}
											</option>
										),
									)}
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
										className={
											WorkspaceCompanyFieldClassName
										}
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
						<WorkspaceCompanyField
							label="TIN"
							error={errors.tin}
							required
						>
							<input
								name="tin"
								value={values.tin}
								onChange={(event) =>
									onUpdateField(
										"tin",
										FormatTinNumber(event.target.value),
									)
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

			{showBillingDetails ? (
				<CompanyPlanSection
					error={errors.billingPlanCode}
					isLoading={isLoadingPlans}
					plans={plans}
					values={values}
					onInputChange={onInputChange}
				/>
			) : null}

			<WorkspaceCompanySection
				title="Contact"
				description="Workspace admins use these fields to identify the company owner and billing contact."
				className="mt-5"
			>
				<div className="grid gap-4 lg:grid-cols-2">
					<WorkspaceCompanyField
						label="Email"
						error={errors.email}
						required
					>
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
									FormatPhilippineContactNumber(
										event.target.value,
									),
								)
							}
							onFocus={() => {
								if (!values.contactNumber) {
									onUpdateField(
										"contactNumber",
										DefaultPhilippineContactNumber,
									);
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
					<WorkspaceCompanyField
						label="Report Start Date"
						error={errors.reportStartDate}
						required
					>
						<input
							name="reportStartDate"
							type="date"
							value={values.reportStartDate}
							onChange={onInputChange}
							className={WorkspaceCompanyFieldClassName}
						/>
					</WorkspaceCompanyField>
					<WorkspaceCompanyField
						label="Report End Date"
						error={errors.reportEndDate}
						required
					>
						<input
							name="reportEndDate"
							type="date"
							value={values.reportEndDate}
							onChange={onInputChange}
							className={WorkspaceCompanyFieldClassName}
						/>
					</WorkspaceCompanyField>
					<div className="lg:col-span-2">
						<WorkspaceCompanyField
							label="Company Website (Optional)"
							error={errors.website}
						>
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
					description="Billing can be attached after the company is created, or connected with a PayMongo payment method when tokenization is available."
					className="mt-5"
				>
					<div className="grid gap-4">
						<div className="rounded-xl border border-darknavy/10 bg-offwhite/50 p-4">
							<div className="mb-4 flex items-start gap-3">
								<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-darknavy shadow-sm">
									<CreditCard
										className="h-5 w-5"
										aria-hidden="true"
									/>
								</span>
								<div>
									<p className="text-sm font-semibold text-darknavy">
										PayMongo payment method
									</p>
									<p className="mt-1 text-sm leading-6 text-darknavy/60">
										Choose how billing should be handled for
										this new company.
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
										className={
											WorkspaceCompanyFieldClassName
										}
									>
										{paymentMethodOptions.map((method) => (
											<option
												key={method.id}
												value={method.id}
											>
												{method.label}
											</option>
										))}
									</select>
								</WorkspaceCompanyField>
								<p className="self-end text-sm leading-6 text-darknavy/55">
									{isLoadingPaymentMethods
										? "Loading saved PayMongo cards..."
										: "Saved cards from previous company billing setup are available here."}
								</p>
							</div>
						</div>

						{values.billingPaymentMethodId ===
						"new-paymongo-card" ? (
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
										className={
											WorkspaceCompanyFieldClassName
										}
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
										className={
											WorkspaceCompanyFieldClassName
										}
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
											className={
												WorkspaceCompanyFieldClassName
											}
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
										className={
											WorkspaceCompanyFieldClassName
										}
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
										className={
											WorkspaceCompanyFieldClassName
										}
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
										className={
											WorkspaceCompanyFieldClassName
										}
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
											className={
												WorkspaceCompanyFieldClassName
											}
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

function CompanyPlanSection({
	error,
	isLoading,
	plans,
	values,
	onInputChange,
}: {
	error?: string;
	isLoading: boolean;
	plans: BillingPlan[];
	values: WorkspaceCompanyFormValues;
	onInputChange: (
		event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => void;
}) {
	const selectedPlan = plans.find(
		(plan) => plan.code === values.billingPlanCode,
	);
	const price =
		selectedPlan?.pricing[
			values.billingCycle === "YEARLY" ? "yearly" : "monthly"
		];

	return (
		<WorkspaceCompanySection
			title="Plan"
			description="Choose the plan and billing cycle that should be attached to this company subscription."
			className="mt-5"
		>
			<div className="grid gap-4 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<WorkspaceCompanyField
						label="Company Plan"
						error={error}
						required
					>
						<select
							name="billingPlanCode"
							value={values.billingPlanCode}
							onChange={onInputChange}
							className={WorkspaceCompanyFieldClassName}
						>
							{isLoading ? (
								<option value="">Loading plans...</option>
							) : null}
							<option value="" disabled>
								Select plan
							</option>
							{plans.map((plan) => (
								<option key={plan.code} value={plan.code}>
									{plan.name}
								</option>
							))}
							{!isLoading &&
							values.billingPlanCode &&
							!selectedPlan ? (
								<option value={values.billingPlanCode}>
									{values.billingPlanCode}
								</option>
							) : null}
						</select>
					</WorkspaceCompanyField>
				</div>
				<WorkspaceCompanyField label="Billing Cycle">
					<select
						name="billingCycle"
						value={values.billingCycle}
						onChange={onInputChange}
						className={WorkspaceCompanyFieldClassName}
					>
						<option value="MONTHLY">Monthly</option>
						<option value="YEARLY">Annual</option>
					</select>
				</WorkspaceCompanyField>
				<div className="rounded-xl border border-skyblue/25 bg-skyblue/10 p-4 lg:col-span-3">
					<p className="text-sm font-semibold text-darknavy">
						{selectedPlan?.name ?? "No plan selected"}
					</p>
					<p className="mt-1 text-2xl font-bold text-darknavy">
						{formatPlanPrice(
							price?.amountInCents ?? null,
							selectedPlan,
						)}
						<span className="ml-2 text-sm font-medium text-darknavy/55">
							/
							{values.billingCycle === "YEARLY"
								? "year"
								: "month"}
						</span>
					</p>
					{selectedPlan?.description ? (
						<p className="mt-2 text-sm leading-6 text-darknavy/60">
							{selectedPlan.description}
						</p>
					) : null}
				</div>
			</div>
		</WorkspaceCompanySection>
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
			<p className="mb-2 block text-sm font-semibold text-darknavy">
				Logo
			</p>
			<label className="flex h-12 cursor-pointer overflow-hidden rounded-lg border border-darknavy/10 bg-white">
				<span className="flex w-12 items-center justify-center bg-darknavy text-white">
					<ImageUp className="h-5 w-5" aria-hidden="true" />
				</span>
				<span className="flex min-w-0 flex-1 items-center px-4 text-sm font-medium text-darknavy/65">
					<span className="truncate">
						{fileName || "Upload image"}
					</span>
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
				<p className="mt-2 text-sm font-medium text-coralpink">
					{error}
				</p>
			) : null}
		</div>
	);
}

function CompanyCreateConfirmDialog({
	isOpen,
	isPending,
	resourceName,
	onCancel,
	onConfirm,
}: {
	isOpen: boolean;
	isPending: boolean;
	resourceName: string;
	onCancel: () => void;
	onConfirm: () => Promise<void> | void;
}) {
	const [confirmText, setConfirmText] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const canConfirm = confirmText.trim().toLowerCase() === "confirm company";
	const isConfirmPending = isPending || isSaving;

	if (!isOpen) {
		return null;
	}

	function handleCancel() {
		setConfirmText("");
		onCancel();
	}

	async function handleConfirm() {
		if (!canConfirm || isConfirmPending) {
			return;
		}

		setIsSaving(true);

		try {
			await onConfirm();
		} finally {
			setIsSaving(false);
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-darknavy/45 px-4 backdrop-blur-sm">
			<div className="w-full max-w-lg rounded-2xl border border-darknavy/10 bg-white p-6 shadow-2xl">
				<p className="text-lg font-bold text-darknavy">
					Create company?
				</p>
				<p className="mt-2 text-sm leading-6 text-darknavy/65">
					Creating {resourceName} may affect workspace billing,
					payments, or deductions. Type{" "}
					<span className="font-semibold text-darknavy">
						confirm company
					</span>{" "}
					before saving.
				</p>
				<div className="mt-5">
					<label
						htmlFor="confirm-company"
						className="mb-2 block text-sm font-semibold text-darknavy"
					>
						Confirmation
					</label>
					<input
						id="confirm-company"
						value={confirmText}
						onChange={(event) => setConfirmText(event.target.value)}
						className={WorkspaceCompanyFieldClassName}
						placeholder="confirm company"
						autoFocus
					/>
				</div>
				<div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
					<button
						type="button"
						onClick={handleCancel}
						disabled={isConfirmPending}
						className="inline-flex h-11 items-center justify-center rounded-lg border border-darknavy/10 bg-white px-5 text-sm font-semibold text-darknavy/70 transition hover:bg-offwhite disabled:cursor-not-allowed disabled:opacity-60"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={handleConfirm}
						disabled={!canConfirm || isConfirmPending}
						className={WorkspaceCompanyConfirmActionClassName}
					>
						{isConfirmPending ? (
							<LoaderCircle
								className="h-4 w-4 animate-spin"
								aria-hidden="true"
							/>
						) : null}
						{isConfirmPending ? "Saving..." : "Save Company"}
					</button>
				</div>
			</div>
		</div>
	);
}

function getPaymentMethodOptions(paymentMethods: BillingPaymentMethod[]) {
	const savedMethods = paymentMethods
		.filter((method) => method.externalPaymentMethodId)
		.map((method) => ({
			id: method.externalPaymentMethodId,
			label: formatPaymentMethodLabel(method),
		}));

	return [
		SetupLaterPaymentMethod,
		...savedMethods,
		NewPayMongoCardPaymentMethod,
	];
}

function formatPaymentMethodLabel(method: BillingPaymentMethod) {
	const cardLabel = formatCardIdentity(method);
	const expiryLabel =
		method.expMonth && method.expYear
			? ` · Expires ${String(method.expMonth).padStart(2, "0")}/${method.expYear}`
			: "";
	const companyLabel = method.company?.name
		? ` · Used by ${method.company.name}`
		: "";
	const planLabel = method.subscription?.plan.name
		? ` · ${method.subscription.plan.name}`
		: "";

	return `${cardLabel}${expiryLabel}${companyLabel}${planLabel}`;
}

function formatCardIdentity(method: BillingPaymentMethod) {
	const brand = method.brand ? titleCase(method.brand) : "PayMongo card";

	if (!method.last4) {
		return `${brand} · Saved card`;
	}

	return `${brand} •••• ${method.last4}`;
}

function formatPlanPrice(amountInCents: number | null, plan?: BillingPlan) {
	if (amountInCents === null) {
		return "Price pending";
	}

	return new Intl.NumberFormat("en-PH", {
		currency: plan?.currency ?? "PHP",
		style: "currency",
	}).format(amountInCents / 100);
}

function titleCase(value: string) {
	return value
		.toLowerCase()
		.split(/[\s_-]+/)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}
