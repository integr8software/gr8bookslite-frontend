import type { ReactNode } from "react";

export type AppRadioGroupOption<TValue extends string> = {
	description?: ReactNode;
	label: ReactNode;
	value: TValue;
};

export type AppRadioGroupProps<TValue extends string> = {
	className?: string;
	name: string;
	options: ReadonlyArray<AppRadioGroupOption<TValue>>;
	readOnly?: boolean;
	value: TValue;
	onChange: (value: TValue) => void;
};

export function AppRadioGroup<TValue extends string>({
	className,
	name,
	onChange,
	options,
	readOnly = false,
	value,
}: AppRadioGroupProps<TValue>) {
	return (
		<div className={className ?? "grid gap-2 sm:grid-cols-2"}>
			{options.map((option) => {
				const isSelected = option.value === value;

				return (
					<label
						key={option.value}
						className={[
							"flex min-h-11 cursor-pointer items-start gap-3 rounded-md border bg-white px-3 py-2.5 text-sm transition",
							isSelected
								? "border-skyblue bg-skyblue/5 text-darknavy ring-2 ring-skyblue/15"
								: "border-darknavy/15 text-darknavy hover:border-skyblue/55 hover:bg-skyblue/5",
							readOnly ? "cursor-default opacity-75" : "",
						]
							.filter(Boolean)
							.join(" ")}
					>
						<input
							checked={isSelected}
							className="mt-0.5 h-4 w-4 accent-skyblue"
							disabled={readOnly}
							name={name}
							type="radio"
							value={option.value}
							onChange={() => onChange(option.value)}
						/>
						<span className="min-w-0">
							<span className="block font-semibold">{option.label}</span>
							{option.description ? (
								<span className="mt-0.5 block text-xs leading-5 text-darknavy/60">
									{option.description}
								</span>
							) : null}
						</span>
					</label>
				);
			})}
		</div>
	);
}
