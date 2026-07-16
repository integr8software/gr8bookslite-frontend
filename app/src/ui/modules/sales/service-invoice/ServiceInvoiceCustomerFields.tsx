import {
	ServiceInvoiceCurrencyOptions,
	ServiceInvoiceDefaultAccountOptions,
	ServiceInvoiceDescriptionOptions,
	ServiceInvoicePartyOptions,
	ServiceInvoiceTeamOptions,
	ServiceInvoiceTermOptions,
} from "@/app/src/data/modules/sales/service-invoice/ServiceInvoiceData";
import type { ServiceInvoiceFormValues } from "@/app/src/types/modules/sales/service-invoice/ServiceInvoiceTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";
import {
	AttachedDropdown,
	FieldClassName,
	FieldShell,
	SelectField,
	type ServiceInvoiceFieldUpdater,
} from "@/app/src/ui/modules/sales/service-invoice/ServiceInvoiceFieldControls";

type ServiceInvoiceCustomerFieldsProps = {
	isReadonly: boolean;
	onUpdateField: ServiceInvoiceFieldUpdater<ServiceInvoiceFormValues>;
	values: ServiceInvoiceFormValues;
};

export function ServiceInvoiceCustomerFields({
	isReadonly,
	onUpdateField,
	values,
}: ServiceInvoiceCustomerFieldsProps) {
	return (
		<div className="grid min-w-0 content-start gap-x-8 gap-y-3 lg:grid-cols-2">
			<div className="grid min-w-0 content-start gap-3">
				<FieldShell controlId="service-invoice-code" label="Code">
					<input
						id="service-invoice-code"
						value={values.code}
						readOnly={isReadonly}
						onChange={(event) => onUpdateField("code", event.target.value)}
						className={FieldClassName}
					/>
				</FieldShell>
				<FieldShell controlId="service-invoice-currency" label="Currency">
					<div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_9rem]">
						<AppAdvancedDropdown
							id="service-invoice-currency"
							value={values.currency}
							readOnly={isReadonly}
							isClearable={false}
							options={ServiceInvoiceCurrencyOptions}
							placeholder="Currency"
							searchPlaceholder="Search currency"
							onChange={(value) => onUpdateField("currency", String(value))}
						/>
						<div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2">
							<label
								htmlFor="service-invoice-exchange-rate"
								className="text-sm font-semibold text-darknavy"
							>
								FX Rate:
							</label>
							<MoneyNumberField
								id="service-invoice-exchange-rate"
								value={values.exchangeRate}
								readOnly={isReadonly}
								onValueChange={(value) => onUpdateField("exchangeRate", value)}
								className={`${FieldClassName} text-right`}
							/>
						</div>
					</div>
				</FieldShell>
				<FieldShell controlId="service-invoice-remarks" label="Remarks">
					<AppLimitedTextarea
						id="service-invoice-remarks"
						value={values.remarks}
						readOnly={isReadonly}
						onChange={(event) => onUpdateField("remarks", event.target.value)}
						className={`${FieldClassName} min-h-28 py-3`}
						counterMode="remaining"
						maxLength={250}
					/>
				</FieldShell>
				<FieldShell controlId="service-invoice-due-date" label="Due Date">
					<input
						id="service-invoice-due-date"
						type="date"
						value={values.dueDate}
						readOnly={isReadonly}
						onChange={(event) => onUpdateField("dueDate", event.target.value)}
						className={FieldClassName}
					/>
				</FieldShell>
				<FieldShell
					controlId="service-invoice-default-account"
					label="Default Account"
				>
					<AttachedDropdown
						id="service-invoice-default-account"
						value={values.defaultAccount}
						readOnly={isReadonly}
						options={ServiceInvoiceDefaultAccountOptions}
						placeholder="Default account"
						searchPlaceholder="Search account"
						onAdd={() => undefined}
						onChange={(value) => onUpdateField("defaultAccount", value)}
					/>
				</FieldShell>
				<FieldShell controlId="service-invoice-start-date" label="Start Date">
					<input
						id="service-invoice-start-date"
						type="date"
						value={values.startDate}
						readOnly={isReadonly}
						onChange={(event) => onUpdateField("startDate", event.target.value)}
						className={FieldClassName}
					/>
				</FieldShell>
			</div>
			<div className="grid min-w-0 content-start gap-3">
				<FieldShell controlId="service-invoice-name" label="Name" isRequired>
					<AttachedDropdown
						id="service-invoice-name"
						value={values.name}
						readOnly={isReadonly}
						options={ServiceInvoicePartyOptions}
						placeholder=""
						searchPlaceholder="Search customer"
						onAdd={() => undefined}
						onChange={(value) => onUpdateField("name", value)}
					/>
				</FieldShell>
				<FieldShell
					controlId="service-invoice-contact-person"
					label="Contact Person"
				>
					<input
						id="service-invoice-contact-person"
						value={values.contactPerson}
						readOnly={isReadonly}
						onChange={(event) =>
							onUpdateField("contactPerson", event.target.value)
						}
						className={FieldClassName}
					/>
				</FieldShell>
				<FieldShell controlId="service-invoice-terms" label="Terms">
					<SelectField
						value={values.terms}
						readOnly={isReadonly}
						options={ServiceInvoiceTermOptions}
						placeholder="--Select Terms--"
						onChange={(value) => onUpdateField("terms", value)}
					/>
				</FieldShell>
				<FieldShell controlId="service-invoice-description" label="Description">
					<AttachedDropdown
						id="service-invoice-description"
						value={values.description}
						readOnly={isReadonly}
						options={ServiceInvoiceDescriptionOptions}
						placeholder="--Select Description--"
						searchPlaceholder="Search description"
						onAdd={() => undefined}
						onChange={(value) => onUpdateField("description", value)}
					/>
				</FieldShell>
				<FieldShell
					controlId="service-invoice-team-assigned"
					label="Team Assigned"
				>
					<SelectField
						value={values.teamAssigned}
						readOnly={isReadonly}
						options={ServiceInvoiceTeamOptions}
						placeholder="--Select Team--"
						onChange={(value) => onUpdateField("teamAssigned", value)}
					/>
				</FieldShell>
				<FieldShell
					controlId="service-invoice-expiration-date"
					label="Date of Expiration"
				>
					<input
						id="service-invoice-expiration-date"
						type="date"
						value={values.expirationDate}
						readOnly={isReadonly}
						onChange={(event) =>
							onUpdateField("expirationDate", event.target.value)
						}
						className={FieldClassName}
					/>
				</FieldShell>
			</div>
		</div>
	);
}
