import type { AppLookupDropdownProps } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";

export function AppLookupDropdown({
	addAction,
	onChange,
	options,
	placeholder,
	readOnly = false,
	searchPlaceholder,
	value,
}: AppLookupDropdownProps) {
	return (
		<AppAdvancedDropdown
			addAction={addAction}
			onChange={(nextValue) => {
				const idOrCode = String(nextValue);
				const option = options.find((item) => item.value === idOrCode);

				onChange(idOrCode, option?.name ?? "");
			}}
			options={options}
			placeholder={placeholder}
			readOnly={readOnly}
			searchPlaceholder={searchPlaceholder}
			value={value}
		/>
	);
}
