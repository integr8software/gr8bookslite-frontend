import type { ChangeEventHandler, ReactNode } from "react";
import { Search, X } from "lucide-react";
import {
	PartyClassificationOptions,
	VatRegistrationTypeOptions,
} from "@/app/src/constants/modules/party-management/PartyManagementConstants";
import { PartyAtcCodeSource } from "@/app/src/data/modules/maintenance/party-management/party-management/PartyManagementData";
import type {
	PartyAtcCodeOption,
	PartyInformationFormErrors,
	PartyInformationFormValues,
	PartyType,
} from "@/app/src/types/modules/party-management/PartyManagementTypes";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function PartyInformationDetailsFields({
	atcOptions,
	atcQuery,
	errors,
	isClassificationSelected,
	isReadonly,
	partyTypeOptions,
	partyTypeQuery,
	selectedAtcOption,
	values,
	onAddressInputChange,
	onAtcQueryChange,
	onInputChange,
	onPartyTypeQueryChange,
	onRemovePartyType,
	onSelectAtcCode,
	onTogglePartyType,
}: {
	atcOptions: PartyAtcCodeOption[];
	atcQuery: string;
	errors: PartyInformationFormErrors;
	isClassificationSelected: boolean;
	isReadonly: boolean;
	partyTypeOptions: PartyType[];
	partyTypeQuery: string;
	selectedAtcOption?: PartyAtcCodeOption;
	values: PartyInformationFormValues;
	onAddressInputChange: ChangeEventHandler<HTMLInputElement>;
	onAtcQueryChange: (value: string) => void;
	onInputChange: ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
	onPartyTypeQueryChange: (value: string) => void;
	onRemovePartyType: (type: PartyType) => void;
	onSelectAtcCode: (code: string) => void;
	onTogglePartyType: (type: PartyType) => void;
}) {
	const isDetailsDisabled = isReadonly || !isClassificationSelected;

	return (
		<div className="grid gap-5">
			<section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
				<div className="grid gap-4 lg:grid-cols-3">
					<Field label="Party Code No">
						<input
							name="partyCodeNo"
							value={values.partyCodeNo}
							readOnly
							className={fieldClassName}
						/>
					</Field>
					<Field
						label="Party Classification"
						error={errors.classification}
						required
					>
						<select
							name="classification"
							value={values.classification}
							onChange={onInputChange}
							disabled={isReadonly}
							className={fieldClassName}
						>
							<option value="">Select classification</option>
							{PartyClassificationOptions.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</Field>
					<Field label="Party Type" error={errors.partyTypes} required>
						<PartyTypeMultiSelect
							disabled={isDetailsDisabled}
							options={partyTypeOptions}
							query={partyTypeQuery}
							selected={values.partyTypes}
							onQueryChange={onPartyTypeQueryChange}
							onRemove={onRemovePartyType}
							onToggle={onTogglePartyType}
						/>
					</Field>
				</div>
			</section>

			<section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
				<SectionHeading
					description="Name fields change based on the selected party classification."
					title="Identity"
				/>
				{values.classification === "Non-Individual" ? (
					<div className="mt-4 grid gap-4 lg:grid-cols-2">
						<Field label="Party Name" error={errors.partyName} required>
							<input
								name="partyName"
								value={values.partyName}
								onChange={onInputChange}
								readOnly={isReadonly}
								disabled={isDetailsDisabled}
								className={fieldClassName}
								placeholder="Registered business name"
							/>
						</Field>
					</div>
				) : null}
				{values.classification === "Individual" ? (
					<div className="mt-4 grid gap-4 lg:grid-cols-4">
						<Field label="First Name" error={errors.firstName} required>
							<input
								name="firstName"
								value={values.firstName}
								onChange={onInputChange}
								readOnly={isReadonly}
								disabled={isDetailsDisabled}
								className={fieldClassName}
							/>
						</Field>
						<Field label="Middle Name">
							<input
								name="middleName"
								value={values.middleName}
								onChange={onInputChange}
								readOnly={isReadonly}
								disabled={isDetailsDisabled}
								className={fieldClassName}
							/>
						</Field>
						<Field label="Last Name" error={errors.lastName} required>
							<input
								name="lastName"
								value={values.lastName}
								onChange={onInputChange}
								readOnly={isReadonly}
								disabled={isDetailsDisabled}
								className={fieldClassName}
							/>
						</Field>
						<Field label="Suffix Name">
							<input
								name="suffixName"
								value={values.suffixName}
								onChange={onInputChange}
								readOnly={isReadonly}
								disabled={isDetailsDisabled}
								className={fieldClassName}
							/>
						</Field>
					</div>
				) : null}
				{!values.classification ? (
					<div className="mt-4 rounded-md border border-dashed border-darknavy/15 bg-offwhite/50 p-4 text-sm text-darknavy/55">
						Select a party classification to continue.
					</div>
				) : null}
			</section>

			<section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
				<SectionHeading
					description="Complete registered address details for reporting and documents."
					title="Address"
				/>
				<div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					<AddressInput
						disabled={isDetailsDisabled}
						label="Region"
						name="region"
						value={values.address.region}
						onChange={onAddressInputChange}
					/>
					<AddressInput
						disabled={isDetailsDisabled}
						label="Province"
						name="province"
						value={values.address.province}
						onChange={onAddressInputChange}
					/>
					<AddressInput
						disabled={isDetailsDisabled}
						label="City/Municipality"
						name="cityMunicipality"
						value={values.address.cityMunicipality}
						onChange={onAddressInputChange}
					/>
					<AddressInput
						disabled={isDetailsDisabled}
						label="Barangay"
						name="barangay"
						value={values.address.barangay}
						onChange={onAddressInputChange}
					/>
					<AddressInput
						disabled={isDetailsDisabled}
						label="Lot/Unit"
						name="lotUnit"
						value={values.address.lotUnit}
						onChange={onAddressInputChange}
					/>
					<AddressInput
						disabled={isDetailsDisabled}
						label="Block/Building/Street"
						name="blockBuildingStreet"
						value={values.address.blockBuildingStreet}
						onChange={onAddressInputChange}
					/>
					<AddressInput
						disabled={isDetailsDisabled}
						label="Subdivision"
						name="subdivision"
						value={values.address.subdivision}
						onChange={onAddressInputChange}
					/>
					<AddressInput
						disabled={isDetailsDisabled}
						label="Zipcode"
						name="zipcode"
						value={values.address.zipcode}
						onChange={onAddressInputChange}
					/>
				</div>
			</section>

			<section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
				<SectionHeading
					description="Tax and contact details used in BIR forms and transaction documents."
					title="Tax & Contact"
				/>
				<div className="mt-4 grid gap-4 lg:grid-cols-2">
					<Field label="Party TIN">
						<input
							name="tin"
							value={values.tin}
							onChange={onInputChange}
							readOnly={isReadonly}
							disabled={isDetailsDisabled}
							className={fieldClassName}
							placeholder="000-000-000-000"
						/>
					</Field>
					<Field label="VAT Registration Type">
						<select
							name="vatRegistrationType"
							value={values.vatRegistrationType}
							onChange={onInputChange}
							disabled={isDetailsDisabled}
							className={fieldClassName}
						>
							<option value="">Select VAT type</option>
							{VatRegistrationTypeOptions.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</Field>
					<Field label="Party ATC Code" error={errors.atcCode} required>
						<AtcCodeCombobox
							disabled={isDetailsDisabled}
							options={atcOptions}
							query={atcQuery}
							selected={selectedAtcOption}
							value={values.atcCode}
							onQueryChange={onAtcQueryChange}
							onSelect={onSelectAtcCode}
						/>
					</Field>
					<Field label="Email Address" error={errors.email}>
						<input
							name="email"
							type="email"
							value={values.email}
							onChange={onInputChange}
							readOnly={isReadonly}
							disabled={isDetailsDisabled}
							className={fieldClassName}
							placeholder="name@example.com"
						/>
					</Field>
					<Field label="Contact No">
						<input
							name="contactNo"
							value={values.contactNo}
							onChange={onInputChange}
							readOnly={isReadonly}
							disabled={isDetailsDisabled}
							className={fieldClassName}
							placeholder="+63"
						/>
					</Field>
				</div>
			</section>
		</div>
	);
}

function PartyTypeMultiSelect({
	disabled,
	options,
	query,
	selected,
	onQueryChange,
	onRemove,
	onToggle,
}: {
	disabled: boolean;
	options: PartyType[];
	query: string;
	selected: PartyType[];
	onQueryChange: (value: string) => void;
	onRemove: (type: PartyType) => void;
	onToggle: (type: PartyType) => void;
}) {
	return (
		<div className="rounded-lg border border-darknavy/10 bg-white p-2">
			<div className="flex min-h-10 flex-wrap gap-1.5">
				{selected.length > 0 ? (
					selected.map((type) => (
						<span
							key={type}
							className="inline-flex items-center gap-1 rounded-md bg-skyblue/15 px-2.5 py-1 text-xs font-semibold text-darknavy"
						>
							{type}
							<button
								type="button"
								disabled={disabled}
								onClick={() => onRemove(type)}
								className="text-darknavy/55 hover:text-darknavy disabled:pointer-events-none"
								aria-label={`Remove ${type}`}
							>
								<X className="h-3 w-3" aria-hidden="true" />
							</button>
						</span>
					))
				) : (
					<span className="px-2 py-1.5 text-sm text-darknavy/38">
						Select party type
					</span>
				)}
			</div>
			<div className="mt-2 flex items-center gap-2 rounded-md border border-darknavy/10 px-2">
				<Search className="h-4 w-4 text-darknavy/35" aria-hidden="true" />
				<input
					value={query}
					onChange={(event) => onQueryChange(event.target.value)}
					disabled={disabled}
					className="h-9 min-w-0 flex-1 bg-transparent text-sm text-darknavy outline-none disabled:cursor-not-allowed"
					placeholder="Search party types"
				/>
			</div>
			<div className="mt-2 grid gap-1">
				{options.map((option) => (
					<label
						key={option}
						className={joinClasses(
							"flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-darknavy transition",
							disabled ? "opacity-50" : "hover:bg-skyblue/10",
						)}
					>
						<input
							type="checkbox"
							checked={selected.includes(option)}
							disabled={disabled}
							onChange={() => onToggle(option)}
							className="h-4 w-4 accent-skyblue"
						/>
						{option}
					</label>
				))}
			</div>
		</div>
	);
}

function AtcCodeCombobox({
	disabled,
	options,
	query,
	selected,
	value,
	onQueryChange,
	onSelect,
}: {
	disabled: boolean;
	options: PartyAtcCodeOption[];
	query: string;
	selected?: PartyAtcCodeOption;
	value: string;
	onQueryChange: (value: string) => void;
	onSelect: (code: string) => void;
}) {
	return (
		<div className="rounded-lg border border-darknavy/10 bg-white p-2">
			<div className="rounded-md bg-offwhite/55 px-3 py-2 text-sm text-darknavy">
				{selected ? (
					<>
						<span className="font-semibold">{selected.code}</span>
						<span className="text-darknavy/55"> - {selected.label}</span>
					</>
				) : value ? (
					<span className="text-coralpink">Invalid ATC code selected</span>
				) : (
					<span className="text-darknavy/38">Select BIR ATC code</span>
				)}
			</div>
			<div className="mt-2 flex items-center gap-2 rounded-md border border-darknavy/10 px-2">
				<Search className="h-4 w-4 text-darknavy/35" aria-hidden="true" />
				<input
					value={query}
					onChange={(event) => onQueryChange(event.target.value)}
					disabled={disabled}
					className="h-9 min-w-0 flex-1 bg-transparent text-sm text-darknavy outline-none disabled:cursor-not-allowed"
					placeholder="Search ATC code or description"
				/>
			</div>
			<div className="mt-2 max-h-56 overflow-y-auto">
				{options.map((option) => (
					<button
						key={option.code}
						type="button"
						disabled={disabled}
						onClick={() => onSelect(option.code)}
						className={joinClasses(
							"grid w-full gap-0.5 rounded-md px-2 py-2 text-left transition",
							option.code === value
								? "bg-skyblue/15 text-darknavy"
								: "text-darknavy hover:bg-skyblue/10",
							disabled && "cursor-not-allowed opacity-50",
						)}
					>
						<span className="text-sm font-semibold">{option.code}</span>
						<span className="text-xs text-darknavy/58">{option.label}</span>
					</button>
				))}
			</div>
			<p className="mt-2 text-[11px] leading-4 text-darknavy/45">
				Source: {PartyAtcCodeSource.label}
			</p>
		</div>
	);
}

function AddressInput({
	disabled,
	label,
	name,
	value,
	onChange,
}: {
	disabled: boolean;
	label: string;
	name: string;
	value: string;
	onChange: ChangeEventHandler<HTMLInputElement>;
}) {
	return (
		<Field label={label}>
			<input
				name={name}
				value={value}
				onChange={onChange}
				disabled={disabled}
				className={fieldClassName}
			/>
		</Field>
	);
}

function SectionHeading({
	description,
	title,
}: {
	description: string;
	title: string;
}) {
	return (
		<div>
			<h2 className="text-base font-semibold text-darknavy">{title}</h2>
			<p className="mt-1 text-sm text-darknavy/55">{description}</p>
		</div>
	);
}

function Field({
	children,
	error,
	label,
	required = false,
}: {
	children: ReactNode;
	error?: string;
	label: string;
	required?: boolean;
}) {
	return (
		<div className="grid gap-2">
			<span className="text-xs font-semibold uppercase tracking-wide text-darknavy/55">
				{label}
				{required ? <span className="text-coralpink"> *</span> : null}
			</span>
			{children}
			{error ? (
				<span className="text-xs font-medium text-coralpink">{error}</span>
			) : null}
		</div>
	);
}

const fieldClassName =
	"h-11 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/60 focus:ring-4 focus:ring-skyblue/10 disabled:cursor-not-allowed disabled:bg-offwhite/70 disabled:text-darknavy/45";
