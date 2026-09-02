import type { AppLookupDropdownProps } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";

export function AppLookupDropdown({
	addAction,
	emptyMessage,
	id,
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
			id={id}
			onChange={(nextValue) => {
				const idOrCode = String(nextValue);
				const option = options.find((item) => item.value === idOrCode);

				onChange(idOrCode, option?.name ?? "");
			}}
			emptyMessage={emptyMessage}
			options={options}
			placeholder={placeholder}
			readOnly={readOnly}
			searchPlaceholder={searchPlaceholder}
			value={value}
		/>
	);
}
