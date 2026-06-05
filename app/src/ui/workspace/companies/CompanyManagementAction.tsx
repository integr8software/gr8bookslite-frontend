"use client";

import { useMemo, useState } from "react";
import { Building2 } from "lucide-react";
import {
	WorkspaceCompaniesHref,
	WorkspaceCompanyNotFoundDescription,
} from "@/app/src/constants/workspace/WorkspaceCompanyConstants";
import { GetAccessToken } from "@/app/src/data/auth/AuthSessionStorage";
import { useBillingPaymentMethodsQuery } from "@/app/src/hooks/billing/useBillingPaymentMethodsQuery";
import { useBillingPlansQuery } from "@/app/src/hooks/billing/useBillingPlansQuery";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { useWorkspaceCompanyFormPage } from "@/app/src/hooks/workspace/companies/useWorkspaceCompanyFormPage";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { AppSkeleton } from "@/app/src/ui/shared/app/AppSkeleton";
import {
	CompanyDetailsFields,
	getPaymentMethodOptions,
} from "@/app/src/ui/workspace/companies/CompanyDetailsFields";
import { CompanyActionHeader } from "@/app/src/ui/workspace/companies/CompanyActionHeader";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";
import { WorkspaceCompanySpotlightTutorial } from "@/app/src/ui/workspace/companies/WorkspaceCompanySpotlightTutorial";

const CompanyFormId = "workspace-company-form";

export function CompanyManagementAction() {
	const form = useWorkspaceCompanyFormPage();
	const [isBillingConfirmOpen, setIsBillingConfirmOpen] = useState(false);
	const [isEditConfirmOpen, setIsEditConfirmOpen] = useState(false);
	const storedAccessToken = useAppStore((state) => state.accessToken);
	const accessToken = storedAccessToken ?? GetAccessToken();
	const plansQuery = useBillingPlansQuery({
		accessToken: form.mode === "add" ? accessToken : null,
		scope: "ADDITIONAL_COMPANY",
	});
	const paymentMethodsQuery = useBillingPaymentMethodsQuery({
		accessToken: form.mode === "add" ? accessToken : null,
	});
	const paymentMethodOptions = useMemo(
		() =>
			getPaymentMethodOptions(
				paymentMethodsQuery.data?.paymentMethods ?? [],
			),
		[paymentMethodsQuery.data?.paymentMethods],
	);

	if (form.needsRecord && form.isLoading && !form.existingCompany) {
		return (
			<section className="grid gap-5">
				<AppSkeleton className="h-24 rounded-lg" />
				<AppSkeleton className="h-72 rounded-lg" />
			</section>
		);
	}

	if (form.needsRecord && !form.existingCompany) {
		return (
			<ModuleNotFound
				actionHref={WorkspaceCompaniesHref}
				actionLabel="Back"
				align="center"
				description={WorkspaceCompanyNotFoundDescription}
				title="Company Not Found"
			/>
		);
	}

	async function handleSaveNewCompany() {
		await form.saveCompany();
		setIsBillingConfirmOpen(false);
	}

	async function handleSaveExistingCompany() {
		await form.saveCompany();
		setIsEditConfirmOpen(false);
	}

	return (
		<section className="grid gap-5">
			{form.mode === "add" ? <WorkspaceCompanySpotlightTutorial /> : null}
			<div data-spotlight-id="workspace-company-add-header">
				<CompanyActionHeader
					cancelHref={form.cancelHref}
					description={
						form.mode === "edit"
							? "Update company identity, subscription plan, and workspace availability."
							: "Create a company profile before adding company users and branches."
					}
					eyebrowIcon={Building2}
					eyebrowLabel="Workspace directory"
					formId={CompanyFormId}
					isReadonly={false}
					isPending={form.isMutating}
					mode={form.mode}
					saveLabel="Save Company"
					title={form.mode === "edit" ? "Edit Company" : "Add Company"}
				/>
			</div>
			<div data-spotlight-id="workspace-company-add-form">
				<CompanyDetailsFields
					errors={form.errors}
					formId={CompanyFormId}
					isLoadingPaymentMethods={paymentMethodsQuery.isLoading}
					isLoadingPlans={plansQuery.isLoading}
					paymentMethodOptions={paymentMethodOptions}
					plans={plansQuery.data?.plans ?? []}
					showBillingDetails={form.mode === "add"}
					values={form.values}
					onInputChange={form.handleInputChange}
					onSubmit={(event) => {
					if (form.mode === "edit") {
						event.preventDefault();

						if (form.validateCompany()) {
							setIsEditConfirmOpen(true);
						}

						return;
					}

					event.preventDefault();

					if (form.validateCompany()) {
						setIsBillingConfirmOpen(true);
					}
					}}
					onUpdateField={form.updateField}
					onUpdateLogoFile={form.updateLogoFile}
				/>
			</div>
			<AppDialog
				isOpen={isEditConfirmOpen}
				isPending={form.isMutating}
				title="Save company changes?"
				description={`This will update ${
					form.values.companyName || "this company"
				}'s company profile and workspace details.`}
				confirmationPhrase="confirm company"
				confirmLabel="Save Company"
				pendingLabel="Saving..."
				onCancel={() => setIsEditConfirmOpen(false)}
				onConfirm={() => void handleSaveExistingCompany()}
			/>
			<AppDialog
				isOpen={isBillingConfirmOpen}
				isPending={form.isMutating}
				title="Create company?"
				description={`Creating ${form.values.companyName || "this company"} may affect workspace billing, payments, or deductions.`}
				confirmationPhrase="confirm company"
				confirmLabel="Save Company"
				pendingLabel="Saving..."
				onCancel={() => setIsBillingConfirmOpen(false)}
				onConfirm={handleSaveNewCompany}
			/>
		</section>
	);
}
