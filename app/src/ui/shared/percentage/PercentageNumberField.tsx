"use client";

import type { ComponentPropsWithoutRef, FocusEvent } from "react";
import {
	MoneyNumberField,
	formatMoneyNumberDisplayValue,
	parseMoneyNumberInput,
} from "@/app/src/ui/shared/money/MoneyNumberField";

export type PercentageNumberFieldProps = Omit<
	ComponentPropsWithoutRef<typeof MoneyNumberField>,
	"allowNegative" | "max" | "min" | "onValueChange"
> & {
	max?: number;
	min?: number;
	onValueChange: (value: string) => void;
};

export function PercentageNumberField({
	className = "",
	max = 100,
	min = 0,
	onValueChange,
	value,
	onBlur,
	...props
}: PercentageNumberFieldProps) {
	function handleValueChange(nextValue: string) {
		onValueChange(nextValue);
	}

	function handleBlur(event: FocusEvent<HTMLInputElement>) {
		const nextValue = event.target.value;

		onBlur?.(event);

		if (!nextValue) {
			return;
		}

		const parsedValue = parseMoneyNumberInput(nextValue);

		if (parsedValue > max) {
			onValueChange(formatMoneyNumberDisplayValue(max));
			return;
		}

		if (parsedValue < min) {
			onValueChange(formatMoneyNumberDisplayValue(min));
		}
	}

	return (
		<div className="relative min-w-0">
			<MoneyNumberField
				{...props}
				value={value}
				min={min}
				max={max}
				allowNegative={min < 0}
				onValueChange={handleValueChange}
				onBlur={handleBlur}
				className={`${className} pr-8`}
			/>
			<span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-semibold text-darknavy/55">
				%
			</span>
		</div>
	);
}
