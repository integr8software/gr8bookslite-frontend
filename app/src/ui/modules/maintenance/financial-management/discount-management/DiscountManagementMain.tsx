"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import {
	Download,
	Edit3,
	Eye,
	Percent,
	Plus,
	Trash2,
	Upload,
} from "lucide-react";
import { DiscountManagementHref } from "@/app/src/data/modules/maintenance/financial-management/discount-management/DiscountManagementData";
import { useDiscountManagementStore } from "@/app/src/hooks/modules/maintenance/financial-management/discount-management/useDiscountManagement";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { AppConfirmDialog } from "@/app/src/ui/shared/system/AppConfirmDialog";
import type { Discount } from "@/app/src/types/modules/maintenance/financial-management/discount-management/DiscountManagementTypes";

export function DiscountManagementMain() {
	const discounts = useDiscountManagementStore((state) => state.discounts);
	const deleteDiscount = useDiscountManagementStore(
		(state) => state.deleteDiscount,
	);
	const isLoading = useDiscountManagementStore((state) => state.isLoading);
	const isMutating = useDiscountManagementStore((state) => state.isMutating);
	const [pendingDelete, setPendingDelete] = useState<Discount | null>(null);

	function handleConfirmDelete() {
		if (!pendingDelete) {
			return;
		}

		deleteDiscount(pendingDelete.id);
		setPendingDelete(null);
	}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Discount Management"
				description="Maintain discount definitions and map them to chart of accounts."
				eyebrow={
					<>
						<Percent className="h-3.5 w-3.5" aria-hidden="true" />
						Accounting master data
					</>
				}
				actions={
					<>
						<button
							type="button"
							className={moduleHeaderActionClassNames.secondary}
						>
							<Upload className="h-4 w-4" aria-hidden="true" />
							Import
						</button>
						<button
							type="button"
							className={moduleHeaderActionClassNames.secondary}
						>
							<Download className="h-4 w-4" aria-hidden="true" />
							Export
						</button>
						<Link
							href={`${DiscountManagementHref}/add`}
							className={moduleHeaderActionClassNames.primary}
						>
							<Plus className="h-4 w-4" aria-hidden="true" />
							Add Discount
						</Link>
					</>
				}
			/>

			<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
				<div className="grid grid-cols-[0.9fr_1fr_0.8fr_8rem] gap-4 border-b border-darknavy/10 bg-darknavy/[0.03] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-darknavy/50">
					<span>Description</span>
					<span>Discount %</span>
					<span>Account</span>
					<span className="text-right">Actions</span>
				</div>
				<div className="divide-y divide-darknavy/10">
					{isLoading ? (
						<DiscountManagementListMessage>
							Loading discounts...
						</DiscountManagementListMessage>
					) : null}
					{!isLoading && discounts.length === 0 ? (
						<DiscountManagementListMessage>
							No discounts yet. Add a discount to start mapping promotions to
							accounts.
						</DiscountManagementListMessage>
					) : null}
					{!isLoading
						? discounts.map((discount) => (
								<DiscountManagementListRow
									key={discount.id}
									discount={discount}
									onDeleteDiscount={setPendingDelete}
								/>
							))
						: null}
				</div>
			</div>

			<AppConfirmDialog
				isOpen={Boolean(pendingDelete)}
				isPending={isMutating}
				title="Delete discount?"
				description={`This will remove ${pendingDelete?.description ?? "the selected discount"}.`}
				confirmLabel="Delete"
				tone="danger"
				onCancel={() => setPendingDelete(null)}
				onConfirm={handleConfirmDelete}
			/>
		</section>
	);
}

function DiscountManagementListRow({
	discount,
	onDeleteDiscount,
}: {
	discount: Discount;
	onDeleteDiscount: (discount: Discount) => void;
}) {
	return (
		<article className="grid gap-3 px-4 py-4 lg:grid-cols-[0.9fr_1fr_0.8fr_8rem] lg:items-center lg:gap-4">
			<p className="truncate text-sm font-semibold text-darknavy">
				{discount.description}
			</p>
			<p className="text-sm text-darknavy">{discount.percentage}%</p>
			<p className="truncate text-sm text-darknavy">
				{discount.accountCode && discount.accountTitle
					? `${discount.accountCode} - ${discount.accountTitle}`
					: "No account selected"}
			</p>
			<div className="flex items-center justify-end gap-1">
				<Link
					href={`${DiscountManagementHref}/view/${discount.id}`}
					aria-label={`View ${discount.description}`}
					className={listActionClassName}
				>
					<Eye className="h-4 w-4" aria-hidden="true" />
				</Link>
				<Link
					href={`${DiscountManagementHref}/edit/${discount.id}`}
					aria-label={`Edit ${discount.description}`}
					className={listActionClassName}
				>
					<Edit3 className="h-4 w-4" aria-hidden="true" />
				</Link>
				<button
					type="button"
					onClick={() => onDeleteDiscount(discount)}
					aria-label={`Delete ${discount.description}`}
					className="flex h-9 w-9 items-center justify-center rounded-md text-coralpink transition hover:bg-coralpink/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/30"
				>
					<Trash2 className="h-4 w-4" aria-hidden="true" />
				</button>
			</div>
		</article>
	);
}

function DiscountManagementListMessage({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<div className="px-4 py-10 text-center text-sm font-medium text-darknavy/60">
			{children}
		</div>
	);
}

const listActionClassName =
	"flex h-9 w-9 items-center justify-center rounded-md text-darknavy/65 transition hover:bg-darknavy/5 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35";
