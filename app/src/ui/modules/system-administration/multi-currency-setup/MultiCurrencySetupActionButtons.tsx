import Link from "next/link";
import { ArrowLeft, Edit3, Save, Trash2, X } from "lucide-react";
import { MultiCurrencySetupHref } from "@/app/src/constants/modules/system-administration/multi-currency-setup/MultiCurrencySetupConstants";
import type {
	MultiCurrencySetupActionMode,
	MultiCurrencySetupRecord,
} from "@/app/src/types/modules/system-administration/multi-currency-setup/MultiCurrencySetupTypes";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

type MultiCurrencySetupActionButtonsProps = {
	isReadonly: boolean;
	mode: MultiCurrencySetupActionMode;
	record?: MultiCurrencySetupRecord;
	onDeleteRecord: () => void;
};

export function MultiCurrencySetupActionButtons({
	isReadonly,
	mode,
	record,
	onDeleteRecord,
}: MultiCurrencySetupActionButtonsProps) {
	return (
		<>
			{mode === "view" ? (
				<Link
					href={MultiCurrencySetupHref}
					className={moduleHeaderActionClassNames.secondary}
				>
					<ArrowLeft className="h-4 w-4" aria-hidden="true" />
					Back
				</Link>
			) : null}
			{mode === "view" && record ? (
				<Link
					href={`${MultiCurrencySetupHref}/edit/${record.id}`}
					className={moduleHeaderActionClassNames.secondary}
				>
					<Edit3 className="h-4 w-4" aria-hidden="true" />
					Edit
				</Link>
			) : null}
			{record ? (
				<button
					type="button"
					onClick={onDeleteRecord}
					className={moduleHeaderActionClassNames.danger}
				>
					<Trash2 className="h-4 w-4" aria-hidden="true" />
					Delete
				</button>
			) : null}
			{mode === "edit" && record ? (
				<Link
					href={`${MultiCurrencySetupHref}/view/${record.id}`}
					className={moduleHeaderActionClassNames.secondary}
				>
					<X className="h-4 w-4" aria-hidden="true" />
					Cancel
				</Link>
			) : null}
			{!isReadonly ? (
				<button type="submit" className={moduleHeaderActionClassNames.primary}>
					<Save className="h-4 w-4" aria-hidden="true" />
					Save Setup
				</button>
			) : null}
		</>
	);
}
