import type { ChangeEvent } from "react";
import { ImageIcon } from "lucide-react";
import { ReadFileAsDataUrl } from "@/app/src/services/shared/ImageCropper";
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
				<h2 className="text-sm font-semibold text-darknavy">
					Approval Fields
				</h2>
				<div className="mt-4 grid gap-4 md:grid-cols-2">
					<PurchaseRequestFormField
						label="Prepared by"
						required
						error={errors.preparedBy}
					>
						<input
							value={values.preparedBy}
							disabled={isReadonly}
							onChange={(event) =>
								updateField("preparedBy", event.target.value)
							}
							className={PurchaseRequestFieldClassName}
						/>
					</PurchaseRequestFormField>
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
					<PurchaseRequestFormField
						label="Approved by"
						required
						error={errors.approvedBy}
					>
						<input
							value={values.approvedBy}
							disabled={isReadonly}
							onChange={(event) =>
								updateField("approvedBy", event.target.value)
							}
							className={PurchaseRequestFieldClassName}
						/>
					</PurchaseRequestFormField>
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
