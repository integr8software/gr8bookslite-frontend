import { PurchaseRequestFieldClassName } from "@/app/src/ui/modules/purchasing/purchase-request/PurchaseRequestFormControls";
import type { PurchaseRequestFormSignatoryOption } from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";

export function PurchaseRequestFormSignatorySelect({
	disabled,
	isLoading = false,
	options,
	value,
	onClear,
	onChange,
}: {
	disabled: boolean;
	isLoading?: boolean;
	options: PurchaseRequestFormSignatoryOption[];
	value: string;
	onClear: () => void;
	onChange: (option: PurchaseRequestFormSignatoryOption) => void;
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
				if (!event.target.value) {
					onClear();
					return;
				}

				const option = options.find(
					(currentOption) =>
						getFormSignatoryOptionValue(currentOption) ===
						event.target.value,
				);

				if (option) {
					if (isSignatureExpired(option.signatureValidUntil)) {
						return;
					}

					onChange(option);
				}
			}}
			className={PurchaseRequestFieldClassName}
		>
			<option value="">
				{isLoading
					? "Loading signatories..."
					: options.length > 0
						? "Select signatory"
						: "No signatories found"}
			</option>
			{options.map((option) => (
				<option
					key={getFormSignatoryOptionValue(option)}
					value={getFormSignatoryOptionValue(option)}
					disabled={isSignatureExpired(option.signatureValidUntil)}
				>
					{option.name}
					{option.position ? ` - ${option.position}` : ""}
					{isSignatureExpired(option.signatureValidUntil)
						? " (Expired)"
						: ""}
				</option>
			))}
		</select>
	);
}

export function SelectedPurchaseRequestSignaturePreview({
	imageUrl,
	name,
}: {
	imageUrl: string;
	name: string;
}) {
	return (
		<div className="flex h-16 items-center justify-center rounded-lg border border-dashed border-darknavy/14 bg-offwhite">
			{imageUrl ? (
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

function getFormSignatoryOptionValue(
	option: PurchaseRequestFormSignatoryOption,
) {
	return `${option.setupId}:${option.id}:${option.name}`;
}

function isSignatureExpired(value: string) {
	if (!value) {
		return false;
	}

	const validUntil = new Date(`${value.slice(0, 10)}T23:59:59`);

	return !Number.isNaN(validUntil.getTime()) && validUntil < new Date();
}
