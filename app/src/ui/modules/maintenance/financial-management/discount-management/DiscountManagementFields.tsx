import type { ChangeEventHandler, ReactNode } from "react";
import type { ChartAccount } from "@/app/src/types/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsTypes";
import type {
	DiscountManagementFormErrors,
	DiscountManagementFormValues,
} from "@/app/src/types/modules/maintenance/financial-management/discount-management/DiscountManagementTypes";

type DiscountManagementFieldsProps = {
	accountQuery: string;
	errors: DiscountManagementFormErrors;
	isReadonly: boolean;
	matchedAccounts: ChartAccount[];
	selectedAccount?: ChartAccount;
	values: DiscountManagementFormValues;
	onAccountQueryChange: ChangeEventHandler<HTMLInputElement>;
	onInputChange: ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
	onSelectAccount: (account: ChartAccount) => void;
};

export function DiscountManagementFields({
	accountQuery,
	errors,
	isReadonly,
	matchedAccounts,
	selectedAccount,
	values,
	onAccountQueryChange,
	onInputChange,
	onSelectAccount,
}: DiscountManagementFieldsProps) {
	return (
		<div className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
			<div className="grid gap-4 lg:grid-cols-2">
				<FormField label="Description" error={errors.description} required>
					<input
						name="description"
						value={values.description}
						onChange={onInputChange}
						readOnly={isReadonly}
						className={fieldClassName}
						placeholder="Enter description"
					/>
				</FormField>

				<FormField label="Discount Percentage" error={errors.percentage} required>
					<input
						name="percentage"
						type="number"
						min="0"
						max="100"
						step="0.01"
						value={values.percentage}
						onChange={onInputChange}
						readOnly={isReadonly}
						className={fieldClassName}
						placeholder="Enter percentage"
					/>
				</FormField>

				<FormField label="Account Code">
					<input
						value={selectedAccount?.accountNumber ?? ""}
						readOnly
						className={fieldClassName}
						placeholder="Select an account"
					/>
				</FormField>

				<FormField label="Account Title" error={errors.accountId} required>
					<div className="relative">
						<input
							value={accountQuery}
							onChange={onAccountQueryChange}
							readOnly={isReadonly}
							className={fieldClassName}
							placeholder="Search account by name or number"
						/>
						{matchedAccounts.length > 0 ? (
							<ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-md border border-darknavy/10 bg-white text-sm shadow-md">
								{matchedAccounts.map((account) => (
									<li key={account.id}>
										<button
											type="button"
											onClick={() => onSelectAccount(account)}
											className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-darknavy transition hover:bg-skyblue/10"
										>
											<span>{account.accountName}</span>
											<span className="text-xs text-darknavy/50">
												{account.accountNumber}
											</span>
										</button>
									</li>
								))}
							</ul>
						) : null}
					</div>
				</FormField>
			</div>
		</div>
	);
}

function FormField({
	children,
	error,
	label,
	required,
}: {
	children: ReactNode;
	error?: string;
	label: string;
	required?: boolean;
}) {
	return (
		<label>
			<span className="mb-2 block text-sm font-semibold text-darknavy">
				{label}
				{required ? <span className="text-coralpink"> *</span> : null}
			</span>
			{children}
			{error ? (
				<span className="mt-1 block text-xs font-medium text-coralpink">
					{error}
				</span>
			) : null}
		</label>
	);
}

const fieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-not-allowed disabled:bg-darknavy/5 read-only:bg-darknavy/[0.03]";
