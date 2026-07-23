import type { DeliveryReceiptFormValues } from "@/app/src/types/modules/inventory/delivery-receipt/DeliveryReceiptTypes";
import { DeliveryReceiptCustomerFields } from "@/app/src/ui/modules/inventory/delivery-receipt/action/DeliveryReceiptCustomerFields";
import { DeliveryReceiptDeliveryFields } from "@/app/src/ui/modules/inventory/delivery-receipt/action/DeliveryReceiptDeliveryFields";
import type { DeliveryReceiptFieldUpdater } from "@/app/src/ui/modules/inventory/delivery-receipt/action/DeliveryReceiptFieldControls";
import {
	ModuleTabs,
	type ModuleTabItem,
} from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";

export type DeliveryReceiptDetailsSection =
	| "customer"
	| "delivery";

type DeliveryReceiptDetailsFormProps = {
	isReadonly: boolean;
	section: DeliveryReceiptDetailsSection;
	values: DeliveryReceiptFormValues;
	onSectionChange: (section: DeliveryReceiptDetailsSection) => void;
	onUpdateField: DeliveryReceiptFieldUpdater<DeliveryReceiptFormValues>;
};

export function DeliveryReceiptDetailsForm({
	isReadonly,
	onSectionChange,
	onUpdateField,
	section,
	values,
}: DeliveryReceiptDetailsFormProps) {
	return (
		<section className="min-w-0 overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5">
			<ModuleTabs
				activeTab={section}
				ariaLabel="Delivery receipt sections"
				containerClassName="rounded-none border-0 border-b border-darknavy/10 shadow-none"
				tabs={DeliveryReceiptDetailsTabs}
				onTabChange={onSectionChange}
			/>
			<div className="p-4 sm:p-5">
				{section === "customer" ? (
					<DeliveryReceiptCustomerFields
						isReadonly={isReadonly}
						values={values}
						onUpdateField={onUpdateField}
					/>
				) : null}
				{section === "delivery" ? (
					<DeliveryReceiptDeliveryFields
						isReadonly={isReadonly}
						values={values}
						onUpdateField={onUpdateField}
					/>
				) : null}
			</div>
		</section>
	);
}

const DeliveryReceiptDetailsTabs = [
	{ id: "customer", label: "Customer / Billing" },
	{ id: "delivery", label: "Delivery / Vehicle" },
] satisfies ModuleTabItem<DeliveryReceiptDetailsSection>[];
