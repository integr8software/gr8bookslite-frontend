import {
	forwardRef,
	type ClipboardEventHandler,
	type KeyboardEventHandler,
} from "react";
import { TextField, type TextFieldProps } from "@/app/src/ui/shared/FormField/TextField";

export type NumberFieldProps = Omit<TextFieldProps, "type"> & {
	allowDecimal?: boolean;
	allowNegative?: boolean;
};

const blockedNumberKeys = new Set(["e", "E", "+"]);

export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(
	function NumberField(
		{
			allowDecimal = false,
			allowNegative = false,
			onKeyDown,
			onPaste,
			onWheel,
			...props
		},
		ref,
	) {
		const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
			const blockedKeys = getBlockedNumberKeys({ allowDecimal, allowNegative });

			if (blockedKeys.has(event.key)) {
				event.preventDefault();
				return;
			}

			onKeyDown?.(event);
		};

		const handlePaste: ClipboardEventHandler<HTMLInputElement> = (event) => {
			const pastedText = event.clipboardData.getData("text").trim();
			const pattern = getNumberPastePattern({ allowDecimal, allowNegative });

			if (pastedText && !pattern.test(pastedText)) {
				event.preventDefault();
				return;
			}

			onPaste?.(event);
		};

		return (
			<TextField
				ref={ref}
				type="number"
				onKeyDown={handleKeyDown}
				onPaste={handlePaste}
				onWheel={(event) => {
					event.currentTarget.blur();
					onWheel?.(event);
				}}
				{...props}
			/>
		);
	},
);

function getBlockedNumberKeys({
	allowDecimal,
	allowNegative,
}: {
	allowDecimal: boolean;
	allowNegative: boolean;
}) {
	const blockedKeys = new Set(blockedNumberKeys);

	if (!allowDecimal) {
		blockedKeys.add(".");
	}

	if (!allowNegative) {
		blockedKeys.add("-");
	}

	return blockedKeys;
}

function getNumberPastePattern({
	allowDecimal,
	allowNegative,
}: {
	allowDecimal: boolean;
	allowNegative: boolean;
}) {
	if (allowDecimal && allowNegative) {
		return /^-?\d+(\.\d+)?$/;
	}

	if (allowDecimal) {
		return /^\d+(\.\d+)?$/;
	}

	if (allowNegative) {
		return /^-?\d+$/;
	}

	return /^\d+$/;
}
