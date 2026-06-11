"use client";

import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Edit3, ReceiptText, Save, X } from "lucide-react";
import { useTransactionNumberSetupFormPage } from "@/app/src/hooks/modules/system-administration/transaction-number-setup/useTransactionNumberSetupFormPage";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { TransactionNumberSetupForm } from "@/app/src/ui/modules/system-administration/transaction-number-setup/TransactionNumberSetupForm";
import { TransactionNumberSetupNotFound } from "@/app/src/ui/modules/system-administration/transaction-number-setup/TransactionNumberSetupNotFound";

export function TransactionNumberSetupFormPage() {
	return (
		<Suspense fallback={null}>
			<TransactionNumberSetupFormPageInner />
		</Suspense>
	);
}

function TransactionNumberSetupFormPageInner() {
	const page = useTransactionNumberSetupFormPage();

	if (page.needsRecord && !page.existingSetup) {
		return <TransactionNumberSetupNotFound />;
	}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title={
					page.mode === "view"
						? "View Transaction Number Setup"
						: page.mode === "edit"
							? "Edit Transaction Number Setup"
							: "Add Transaction Number Setup"
				}
				description="Configure document prefixes, padding, running numbers, and branch coverage."
				eyebrow={
					<>
						<ReceiptText className="h-3.5 w-3.5" aria-hidden="true" />
						System administration
					</>
				}
				actions={
					<>
						{page.mode === "view" ? (
							<Link
								href={page.cancelHref}
								className={moduleHeaderActionClassNames.secondary}
							>
								<ArrowLeft className="h-4 w-4" aria-hidden="true" />
								Back
							</Link>
						) : null}
						{page.mode === "view" && page.editHref ? (
							<Link
								href={page.editHref}
								className={moduleHeaderActionClassNames.secondary}
							>
								<Edit3 className="h-4 w-4" aria-hidden="true" />
								Edit
							</Link>
						) : null}
						{page.mode !== "view" ? (
							<Link
								href={page.cancelHref}
								className={moduleHeaderActionClassNames.secondary}
							>
								<X className="h-4 w-4" aria-hidden="true" />
								Cancel
							</Link>
						) : null}
						{!page.isReadonly ? (
							<button
								type="submit"
								form="transaction-number-setup-form"
								className={moduleHeaderActionClassNames.primary}
							>
								<Save className="h-4 w-4" aria-hidden="true" />
								Save
							</button>
						) : null}
					</>
				}
			/>
			<TransactionNumberSetupForm
				branchOptions={page.branchOptions}
				errors={page.errors}
				isReadonly={page.isReadonly}
				nextNumberPreview={page.nextNumberPreview}
				values={page.values}
				onInputChange={page.handleInputChange}
				onModuleCodeChange={page.handleModuleCodeChange}
				onSubmit={page.handleSubmit}
				onToggleBranch={page.toggleBranch}
			/>
		</section>
	);
}
