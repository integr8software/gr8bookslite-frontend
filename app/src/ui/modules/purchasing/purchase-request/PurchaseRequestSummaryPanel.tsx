import type { ChangeEvent } from "react";
import { ImageIcon } from "lucide-react";
import { getFormSignatoryRowsByLabel } from "@/app/src/data/modules/maintenance/form-signatory/FormSignatoryData";
import { ReadFileAsDataUrl } from "@/app/src/services/shared/media/ImageCropper";
import type {
	PurchaseRequestFormErrors,
	PurchaseRequestFormValues,
} from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";
import {
	PurchaseRequestFieldClassName,
	PurchaseRequestFormField,
} from "@/app/src/ui/modules/purchasing/purchase-request/PurchaseRequestFormControls";

type PurchaseRequestSummaryPanelProps = {
	errors: PurchaseRequestFormErrors;
	isReadonly: boolean;
	updateField: <TKey extends keyof PurchaseRequestFormValues>(
		field: TKey,
		value: PurchaseRequestFormValues[TKey],
	) => void;
	values: PurchaseRequestFormValues;
};

export function PurchaseRequestSummaryPanel({
	errors,
	isReadonly,
	updateField,
	values,
}: PurchaseRequestSummaryPanelProps) {
	const usesFormSignatory =
		values.status === "Approved" || values.status === "Closed";
	const preparedByOptions = getFormSignatoryRowsByLabel({
		branch: "head-office",
		label: "Prepared By",
		module: "purchase-request",
	});
	const approvedByOptions = getFormSignatoryRowsByLabel({
		branch: "head-office",
		label: "Approved By",
		module: "purchase-request",
	});

	return (
		<div className="grid min-w-0 gap-5">
			<div className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
				<h2 className="text-sm font-semibold text-darknavy">
					Print Header
				</h2>
				<div className="mt-4 grid gap-4 md:grid-cols-2">
					<PurchaseRequestFormField
						label="Logo Image"
						required
						error={errors.logoImageUrl ?? errors.logoFileName}
					>
						<div className="flex h-11 min-w-0 overflow-hidden rounded-lg border border-darknavy/10 bg-white">
							<label
								aria-label="Choose logo image"
								className={`inline-flex h-full w-11 shrink-0 items-center justify-center border-r border-darknavy/10 text-darknavy/55 transition ${
									isReadonly
										? "cursor-not-allowed bg-offwhite/65 opacity-60"
										: "cursor-pointer bg-offwhite/55 hover:bg-darknavy/10 hover:text-darknavy"
								}`}
							>
								<ImageIcon
									className="h-4 w-4"
									aria-hidden="true"
								/>
								<input
									type="file"
									accept="image/jpeg,image/png,image/webp"
									disabled={isReadonly}
									onChange={(event) =>
										void handleLogoImageChange(
											event,
											updateField,
										)
									}
									className="sr-only"
								/>
							</label>
							<span className="flex min-w-0 flex-1 items-center truncate px-3 text-sm text-darknavy/70">
								{values.logoFileName || "No file chosen"}
							</span>
							{values.logoImageUrl && !isReadonly ? (
								<button
									type="button"
									onClick={() => {
										updateField("logoFileName", "");
										updateField("logoImageUrl", "");
									}}
									className="shrink-0 border-l border-darknavy/10 px-3 text-sm font-semibold text-coralpink transition hover:bg-coralpink/8 hover:text-coralpink/80"
								>
									Remove
								</button>
							) : null}
						</div>
					</PurchaseRequestFormField>
					<PurchaseRequestFormField
						label="Company Name"
						required
						error={errors.companyName}
					>
						<input
							value={values.companyName}
							disabled={isReadonly}
							onChange={(event) =>
								updateField("companyName", event.target.value)
							}
							className={PurchaseRequestFieldClassName}
						/>
					</PurchaseRequestFormField>
					<PurchaseRequestFormField
						label="VAT Reg TIN"
						required
						error={errors.vatRegTin}
					>
						<input
							value={values.vatRegTin}
							disabled={isReadonly}
							onChange={(event) =>
								updateField("vatRegTin", event.target.value)
							}
							className={PurchaseRequestFieldClassName}
						/>
					</PurchaseRequestFormField>
					<PurchaseRequestFormField
						label="Telephone No."
						required
						error={errors.telephoneNo}
					>
						<input
							value={values.telephoneNo}
							disabled={isReadonly}
							onChange={(event) =>
								updateField("telephoneNo", event.target.value)
							}
							className={PurchaseRequestFieldClassName}
						/>
					</PurchaseRequestFormField>
					<PurchaseRequestFormField
						label="Address"
						required
						className="md:col-span-2"
						error={errors.companyAddress}
					>
						<textarea
							value={values.companyAddress}
							disabled={isReadonly}
							onChange={(event) =>
								updateField("companyAddress", event.target.value)
							}
							className={`${PurchaseRequestFieldClassName} min-h-20 py-3`}
						/>
					</PurchaseRequestFormField>
				</div>
			</div>

			<div className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
				<div>
					<h2 className="text-sm font-semibold text-darknavy">
						Approval Fields
					</h2>
					{usesFormSignatory ? (
						<p className="mt-1 text-sm text-darknavy/55">
							Approved purchase requests use the configured Form Signatory
							records for prepared and approved signatures.
						</p>
					) : null}
				</div>
				<div className="mt-4 grid gap-4 md:grid-cols-2">
					<PurchaseRequestFormField
						label="Prepared by"
						required
						error={errors.preparedBy}
					>
						{usesFormSignatory ? (
							<div className="grid gap-2">
								<FormSignatorySelect
									value={values.preparedBy}
									options={preparedByOptions}
									disabled={isReadonly}
									onChange={(option) => {
										updateField("preparedBy", option.name);
										updateField(
											"preparedBySignatureFileName",
											option.signatureName,
										);
										updateField(
											"preparedBySignatureImageUrl",
											option.signaturePreview,
										);
									}}
								/>
								<SelectedSignaturePreview
									imageUrl={values.preparedBySignatureImageUrl}
									name={values.preparedBy}
								/>
							</div>
						) : (
							<input
								value={values.preparedBy}
								disabled={isReadonly}
								onChange={(event) =>
									updateField("preparedBy", event.target.value)
								}
								className={PurchaseRequestFieldClassName}
							/>
						)}
					</PurchaseRequestFormField>
					{usesFormSignatory ? null : (
						<PurchaseRequestFormField
							label="Prepared Signature"
							required
							error={
								errors.preparedBySignatureImageUrl ??
								errors.preparedBySignatureFileName
							}
						>
							<SignatureAttachmentField
								fileName={values.preparedBySignatureFileName}
								imageUrl={values.preparedBySignatureImageUrl}
								isReadonly={isReadonly}
								label="Choose prepared by signature"
								onChange={(event) =>
									void handleImageAttachmentChange(
										event,
										updateField,
										"preparedBySignatureFileName",
										"preparedBySignatureImageUrl",
									)
								}
								onRemove={() => {
									updateField("preparedBySignatureFileName", "");
									updateField("preparedBySignatureImageUrl", "");
								}}
							/>
						</PurchaseRequestFormField>
					)}
					<PurchaseRequestFormField
						label="Approved by"
						required
						error={errors.approvedBy}
					>
						{usesFormSignatory ? (
							<div className="grid gap-2">
								<FormSignatorySelect
									value={values.approvedBy}
									options={approvedByOptions}
									disabled={isReadonly}
									onChange={(option) => {
										updateField("approvedBy", option.name);
										updateField(
											"approvedBySignatureFileName",
											option.signatureName,
										);
										updateField(
											"approvedBySignatureImageUrl",
											option.signaturePreview,
										);
									}}
								/>
								<SelectedSignaturePreview
									imageUrl={values.approvedBySignatureImageUrl}
									name={values.approvedBy}
								/>
							</div>
						) : (
							<input
								value={values.approvedBy}
								disabled={isReadonly}
								onChange={(event) =>
									updateField("approvedBy", event.target.value)
								}
								className={PurchaseRequestFieldClassName}
							/>
						)}
					</PurchaseRequestFormField>
					{usesFormSignatory ? null : (
						<PurchaseRequestFormField
							label="Approved Signature"
							required
							error={
								errors.approvedBySignatureImageUrl ??
								errors.approvedBySignatureFileName
							}
						>
							<SignatureAttachmentField
								fileName={values.approvedBySignatureFileName}
								imageUrl={values.approvedBySignatureImageUrl}
								isReadonly={isReadonly}
								label="Choose approved by signature"
								onChange={(event) =>
									void handleImageAttachmentChange(
										event,
										updateField,
										"approvedBySignatureFileName",
										"approvedBySignatureImageUrl",
									)
								}
								onRemove={() => {
									updateField("approvedBySignatureFileName", "");
									updateField("approvedBySignatureImageUrl", "");
								}}
							/>
						</PurchaseRequestFormField>
					)}
					<PurchaseRequestFormField
						label="FOR"
						required
						className="md:col-span-2"
						error={errors.forDepartment}
					>
						<textarea
							placeholder="Text shown in the FOR box on the print preview"
							value={values.forDepartment}
							disabled={isReadonly}
							onChange={(event) =>
								updateField("forDepartment", event.target.value)
							}
							className={`${PurchaseRequestFieldClassName} min-h-20 py-3`}
						/>
					</PurchaseRequestFormField>
				</div>
			</div>
		</div>
	);
}

