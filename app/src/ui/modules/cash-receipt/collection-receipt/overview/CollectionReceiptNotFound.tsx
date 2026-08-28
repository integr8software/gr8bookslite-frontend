import { CollectionReceiptHref } from "@/app/src/constants/modules/cash-receipt/collection-receipt/CollectionReceiptConstants";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";

export function CollectionReceiptNotFound() {
  return (
    <ModuleNotFound
      actionHref={CollectionReceiptHref}
      actionLabel="Back to Collection Receipt"
      description="The collection receipt record may have been removed or is no longer available."
      title="Collection Receipt Not Found"
    />
  );
}
