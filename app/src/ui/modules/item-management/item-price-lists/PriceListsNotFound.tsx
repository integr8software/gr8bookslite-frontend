import { BadgeDollarSign } from "lucide-react";
import { PriceListsHref } from "@/app/src/constants/modules/item-management/item-price-lists/PriceListsConstants";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";

export function PriceListsNotFound() {
  return (
    <ModuleNotFound
      actionHref={PriceListsHref}
      actionLabel="Back"
      align="center"
      className="p-8"
      description="The price list may have been removed or the record identifier is invalid."
      descriptionClassName="mx-auto max-w-md"
      icon={<BadgeDollarSign className="h-6 w-6" aria-hidden="true" />}
      iconClassName="h-12 w-12 rounded-lg bg-skyblue/12 text-skyblue"
      title="Price list not found"
      titleAs="h1"
      titleClassName="mt-4 text-xl"
    />
  );
}
