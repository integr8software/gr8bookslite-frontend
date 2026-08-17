import { PettyCashVoucherVATableOptions } from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import type { PettyCashVoucherFormValues } from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import {
	createPettyCashVoucherAccountOptions,
	createPettyCashVoucherPartyOptions,
	createPettyCashVoucherResponsibilityCenterOptions,
} from "@/app/src/data/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherData";
import type { PettyCashVoucherActionPageState } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-voucher/usePettyCashVoucherActionPage";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { CurrencyExchangeRateRow } from "@/app/src/ui/shared/app/CurrencyExchangeRateRow";
import {
	TransactionField,
	TransactionFieldClassName,
	TransactionTextField,
} from "@/app/src/ui/shared/transaction-setup/TransactionFormFields";
import { formatExchangeRateInput } from "@/app/src/utils/number.util";

export function PettyCashVoucherDetailsFields({
	canAddParty = true,
	canAddResponsibilityCenter = true,
	onOpenPartyDrawer,
	onOpenResponsibilityCenterDrawer,
	page,
}: {
	canAddParty?: boolean;
	canAddResponsibilityCenter?: boolean;
	onOpenPartyDrawer?: () => void;
	onOpenResponsibilityCenterDrawer?: () => void;
	page: PettyCashVoucherActionPageState;
}) {
	const accountOptions = createPettyCashVoucherAccountOptions(page.values);
	const partyOptions = createPettyCashVoucherPartyOptions(page.values);
	const responsibilityCenterOptions = createPettyCashVoucherResponsibilityCenterOptions(
		page.values,
	);

	return (
		<div className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
			<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
				<div className="grid content-start gap-5">
					<TransactionField
						label="Party Name"
						error={page.errors.partyName}
						isRequired
					>
						<AppAdvancedDropdown
							value={page.values.partyCode}
							readOnly={page.isReadonly}
							options={partyOptions}
							placeholder="Enter Party Name"
							searchPlaceholder="Search Party Name"
							addAction={
								!page.isReadonly && canAddParty && onOpenPartyDrawer
									? {
											label: "Add Party Name",
											onClick: onOpenPartyDrawer,
										}
									: undefined
							}
							onChange={(nextValue) => {
								const selectedValue = String(nextValue);
								const selectedOption = partyOptions.find(
									(option) => option.value === selectedValue,
								);

								if (selectedOption) {
									page.updateField("partyCode", selectedOption.value);
									page.updateField("partyName", selectedOption.name);
									return;
								}

								page.updateField("partyCode", "");
								page.updateField("partyName", "");
							}}
						/>
					</TransactionField>
					<TransactionField label="Responsibility Center">
						<AppAdvancedDropdown
							value={page.values.responsibilityCenterCode}
							readOnly={page.isReadonly}
							options={responsibilityCenterOptions}
							placeholder="Select Responsibility Center"
							searchPlaceholder="Search Responsibility Center"
							addAction={
								!page.isReadonly &&
								canAddResponsibilityCenter &&
								onOpenResponsibilityCenterDrawer
									? {
											label: "Add Responsibility Center",
											onClick: onOpenResponsibilityCenterDrawer,
										}
									: undefined
							}
							onChange={(nextValue) => {
								const selectedValue = String(nextValue);
								const selectedOption = responsibilityCenterOptions.find(
									(option) => option.value === selectedValue,
								);

								if (selectedOption) {
									page.updateField(
										"responsibilityCenterCode",
										selectedOption.value,
									);
									page.updateField("responsibilityCenter", selectedOption.name);
									return;
								}

								page.updateField("responsibilityCenterCode", "");
								page.updateField("responsibilityCenter", "");
							}}
						/>
					</TransactionField>
					<TransactionField
						label="Default Account Title"
						error={page.errors.accountTitle}
						isRequired
					>
						<AppAdvancedDropdown
							value={page.values.accountTitle}
							readOnly={page.isReadonly}
							options={accountOptions}
							placeholder="Enter Default Account Title"
							searchPlaceholder="Search Default Account Title"
							onChange={(nextValue) => {
								const selectedValue = String(nextValue);
								const selectedOption = accountOptions.find(
									(option) => option.value === selectedValue,
								);

								if (selectedOption) {
									page.updateField("accountTitle", selectedOption.value);
									page.updateField("accountCode", selectedOption.label ?? "");
									return;
								}

								page.updateField("accountTitle", "");
								page.updateField("accountCode", "");
							}}
						/>
					</TransactionField>
					<TransactionTextField
						value={page.values.amount}
						error={page.errors.amount}
						isMoney
						isReadonly={page.isReadonly}
						label="Amount"
						onValueChange={page.updateAmount}
						placeholder="0.00"
					/>
					<TransactionField label="Remarks" error={page.errors.remarks}>
						<AppLimitedTextarea
							value={page.values.remarks}
							readOnly={page.isReadonly}
							onChange={(event) =>
								page.updateField("remarks", event.target.value)
							}
							className={`${TransactionFieldClassName} min-h-32 max-w-full resize py-3`}
							counterMode="used"
							placeholder="Optional Remarks"
						/>
					</TransactionField>
				</div>

				<div className="grid content-start gap-5">
					<TransactionTextField
						value={page.values.partyCode}
						error={page.errors.partyCode}
						isRequired
						isReadonly
						label="Party Code"
						onValueChange={(value) => page.updateField("partyCode", value)}
						placeholder="Enter Party Code"
					/>
					<TransactionTextField
						value={page.values.responsibilityCenterCode}
						error={page.errors.responsibilityCenterCode}
						isReadonly
						label="Responsibility Center Code"
						onValueChange={(value) =>
							page.updateField("responsibilityCenterCode", value)
						}
						placeholder="Enter Responsibility Center Code"
					/>
					<TransactionTextField
						value={page.values.accountCode}
						error={page.errors.accountCode}
						isRequired
						isReadonly
						label="Default Account Code"
						onValueChange={(value) => page.updateField("accountCode", value)}
						placeholder="Enter Default Account Code"
					/>
					<CurrencyExchangeRateRow
						currencyControlId="petty-cash-voucher-currency"
						currencyLabel="Currency"
						currencyControl={
							<AppAdvancedDropdown
								id="petty-cash-voucher-currency"
								value={page.values.currency}
								readOnly={page.isReadonly}
								isClearable={false}
								options={page.currencyOptions}
								placeholder="Currency"
								searchPlaceholder="Search Currency"
								onChange={(value) => page.updateCurrency(String(value))}
							/>
						}
						exchangeRateControlId="petty-cash-voucher-exchange-rate"
						exchangeRateControl={
							<input
								id="petty-cash-voucher-exchange-rate"
								type="text"
								inputMode="decimal"
								value={page.values.exchangeRate}
								readOnly={page.isReadonly}
								disabled={page.isReadonly || page.isExchangeRateLoading}
								onChange={(event) => page.updateField("exchangeRate", formatExchangeRateInput(event.target.value))}
								className={`${TransactionFieldClassName} text-right tabular-nums`}
							/>
						}
					/>
					<TransactionField label="VATable" error={page.errors.vatable}>
						<select
							id="petty-cash-voucher-vatable"
							value={page.values.vatable}
							disabled={page.isReadonly}
							onChange={(event) =>
								page.updateVATable(
									event.target.value as PettyCashVoucherFormValues["vatable"],
								)
							}
							className={`${TransactionFieldClassName} app-select-control`}
						>
							{PettyCashVoucherVATableOptions.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</TransactionField>
					<TransactionTextField
						value={page.values.vatAmount}
						error={page.errors.vatAmount}
						isMoney
						isReadonly
						label="VAT Amount"
						onValueChange={(value) => page.updateField("vatAmount", value)}
						placeholder="0.00"
					/>
					<TransactionTextField
						value={page.values.netAmount}
						error={page.errors.netAmount}
						isMoney
						isReadonly
						label="Net Amount"
						onValueChange={(value) => page.updateField("netAmount", value)}
						placeholder="0.00"
					/>
				</div>

				<div className="grid content-start gap-5 md:col-span-2 xl:col-span-1">
					<TransactionTextField
						value={page.values.transactionNo}
						error={page.errors.transactionNo}
						isRequired
						isReadonly
						label="Petty Cash Voucher No."
						onValueChange={(value) => page.updateField("transactionNo", value)}
						placeholder="Auto Generated Petty Cash Voucher Transaction Number"
					/>
					<TransactionTextField
						value={page.values.documentDate}
						error={page.errors.documentDate}
						isReadonly={page.isReadonly}
						label="Petty Cash Voucher Date"
						onValueChange={(value) => page.updateField("documentDate", value)}
						type="date"
					/>
					<TransactionField label="Status" error={page.errors.status}>
						<input
							value={page.values.status}
							readOnly
							className={TransactionFieldClassName}
						/>
					</TransactionField>
				</div>
			</div>
		</div>
	);
}
