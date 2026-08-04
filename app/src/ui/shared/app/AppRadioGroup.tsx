import * as React from "react";
import { AppRadioGroupProps } from "@/app/src/types/shared/app/AppRadioGroupTypes";

export function AppRadioGroup<TValue extends string>({
	"aria-label": ariaLabel,
	className,
	name,
	onChange,
	options,
	readOnly = false,
	value,
}: AppRadioGroupProps<TValue>) {
	return (
		<div
			role="radiogroup"
			aria-label={ariaLabel}
			className={className ?? "grid gap-3 sm:grid-cols-2"}
		>
			{options.map((option) => {
				const isSelected = option.value === value;
				const isDisabled = readOnly || option.disabled;

				return (
					<label
						key={option.value}
						className={[
							"group flex min-h-20 cursor-pointer items-start justify-between gap-4 rounded-md border bg-white p-4 text-left shadow-sm shadow-darknavy/[0.03] transition",
							isSelected
								? "border-skyblue bg-skyblue/[0.04] ring-2 ring-skyblue/15"
								: "border-darknavy/10 hover:border-skyblue/60 hover:bg-skyblue/[0.03]",
							isDisabled ? "cursor-default opacity-75" : "",
						]
							.filter(Boolean)
							.join(" ")}
					>
						<input
							checked={isSelected}
							className="sr-only"
							disabled={isDisabled}
							name={name}
							type="radio"
							value={option.value}
							onChange={() => onChange(option.value)}
						/>
						<span className="min-w-0">
							<span className="block text-sm font-semibold text-darknavy">
								{option.label}
							</span>
							{option.description ? (
								<span className="mt-2 block text-xs leading-5 text-darknavy/55">
									{option.description}
								</span>
							) : null}
						</span>
						<span
							className={[
								"mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border transition",
								isSelected
									? "border-skyblue bg-skyblue"
									: "border-darknavy/20 bg-white group-hover:border-skyblue/60",
							].join(" ")}
							aria-hidden="true"
						>
							{isSelected ? (
								<span className="h-1.5 w-1.5 rounded-full bg-white" />
							) : null}
						</span>
					</label>
				);
			})}
		</div>
	);
}
