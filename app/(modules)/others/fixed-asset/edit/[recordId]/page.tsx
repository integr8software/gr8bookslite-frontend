import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { FixedAssetAction } from "@/app/src/ui/modules/others/fixed-asset/Action";

const PageTitle = "Edit Fixed Asset";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function OthersFixedAssetEditPage() {
  return <FixedAssetAction />;
}


