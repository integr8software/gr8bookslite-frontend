"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CircleOff, Edit3, ReceiptText, Save, X } from "lucide-react";
import { useTransactionNumberSetupFormPage } from "@/app/src/hooks/modules/system-administration/transaction-number-setup/useTransactionNumberSetupFormPage";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
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
	const [isInactiveDialogOpen, setIsInactiveDialogOpen] = useState(false);

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
						{page.existingSetup && page.existingSetup.status === "Active" ? (
							<button
								type="button"
								onClick={() => setIsInactiveDialogOpen(true)}
								className={moduleHeaderActionClassNames.danger}
							>
								<CircleOff className="h-4 w-4" aria-hidden="true" />
								Set Inactive
							</button>
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
			<AppDialog
				isOpen={isInactiveDialogOpen}
				isPending={page.isMutating}
				title="Set setup as inactive?"
				description={`This will stop ${page.existingSetup?.moduleName ?? "the selected setup"} from generating new numbers.`}
				confirmLabel="Set Inactive"
				tone="danger"
				onCancel={() => setIsInactiveDialogOpen(false)}
				onConfirm={page.handleStatusChange}
			/>
		</section>
	);
}
