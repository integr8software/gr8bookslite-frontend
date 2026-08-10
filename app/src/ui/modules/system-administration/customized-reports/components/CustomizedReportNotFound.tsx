import { FileQuestion } from "lucide-react";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";

export function CustomizedReportNotFound() {
  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 md:p-6">
      <ModuleNotFound
        align="center"
        description="Select another customized report module and try again."
        icon={<FileQuestion className="h-5 w-5" aria-hidden="true" />}
        title="Customized report not found"
      />
    </main>
  );
}
