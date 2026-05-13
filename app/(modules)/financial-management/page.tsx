import { ModulePlaceholderPage } from "@/app/src/ui/modules/shared/ModulePlaceholderPage";

export default function FinancialManagementPage() {
  return (
    <ModulePlaceholderPage
      eyebrow="Financial Management"
      title="Financial workspace"
      description="This area anchors account structure, reconciliation, and collections. The Collections module below is fully routed, and the rest of the finance pages now have their own workspace-ready URLs."
      actionHref="/financial-management/collections/collection-receipts"
      actionLabel="Open Collection Receipts"
    />
  );
}
