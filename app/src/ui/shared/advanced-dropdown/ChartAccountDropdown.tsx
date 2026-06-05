"use client";

import {
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
	type KeyboardEvent,
} from "react";
import { ChevronDown, X } from "lucide-react";
import type { ChartAccount } from "@/app/src/types/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsTypes";
import type { AppAdvancedDropdownProps } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";

type ChartAccountDropdownProps = Omit<
	AppAdvancedDropdownProps,
	"options" | "selectionMode" | "value" | "onChange" | "onSelectOption"
> & {
	accounts: ChartAccount[];
	value: string;
	onChange: (accountId: string) => void;
	onSelectAccount?: (account: ChartAccount | null) => void;
};

export function ChartAccountDropdown({
	accounts,
	className,
	disabled,
	emptyMessage = "No chart accounts found.",
	id,
	isClearable = true,
	placeholder = "Select account",
	readOnly,
	searchPlaceholder = "Search account name or code",
	value,
	onChange,
	onSelectAccount,
}: ChartAccountDropdownProps) {
	const generatedId = useId();
	const controlId = id ?? generatedId;
	const listboxId = `${controlId}-listbox`;
	const rootRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [activeIndex, setActiveIndex] = useState(0);
	const flatAccounts = useMemo(() => flattenAccounts(accounts), [accounts]);
	const accountByValue = useMemo(
		() =>
			new Map(
				flatAccounts.flatMap((account) => [
					[account.id, account],
					[account.accountNumber, account],
				]),
			),
		[flatAccounts],
	);
	const selectedAccount = accountByValue.get(value);
	const isInteractionLocked = disabled || readOnly;
	const inputValue = isOpen
		? query
		: selectedAccount
			? selectedAccount.accountName
			: "";
	const filteredAccounts = useMemo(
		() => filterAccounts(flatAccounts, query),
		[flatAccounts, query],
	);
	const canClearSelection =
		Boolean(value) && isClearable && !isInteractionLocked;

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		function handlePointerDown(event: MouseEvent) {
			const target = event.target as Node;

			if (!rootRef.current?.contains(target)) {
				setIsOpen(false);
				setQuery("");
			}
		}

		document.addEventListener("mousedown", handlePointerDown);

		return () => {
			document.removeEventListener("mousedown", handlePointerDown);
		};
	}, [isOpen]);

	function openDropdown() {
		if (isInteractionLocked) {
			return;
		}

		setQuery("");
		setActiveIndex(0);
		setIsOpen(true);
	}

	function selectAccount(account: ChartAccount) {
		if (isInteractionLocked) {
			return;
		}

		onChange(account.accountNumber);
		onSelectAccount?.(account);
		setQuery("");
		setIsOpen(false);
	}

	function clearSelection() {
		if (isInteractionLocked) {
			return;
		}

		onChange("");
		onSelectAccount?.(null);
		setQuery("");
		setIsOpen(false);
		inputRef.current?.focus();
	}

	function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
		if (isInteractionLocked) {
			return;
		}

		if (event.key === "ArrowDown") {
			event.preventDefault();
			setIsOpen(true);
			setActiveIndex((current) =>
				filteredAccounts.length === 0
					? 0
					: (current + 1) % filteredAccounts.length,
			);
			return;
		}

		if (event.key === "ArrowUp") {
			event.preventDefault();
			setActiveIndex((current) =>
				filteredAccounts.length === 0
					? 0
					: (current - 1 + filteredAccounts.length) %
						filteredAccounts.length,
			);
			return;
		}

		if (event.key === "Enter") {
			if (!isOpen) {
				setIsOpen(true);
				return;
			}

			const activeAccount = filteredAccounts[activeIndex];

			if (activeAccount) {
				event.preventDefault();
				selectAccount(activeAccount);
			}
			return;
		}

		if (event.key === "Escape") {
			setIsOpen(false);
			setQuery("");
		}
	}

	return (
		<div ref={rootRef} className={joinClasses("relative", className)}>
			<div className="relative">
				<input
					ref={inputRef}
					id={controlId}
					value={inputValue}
					disabled={disabled}
					readOnly={readOnly}
					onFocus={openDropdown}
					onClick={openDropdown}
					onChange={(event) => {
						setQuery(event.target.value);
						setActiveIndex(0);
						setIsOpen(true);
					}}
					onKeyDown={handleKeyDown}
					placeholder={isOpen ? searchPlaceholder : placeholder}
					className="h-11 w-full rounded-md border border-darknavy/15 bg-white py-0 pl-3 pr-16 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-not-allowed disabled:bg-darknavy/5 read-only:bg-darknavy/[0.03]"
					role="combobox"
					aria-expanded={isOpen}
					aria-controls={listboxId}
					aria-autocomplete="list"
				/>
				<div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
					{canClearSelection ? (
						<button
							type="button"
							onClick={clearSelection}
							className="rounded-md p-1 text-darknavy/38 transition hover:bg-darknavy/5 hover:text-darknavy"
							aria-label="Clear selected account"
						>
							<X className="h-3.5 w-3.5" aria-hidden="true" />
						</button>
					) : null}
					<ChevronDown
						className={joinClasses(
							"h-4 w-4 text-darknavy/40 transition",
							isOpen && "rotate-180",
						)}
						aria-hidden="true"
					/>
				</div>
			</div>

			{isOpen ? (
				<div
					id={listboxId}
					role="listbox"
					className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-md border border-darknavy/15 bg-white py-1 shadow-lg"
				>
					{filteredAccounts.length > 0 ? (
						filteredAccounts.map((account, index) => (
							<button
								key={account.id}
								type="button"
								onMouseDown={(event) => {
									event.preventDefault();
									selectAccount(account);
								}}
								onMouseEnter={() => setActiveIndex(index)}
								className={joinClasses(
									"block w-full px-3 py-2 text-left text-sm transition",
									index === activeIndex
										? "bg-skyblue/10 text-darknavy"
										: "text-darknavy hover:bg-skyblue/10",
								)}
								role="option"
								aria-selected={
									account.accountNumber === value || account.id === value
								}
							>
								<span className="block truncate">{account.accountName}</span>
							</button>
						))
					) : (
						<div className="px-3 py-4 text-center text-sm text-darknavy/45">
							{emptyMessage}
						</div>
					)}
				</div>
			) : null}
		</div>
	);
}

function flattenAccounts(accounts: ChartAccount[]): ChartAccount[] {
	return accounts.flatMap((account) => [
		account,
		...(account.children ? flattenAccounts(account.children) : []),
	]);
}

function filterAccounts(accounts: ChartAccount[], query: string) {
	const normalizedQuery = query.trim().toLowerCase();
	const selectableAccounts = accounts.filter(
		(account) =>
			account.status === "Active" &&
			!account.children?.length &&
			account.accountCategory !== "Header",
	);

	if (!normalizedQuery) {
		return selectableAccounts;
	}

	return selectableAccounts.filter((account) =>
		[
			account.accountName,
			account.accountNumber,
			account.description,
			account.accountType,
			account.statementSection,
		]
			.join(" ")
			.toLowerCase()
			.includes(normalizedQuery),
	);
}

function joinClasses(...classes: Array<string | false | undefined>) {
	return classes.filter(Boolean).join(" ");
}
