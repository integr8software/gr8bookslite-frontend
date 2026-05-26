import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterLogsPage as MasterLogsModulePage } from "@/app/src/ui/master/logs/MasterLogsPage";

export const metadata: Metadata = {
  title: `Logs | ${AppName}`,
  description: `Master logs directory for ${AppName}.`,
};

export default function MasterLogsPage() {
  return <MasterLogsModulePage />;
}