function SelectedSignaturePreview({
	imageUrl,
	name,
}: {
	imageUrl: string;
	name: string;
}) {
	return (
		<div className="flex h-16 items-center justify-center rounded-lg border border-dashed border-darknavy/14 bg-offwhite">
			{imageUrl ? (
				// Form signatory signatures can be generated data URLs.
				// eslint-disable-next-line @next/next/no-img-element
				<img
					src={imageUrl}
					alt={`${name || "Selected"} signature`}
					className="max-h-12 max-w-full object-contain"
				/>
			) : (
				<span className="text-xs font-semibold text-darknavy/40">
					No signature image
				</span>
			)}
		</div>
	);
}

function FormSignatorySelect({
	disabled,
	options,
	value,
	onChange,
}: {
	disabled: boolean;
	options: ReturnType<typeof getFormSignatoryRowsByLabel>;
	value: string;
	onChange: (option: ReturnType<typeof getFormSignatoryRowsByLabel>[number]) => void;
}) {
	const selectedOption = options.find((option) => option.name === value);
	const selectedValue = selectedOption
		? getFormSignatoryOptionValue(selectedOption)
		: "";

	return (
		<select
			value={selectedValue}
			disabled={disabled || options.length === 0}
			onChange={(event) => {
				const option = options.find(
					(currentOption) =>
						getFormSignatoryOptionValue(currentOption) ===
						event.target.value,
				);

				if (option) {
					onChange(option);
				}
			}}
			className={PurchaseRequestFieldClassName}
		>
			<option value="">
				{options.length > 0 ? "Select signatory" : "No signatories found"}
			</option>
			{options.map((option) => (
				<option
					key={getFormSignatoryOptionValue(option)}
					value={getFormSignatoryOptionValue(option)}
				>
					{option.name}
					{option.position ? ` - ${option.position}` : ""}
				</option>
			))}
		</select>
	);
}

