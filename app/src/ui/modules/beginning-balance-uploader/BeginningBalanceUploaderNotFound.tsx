import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { BeginningBalanceUploaderHref } from "@/app/src/constants/modules/beginning-balance-uploader/BeginningBalanceUploaderConstants";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function BeginningBalanceUploaderNotFound() {
  return (
    <section className="grid min-h-[24rem] place-items-center rounded-lg border border-darknavy/10 bg-white p-8 text-center shadow-sm">
      <div>
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-skyblue/15 text-skyblue">
          <FileQuestion className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-xl font-semibold text-darknavy">Beginning balance not found</h1>
        <p className="mt-2 text-sm text-darknavy/55">The requested record may have been removed.</p>
        <Link href={BeginningBalanceUploaderHref} className={`${moduleHeaderActionClassNames.primary} mt-5`}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to List
        </Link>
      </div>
    </section>
  );
}
