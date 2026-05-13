import { ModulePlaceholderPage } from "@/app/src/ui/modules/shared/ModulePlaceholderPage";

export default function CollectionsPage() {
  return (
    <ModulePlaceholderPage
      eyebrow="Financial Management"
      title="Collections"
      description="Collections now has a nested route structure for receipts, customers, statements, aging, and write-offs."
      actionHref="/financial-management/collections/collection-receipts"
      actionLabel="Open Receipts"
    />
  );
}
