import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { FixedAssetMain } from "@/app/src/ui/modules/others/fixed-asset/Main";

const PageTitle = "Fixed Asset";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function OthersFixedAssetPage() {
  return <FixedAssetMain />;
}


