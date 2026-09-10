import { DisbursementTypeListPage } from "@/app/src/ui/modules/financial-maintenance/disbursement-type/DisbursementTypeListPage";

export default function MaintenanceDisbursementTypePage() {
  return (
    <DisbursementTypeListPage
      kind="disbursement"
      title="Disbursement Type Maintenance"
      singularTitle="Disbursement Type"
      description="Maintain disbursement classifications and their linked expense Chart of Accounts records."
    />
  );
}
