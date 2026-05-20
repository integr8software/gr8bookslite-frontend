"use client";

import { ChartsOfAccountsBankFields as BankFields } from "@/app/src/constants/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsConstants";
import type {
	BankDetailsKey,
	ChartAccountFormValues,
} from "@/app/src/types/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsTypes";
import {
	Field,
	Input,
} from "@/app/src/ui/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsControls.tsx";

export function ChartsOfAccountsBankFields({
	values,
	onBankFieldChange,
}: {
	values: ChartAccountFormValues;
	onBankFieldChange: (key: BankDetailsKey, value: string) => void;
}) {
	return (
		<div className="grid gap-4 sm:grid-cols-2">
			{BankFields.map((field) => (
				<Field key={field.key} label={field.label}>
					<Input
						type={field.type ?? "text"}
						value={values.bankDetails?.[field.key] ?? ""}
						onChange={(event) =>
							onBankFieldChange(field.key, event.target.value)
						}
					/>
				</Field>
			))}
		</div>
	);
}
