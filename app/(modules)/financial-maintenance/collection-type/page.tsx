import { CollectionTypeListPage } from "@/app/src/ui/modules/financial-maintenance/collection-type/CollectionTypeListPage";

export default function MaintenanceCollectionTypePage() {
  return (
    <CollectionTypeListPage
      kind="collection"
      title="Collection Type Maintenance"
      singularTitle="Collection Type"
      description="Maintain collection classifications and their linked revenue Chart of Accounts records."
    />
  );
}
