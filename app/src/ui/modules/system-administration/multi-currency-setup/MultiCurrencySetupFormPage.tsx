"use client";

import { Settings } from "lucide-react";
import { MultiCurrencySetupActionCopy } from "@/app/src/constants/modules/system-administration/multi-currency-setup/MultiCurrencySetupConstants";
import { useMultiCurrencySetupFormPage } from "@/app/src/hooks/modules/system-administration/multi-currency-setup/useMultiCurrencySetupFormPage";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { MultiCurrencySetupActionButtons } from "@/app/src/ui/modules/system-administration/multi-currency-setup/MultiCurrencySetupActionButtons";
import { MultiCurrencySetupFields } from "@/app/src/ui/modules/system-administration/multi-currency-setup/MultiCurrencySetupFields";
import { MultiCurrencySetupNotFound } from "@/app/src/ui/modules/system-administration/multi-currency-setup/MultiCurrencySetupNotFound";

export function MultiCurrencySetupFormPage() {
	const page = useMultiCurrencySetupFormPage();
	const copy = MultiCurrencySetupActionCopy[page.mode];

	if (page.needsRecord && !page.existingRecord) {
		return <MultiCurrencySetupNotFound />;
	}

	return (
		<>
			<form onSubmit={page.handleSubmit} className="grid gap-5">
				<ModuleHeader
					variant="panel"
					titleAs="h1"
					title={copy.title}
					description={copy.description}
					eyebrow={
						<>
							<Settings className="h-3.5 w-3.5" aria-hidden="true" />
							Administrative settings
						</>
					}
					actions={
						<MultiCurrencySetupActionButtons
							isReadonly={page.isReadonly}
							mode={page.mode}
							record={page.existingRecord}
							onDeleteRecord={() => page.setIsDeleteDialogOpen(true)}
						/>
					}
				/>

				<MultiCurrencySetupFields
					baseOriginalExchangeRateDisplay={
						page.baseOriginalExchangeRateDisplay
					}
					errors={page.errors}
					fetchedExchangeRateDisplay={page.fetchedExchangeRateDisplay}
					fetchedRate={page.fetchedRate}
					hasCurrencyPairChanged={page.hasCurrencyPairChanged}
					inverseExchangeRateDisplay={page.inverseExchangeRateDisplay}
					isRateLoading={page.isRateLoading}
					isReadonly={page.isReadonly}
					originalExchangeRateDisplay={page.originalExchangeRateDisplay}
					values={page.values}
					onInputChange={page.handleInputChange}
				/>
			</form>

			<AppDialog
				isOpen={page.isDeleteDialogOpen}
				isPending={page.isMutating}
				title="Delete currency setup?"
				description={`This will remove ${page.existingRecord?.baseCurrencyCode ?? "the selected base"} to ${page.existingRecord?.targetCurrencyCode ?? "wanted currency"}.`}
				confirmLabel="Delete Setup"
				tone="danger"
				onCancel={() => page.setIsDeleteDialogOpen(false)}
				onConfirm={page.handleConfirmDelete}
			/>
		</>
	);
}
