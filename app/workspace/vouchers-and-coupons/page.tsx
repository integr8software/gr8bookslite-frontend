import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { WorkspaceVouchersAndCouponsPage } from "@/app/src/ui/workspace/vouchers-and-coupons/WorkspaceVouchersAndCouponsPage";

export const metadata: Metadata = {
  title: `Vouchers and Coupons | ${AppName}`,
  description: `Workspace vouchers and coupons assigned from subscriber master data for ${AppName}.`,
};

export default function VouchersAndCouponsPage() {
  return <WorkspaceVouchersAndCouponsPage />;
}
