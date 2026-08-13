import {
	BillingInvoiceCurrencyOptions,
	BillingInvoiceDefaultAccountOptions,
	BillingInvoiceDescriptionOptions,
	BillingInvoicePartyOptions,
	BillingInvoiceTeamOptions,
	BillingInvoiceTermOptions,
} from "@/app/src/data/modules/sales/billing-invoice/BillingInvoiceData";
import type {
	BillingInvoiceFieldUpdater,
	BillingInvoiceFormValues,
} from "@/app/src/types/modules/sales/billing-invoice/BillingInvoiceTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";
import {
	AttachedDropdown,
	FieldClassName,
	FieldShell,
	SelectField,
} from "@/app/src/ui/modules/sales/billing-invoice/action/BillingInvoiceFieldControls";

type BillingInvoiceCustomerFieldsProps = {
	isReadonly: boolean;
	onUpdateField: BillingInvoiceFieldUpdater<BillingInvoiceFormValues>;
	values: BillingInvoiceFormValues;
};

export function BillingInvoiceCustomerFields({
	isReadonly,
	onUpdateField,
	values,
}: BillingInvoiceCustomerFieldsProps) {
	return (
		<div className="grid min-w-0 content-start gap-x-8 gap-y-3 lg:grid-cols-2">
			<div className="grid min-w-0 content-start gap-3">
				<FieldShell controlId="billing-invoice-code" label="Code" isRequired>
					<input
						id="billing-invoice-code"
						value={values.code}
						readOnly={isReadonly}
						onChange={(event) => onUpdateField("code", event.target.value)}
						className={FieldClassName}
					/>
				</FieldShell>
				<FieldShell controlId="billing-invoice-currency" label="Currency">
					<div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_9rem]">
						<AppAdvancedDropdown
							id="billing-invoice-currency"
							value={values.currency}
							readOnly={isReadonly}
							isClearable={false}
							options={BillingInvoiceCurrencyOptions}
							placeholder="Currency"
							searchPlaceholder="Search currency"
							onChange={(value) => onUpdateField("currency", String(value))}
						/>
						<div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2">
							<label
								htmlFor="billing-invoice-exchange-rate"
								className="text-sm font-semibold text-darknavy"
							>
								FX Rate:
							</label>
							<MoneyNumberField
								id="billing-invoice-exchange-rate"
								value={values.exchangeRate}
								readOnly={isReadonly}
								onValueChange={(value) => onUpdateField("exchangeRate", value)}
								className={`${FieldClassName} text-right`}
							/>
						</div>
					</div>
				</FieldShell>
				<FieldShell controlId="billing-invoice-remarks" label="Remarks">
					<AppLimitedTextarea
						id="billing-invoice-remarks"
						value={values.remarks}
						readOnly={isReadonly}
						onChange={(event) => onUpdateField("remarks", event.target.value)}
						className={`${FieldClassName} min-h-28 py-3`}
						counterMode="remaining"
						maxLength={250}
					/>
				</FieldShell>
				<FieldShell controlId="billing-invoice-due-date" label="Due Date">
					<input
						id="billing-invoice-due-date"
						type="date"
						value={values.dueDate}
						readOnly={isReadonly}
						onChange={(event) => onUpdateField("dueDate", event.target.value)}
						className={FieldClassName}
					/>
				</FieldShell>
				<FieldShell
					controlId="billing-invoice-default-account"
					label="Default Account"
					isRequired
				>
					<AttachedDropdown
						id="billing-invoice-default-account"
						value={values.defaultAccount}
						readOnly={isReadonly}
						options={BillingInvoiceDefaultAccountOptions}
						placeholder="--Select Debit Account--"
						searchPlaceholder="Search account"
						onAdd={() => undefined}
						onChange={(value) => onUpdateField("defaultAccount", value)}
					/>
				</FieldShell>
				<FieldShell controlId="billing-invoice-start-date" label="Start Date">
					<input
						id="billing-invoice-start-date"
						type="date"
						value={values.startDate}
						readOnly={isReadonly}
						onChange={(event) => onUpdateField("startDate", event.target.value)}
						className={FieldClassName}
					/>
				</FieldShell>
				<FieldShell
					controlId="billing-invoice-charge-weight"
					label="CHG. Weight"
				>
					<input
						id="billing-invoice-charge-weight"
						value={values.chargeWeight}
						readOnly={isReadonly}
						onChange={(event) =>
							onUpdateField("chargeWeight", event.target.value)
						}
						className={FieldClassName}
					/>
				</FieldShell>
				<FieldShell
					controlId="billing-invoice-cargo-description"
					label="Description"
				>
					<input
						id="billing-invoice-cargo-description"
						value={values.cargoDescription}
						readOnly={isReadonly}
						onChange={(event) =>
							onUpdateField("cargoDescription", event.target.value)
						}
						className={FieldClassName}
					/>
				</FieldShell>
				<FieldShell controlId="billing-invoice-no-containers" label="No. Cnt.">
					<input
						id="billing-invoice-no-containers"
						value={values.noContainers}
						readOnly={isReadonly}
						onChange={(event) =>
							onUpdateField("noContainers", event.target.value)
						}
						className={FieldClassName}
					/>
				</FieldShell>
				<FieldShell
					controlId="billing-invoice-clearance-port"
					label="Clearance Port"
				>
					<input
						id="billing-invoice-clearance-port"
						value={values.clearancePort}
						readOnly={isReadonly}
						onChange={(event) =>
							onUpdateField("clearancePort", event.target.value)
						}
						className={FieldClassName}
					/>
				</FieldShell>
			</div>
			<div className="grid min-w-0 content-start gap-3">
				<FieldShell controlId="billing-invoice-name" label="Name" isRequired>
					<AttachedDropdown
						id="billing-invoice-name"
						value={values.name}
						readOnly={isReadonly}
						options={BillingInvoicePartyOptions}
						placeholder=""
						searchPlaceholder="Search customer"
						onAdd={() => undefined}
						onChange={(value) => onUpdateField("name", value)}
					/>
				</FieldShell>
				<FieldShell
					controlId="billing-invoice-contact-person"
					label="Contact Person"
				>
					<input
						id="billing-invoice-contact-person"
						value={values.contactPerson}
						readOnly={isReadonly}
						onChange={(event) =>
							onUpdateField("contactPerson", event.target.value)
						}
						className={FieldClassName}
					/>
				</FieldShell>
				<FieldShell controlId="billing-invoice-terms" label="Terms">
					<SelectField
						value={values.terms}
						readOnly={isReadonly}
						options={BillingInvoiceTermOptions}
						placeholder="--Select Terms--"
						onChange={(value) => onUpdateField("terms", value)}
					/>
				</FieldShell>
				<FieldShell controlId="billing-invoice-description" label="Description">
					<AttachedDropdown
						id="billing-invoice-description"
						value={values.description}
						readOnly={isReadonly}
						options={BillingInvoiceDescriptionOptions}
						placeholder="--Select Description--"
						searchPlaceholder="Search description"
						onAdd={() => undefined}
						onChange={(value) => onUpdateField("description", value)}
					/>
				</FieldShell>
				<FieldShell
					controlId="billing-invoice-team-assigned"
					label="Team Assigned"
				>
					<SelectField
						value={values.teamAssigned}
						readOnly={isReadonly}
						options={BillingInvoiceTeamOptions}
						placeholder="--Select Team--"
						onChange={(value) => onUpdateField("teamAssigned", value)}
					/>
				</FieldShell>
				<FieldShell
					controlId="billing-invoice-expiration-date"
					label="Date of Expiration"
				>
					<input
						id="billing-invoice-expiration-date"
						type="date"
						value={values.expirationDate}
						readOnly={isReadonly}
						onChange={(event) =>
							onUpdateField("expirationDate", event.target.value)
						}
						className={FieldClassName}
					/>
				</FieldShell>
				<FieldShell
					controlId="billing-invoice-actual-weight"
					label="Actual Weight"
				>
					<input
						id="billing-invoice-actual-weight"
						value={values.actualWeight}
						readOnly={isReadonly}
						onChange={(event) =>
							onUpdateField("actualWeight", event.target.value)
						}
						className={FieldClassName}
					/>
				</FieldShell>
				<FieldShell controlId="billing-invoice-no-packages" label="No. Pkgs.">
					<input
						id="billing-invoice-no-packages"
						value={values.noPackages}
						readOnly={isReadonly}
						onChange={(event) => onUpdateField("noPackages", event.target.value)}
						className={FieldClassName}
					/>
				</FieldShell>
				<FieldShell
					controlId="billing-invoice-destination-port"
					label="Destination Port"
				>
					<input
						id="billing-invoice-destination-port"
						value={values.destinationPort}
						readOnly={isReadonly}
						onChange={(event) =>
							onUpdateField("destinationPort", event.target.value)
						}
						className={FieldClassName}
					/>
				</FieldShell>
			</div>
		</div>
	);
}

