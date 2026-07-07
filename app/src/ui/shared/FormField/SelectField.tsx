import {
	forwardRef,
	useId,
	type ComponentProps,
} from "react";
import {
	FormField,
	textControlClassName,
	type BaseFieldProps,
} from "@/app/src/ui/shared/FormField/FormField";

export type SelectOption =
	| string
	| {
			disabled?: boolean;
			label: string;
			value: string;
	  };

export type SelectFieldProps = BaseFieldProps &
	Omit<ComponentProps<"select">, "children" | "className" | "id"> & {
		options: readonly SelectOption[];
		placeholder?: string;
	};

const selectControlClassName = `app-select-control ${textControlClassName} enabled:bg-white enabled:text-darknavy disabled:bg-darknavy/[0.03] disabled:text-darknavy/70`;

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
	function SelectField(
		{
			className,
			controlClassName = "",
			error,
			helper,
			id,
			label,
			options,
			placeholder,
			required,
			success,
			warning,
			...props
		},
		ref,
	) {
		const generatedId = useId();
		const selectId = id ?? generatedId;

		return (
			<FormField
				className={className}
				error={error}
				helper={helper}
				htmlFor={selectId}
				label={label}
				required={required}
				success={success}
				warning={warning}
			>
				<select
					ref={ref}
					id={selectId}
					className={`${selectControlClassName} ${controlClassName}`.trim()}
					{...props}
				>
					{placeholder ? <option value="">{placeholder}</option> : null}
					{options.map((option) => {
						const normalizedOption = normalizeSelectOption(option);

						return (
							<option
								key={normalizedOption.value}
								value={normalizedOption.value}
								disabled={normalizedOption.disabled}
							>
								{normalizedOption.label}
							</option>
						);
					})}
				</select>
			</FormField>
		);
	},
);

function normalizeSelectOption(option: SelectOption) {
	return typeof option === "string"
		? { label: option, value: option }
		: option;
}
