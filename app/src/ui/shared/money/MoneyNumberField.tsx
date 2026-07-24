"use client";

import {
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	type ChangeEvent,
	type FocusEvent,
	type ComponentPropsWithoutRef,
} from "react";
import { formatMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";

export {
	formatMoneyNumberInput,
	parseMoneyNumberInput,
} from "@/app/src/data/shared/money/MoneyNumberData";

export type MoneyNumberFieldProps = Omit<
	ComponentPropsWithoutRef<"input">,
	"onChange" | "type" | "value"
> & {
	allowNegative?: boolean;
	value: string;
	onValueChange: (value: string) => void;
};

export function MoneyNumberField({
	allowNegative = false,
	inputMode = "decimal",
	onValueChange,
	value,
	...props
}: MoneyNumberFieldProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const nextSelectionRef = useRef<number | null>(null);
	const [displayValue, setDisplayValue] = useState(value);

	useEffect(() => {
		const input = inputRef.current;

		if (input && document.activeElement === input) {
			return;
		}

		setDisplayValue(value);
	}, [value]);

	useLayoutEffect(() => {
		const input = inputRef.current;
		const nextSelection = nextSelectionRef.current;

		if (!input || nextSelection === null || document.activeElement !== input) {
			return;
		}

		const boundedSelection = Math.min(nextSelection, input.value.length);

		input.setSelectionRange(boundedSelection, boundedSelection);
		nextSelectionRef.current = null;
	});

	function handleChange(event: ChangeEvent<HTMLInputElement>) {
		const input = event.target;
		const selectionStart = input.selectionStart ?? input.value.length;
		const unformattedBeforeCaret = input.value.slice(0, selectionStart);
		const formattedValue = formatMoneyNumberInput(input.value, allowNegative);
		const formattedBeforeCaret = formatMoneyNumberInput(
			unformattedBeforeCaret,
			allowNegative,
		);

		nextSelectionRef.current = formattedBeforeCaret.length;
		setDisplayValue(formattedValue);
		onValueChange(formattedValue);
	}

	function handleBlur(event: FocusEvent<HTMLInputElement>) {
		setDisplayValue(formatMoneyNumberInput(event.target.value, allowNegative));
		props.onBlur?.(event);
	}

	return (
		<input
			{...props}
			ref={inputRef}
			type="text"
			inputMode={inputMode}
			value={displayValue}
			onBlur={handleBlur}
			onChange={handleChange}
		/>
	);
}
