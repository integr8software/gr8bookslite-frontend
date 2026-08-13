import type * as React from "react";

export type AppRadioGroupOption<TValue extends string> = {
	description?: React.ReactNode;
	disabled?: boolean;
	label: React.ReactNode;
	value: TValue;
};

export type AppRadioGroupProps<TValue extends string> = {
	"aria-label"?: string;
	className?: string;
	name: string;
	options: ReadonlyArray<AppRadioGroupOption<TValue>>;
	readOnly?: boolean;
	value: TValue;
	onChange: (value: TValue) => void;
};