function getFormSignatoryOptionValue(
	option: ReturnType<typeof getFormSignatoryRowsByLabel>[number],
) {
	return `${option.setupId}:${option.id}:${option.name}`;
}

function SignatureAttachmentField({
	fileName,
	imageUrl,
	isReadonly,
	label,
	onChange,
	onRemove,
}: {
	fileName: string;
	imageUrl: string;
	isReadonly: boolean;
	label: string;
	onChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onRemove: () => void;
}) {
	return (
		<div className="flex h-11 min-w-0 overflow-hidden rounded-lg border border-darknavy/10 bg-white">
			<label
				aria-label={label}
				className={`inline-flex h-full w-11 shrink-0 items-center justify-center border-r border-darknavy/10 text-darknavy/55 transition ${
					isReadonly
						? "cursor-not-allowed bg-offwhite/65 opacity-60"
						: "cursor-pointer bg-offwhite/55 hover:bg-darknavy/10 hover:text-darknavy"
				}`}
			>
				<ImageIcon className="h-4 w-4" aria-hidden="true" />
				<input
					type="file"
					accept="image/jpeg,image/png,image/webp"
					disabled={isReadonly}
					onChange={onChange}
					className="sr-only"
				/>
			</label>
			<span className="flex min-w-0 flex-1 items-center truncate px-3 text-sm text-darknavy/70">
				{fileName || "No file chosen"}
			</span>
			{imageUrl && !isReadonly ? (
				<button
					type="button"
					onClick={onRemove}
					className="shrink-0 border-l border-darknavy/10 px-3 text-sm font-semibold text-coralpink transition hover:bg-coralpink/8 hover:text-coralpink/80"
				>
					Remove
				</button>
			) : null}
		</div>
	);
}

async function handleLogoImageChange(
	event: ChangeEvent<HTMLInputElement>,
	updateField: <TKey extends keyof PurchaseRequestFormValues>(
		field: TKey,
		value: PurchaseRequestFormValues[TKey],
	) => void,
) {
	const file = event.target.files?.[0];
	event.target.value = "";

	if (!file || !file.type.startsWith("image/")) {
		return;
	}

	const dataUrl = await ReadFileAsDataUrl(file);
	updateField("logoFileName", file.name);
	updateField("logoImageUrl", dataUrl);
}

async function handleImageAttachmentChange<
	TFileNameKey extends keyof PurchaseRequestFormValues,
	TImageUrlKey extends keyof PurchaseRequestFormValues,
>(
	event: ChangeEvent<HTMLInputElement>,
	updateField: <TKey extends keyof PurchaseRequestFormValues>(
		field: TKey,
		value: PurchaseRequestFormValues[TKey],
	) => void,
	fileNameField: TFileNameKey,
	imageUrlField: TImageUrlKey,
) {
	const file = event.target.files?.[0];
	event.target.value = "";

	if (!file || !file.type.startsWith("image/")) {
		return;
	}

	const dataUrl = await ReadFileAsDataUrl(file);
	updateField(fileNameField, file.name as PurchaseRequestFormValues[TFileNameKey]);
	updateField(imageUrlField, dataUrl as PurchaseRequestFormValues[TImageUrlKey]);
}
