import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type RefObject } from "react";
import { CreditCard, ImageUp, X } from "lucide-react";
import { AppMaxFileUploadSizeLabel } from "@/app/src/constants/shared/app/AppConstants";
import { OnboardingNonIndividualTypeOptions } from "@/app/src/data/onboarding/OnboardingData";
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
import {
	WorkspaceManagementField,
	WorkspaceManagementFieldClassName,
	WorkspaceManagementSection,
} from "@/app/src/ui/workspace/WorkspaceManagementForm";

const SetupLaterPaymentMethod = {
	id: "setup-later",
	label: "Set up billing after creating company",
};
const NewPayMongoCardPaymentMethod = {
	id: "new-paymongo-card",
	label: "Add new PayMongo card",
};
export function CompanyDetailsFields({
	errors,
	formId,
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
	formId: string;
	isLoadingPaymentMethods: boolean;
	isLoadingPlans: boolean;
	paymentMethodOptions: { id: string; label: string }[];
	plans: BillingPlan[];
	showBillingDetails: boolean;
	values: WorkspaceCompanyFormValues;
	onInputChange: (
		event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	onUpdateField: (
		field: keyof WorkspaceCompanyFormValues,
		value: string,
	) => void;
	onUpdateLogoFile: (file: File | null) => void;
}) {
	const logoInputRef = useRef<HTMLInputElement | null>(null);
	const [logoInputKey, setLogoInputKey] = useState(0);
	const isIndividual = values.taxpayerType === "individual";
	const isOtherOrganizationType = values.nonIndividualType === "Others";

	useEffect(() => {
		return () => {
			if (values.logoUrl.startsWith("blob:")) {
				URL.revokeObjectURL(values.logoUrl);
			}
		};
	}, [values.logoUrl]);

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
	}

	function handleLogoRemove() {
		onUpdateField("logoName", "");
		onUpdateField("logoUrl", "");
		onUpdateLogoFile(null);
		setLogoInputKey((current) => current + 1);
	}

	return (
		<form id={formId} onSubmit={onSubmit} noValidate>
			<input type="submit" hidden />
			<WorkspaceManagementSection
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
							<WorkspaceManagementField
								label="Last Name"
								error={errors.lastName}
								required
							>
								<input
									name="lastName"
									value={values.lastName}
									onChange={onInputChange}
									className={WorkspaceManagementFieldClassName}
								/>
							</WorkspaceManagementField>
							<WorkspaceManagementField
								label="First Name"
								error={errors.firstName}
								required
							>
								<input
									name="firstName"
									value={values.firstName}
									onChange={onInputChange}
									className={WorkspaceManagementFieldClassName}
								/>
							</WorkspaceManagementField>
							<WorkspaceManagementField
								label="Middle Name"
								error={errors.middleName}
							>
								<input
									name="middleName"
									value={values.middleName}
									onChange={onInputChange}
									className={WorkspaceManagementFieldClassName}
								/>
							</WorkspaceManagementField>
						</div>
					) : (
						<div className="grid gap-4 lg:grid-cols-2">
							<WorkspaceManagementField
								label="Company / Organization Name"
								error={errors.companyName}
								required
							>
								<input
									name="companyName"
									value={values.companyName}
									onChange={onInputChange}
									className={WorkspaceManagementFieldClassName}
								/>
							</WorkspaceManagementField>
							<WorkspaceManagementField
								label="Organization Type"
								error={errors.nonIndividualType}
								required
							>
								<select
									name="nonIndividualType"
									value={values.nonIndividualType}
									onChange={onInputChange}
									className={WorkspaceManagementFieldClassName}
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
							</WorkspaceManagementField>
							{isOtherOrganizationType ? (
								<WorkspaceManagementField
									label="Please Specify"
									error={errors.nonIndividualTypeOther}
									required
								>
									<input
										name="nonIndividualTypeOther"
										value={values.nonIndividualTypeOther}
										onChange={onInputChange}
										className={
											WorkspaceManagementFieldClassName
										}
									/>
								</WorkspaceManagementField>
							) : null}
						</div>
					)}

					<CompanyLogoField
						error={errors.logoName}
						fileName={values.logoName}
						inputKey={logoInputKey}
						inputRef={logoInputRef}
						previewUrl={values.logoUrl}
						onChange={handleLogoChange}
						onRemove={handleLogoRemove}
					/>

					<div className="grid gap-4 lg:grid-cols-2">
						<WorkspaceManagementField
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
								className={WorkspaceManagementFieldClassName}
								placeholder="123-456-789-000"
							/>
						</WorkspaceManagementField>
					</div>
				</div>
			</WorkspaceManagementSection>

			{showBillingDetails ? (
				<CompanyPlanSection
					error={errors.billingPlanCode}
					isLoading={isLoadingPlans}
					plans={plans}
					values={values}
					onInputChange={onInputChange}
				/>
			) : null}

			<WorkspaceManagementSection
				title="Contact"
				description="Workspace admins use these fields to identify the company owner and billing contact."
				className="mt-5"
			>
				<div className="grid gap-4 lg:grid-cols-2">
					<WorkspaceManagementField
						label="Email"
						error={errors.email}
						required
					>
						<input
							name="email"
							type="email"
							value={values.email}
							onChange={onInputChange}
							className={WorkspaceManagementFieldClassName}
						/>
					</WorkspaceManagementField>
					<WorkspaceManagementField
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
							className={WorkspaceManagementFieldClassName}
							placeholder={PhilippineContactNumberPlaceholder}
						/>
					</WorkspaceManagementField>
					<div className="lg:col-span-2">
						<WorkspaceManagementField
							label="Address"
							error={errors.address}
							required
						>
							<input
								name="address"
								value={values.address}
								onChange={onInputChange}
								className={WorkspaceManagementFieldClassName}
							/>
						</WorkspaceManagementField>
					</div>
					<WorkspaceManagementField
						label="Report Start Date"
						error={errors.reportStartDate}
						required
					>
						<input
							name="reportStartDate"
							type="date"
							value={values.reportStartDate}
							onChange={onInputChange}
							className={WorkspaceManagementFieldClassName}
						/>
					</WorkspaceManagementField>
					<WorkspaceManagementField
						label="Report End Date"
						error={errors.reportEndDate}
						required
					>
						<input
							name="reportEndDate"
							type="date"
							value={values.reportEndDate}
							onChange={onInputChange}
							className={WorkspaceManagementFieldClassName}
						/>
					</WorkspaceManagementField>
					<div className="lg:col-span-2">
						<WorkspaceManagementField
							label="Company Website (Optional)"
							error={errors.website}
						>
							<input
								name="website"
								type="url"
								value={values.website}
								onChange={onInputChange}
								className={WorkspaceManagementFieldClassName}
								placeholder="https://acmecorp.com"
							/>
						</WorkspaceManagementField>
					</div>
				</div>
			</WorkspaceManagementSection>

			{showBillingDetails ? (
				<WorkspaceManagementSection
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
								<WorkspaceManagementField
									label="Payment Method"
									error={errors.billingPaymentMethodId}
									required
								>
									<select
										name="billingPaymentMethodId"
										value={values.billingPaymentMethodId}
										onChange={onInputChange}
										className={
											WorkspaceManagementFieldClassName
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
								</WorkspaceManagementField>
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
								<WorkspaceManagementField
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
											WorkspaceManagementFieldClassName
										}
										placeholder="John Doe"
									/>
								</WorkspaceManagementField>
								<WorkspaceManagementField
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
											WorkspaceManagementFieldClassName
										}
										placeholder="billing@company.com"
									/>
								</WorkspaceManagementField>
								<div className="lg:col-span-2">
									<WorkspaceManagementField
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
												WorkspaceManagementFieldClassName
											}
											placeholder="1234 5678 9012 3456"
										/>
									</WorkspaceManagementField>
								</div>
								<WorkspaceManagementField
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
											WorkspaceManagementFieldClassName
										}
										placeholder="MM"
									/>
								</WorkspaceManagementField>
								<WorkspaceManagementField
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
											WorkspaceManagementFieldClassName
										}
										placeholder="YYYY"
									/>
								</WorkspaceManagementField>
								<WorkspaceManagementField
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
											WorkspaceManagementFieldClassName
										}
										placeholder="123"
									/>
								</WorkspaceManagementField>
								<div className="lg:col-span-2">
									<WorkspaceManagementField
										label="Billing Address"
										error={errors.billingAddress}
										required
									>
										<input
											name="billingAddress"
											value={values.billingAddress}
											onChange={onInputChange}
											className={
												WorkspaceManagementFieldClassName
											}
											placeholder="123 Main St, City, Province"
										/>
									</WorkspaceManagementField>
								</div>
							</div>
						) : null}
					</div>
				</WorkspaceManagementSection>
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
		event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
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
		<WorkspaceManagementSection
			title="Plan"
			description="Choose the plan and billing cycle that should be attached to this company subscription."
			className="mt-5"
		>
			<div className="grid gap-4 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<WorkspaceManagementField
						label="Company Plan"
						error={error}
						required
					>
						<select
							name="billingPlanCode"
							value={values.billingPlanCode}
							onChange={onInputChange}
							className={WorkspaceManagementFieldClassName}
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
					</WorkspaceManagementField>
				</div>
				<WorkspaceManagementField label="Billing Cycle">
					<select
						name="billingCycle"
						value={values.billingCycle}
						onChange={onInputChange}
						className={WorkspaceManagementFieldClassName}
					>
						<option value="MONTHLY">Monthly</option>
						<option value="YEARLY">Annual</option>
					</select>
				</WorkspaceManagementField>
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
		</WorkspaceManagementSection>
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
	inputRef: RefObject<HTMLInputElement | null>;
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
				Upload your company or personal logo. Max {AppMaxFileUploadSizeLabel}.
			</p>
			{error ? (
				<p className="mt-2 text-sm font-medium text-coralpink">
					{error}
				</p>
			) : null}
		</div>
	);
}


export function getPaymentMethodOptions(paymentMethods: BillingPaymentMethod[]) {
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
			? ` - Expires ${String(method.expMonth).padStart(2, "0")}/${method.expYear}`
			: "";
	const companyLabel = method.company?.name
		? ` - Used by ${method.company.name}`
		: "";
	const planLabel = method.subscription?.plan.name
		? ` - ${method.subscription.plan.name}`
		: "";

	return `${cardLabel}${expiryLabel}${companyLabel}${planLabel}`;
}

function formatCardIdentity(method: BillingPaymentMethod) {
	const brand = method.brand ? titleCase(method.brand) : "PayMongo card";

	if (!method.last4) {
		return `${brand} saved card`;
	}

	return `${brand} ending ${method.last4}`;
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
