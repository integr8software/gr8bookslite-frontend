import { BookOpenText } from "lucide-react";

export function MainHelpModalLoading() {
  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-transparent px-3 py-4 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-lg border border-darknavy/10 bg-white p-6 text-center shadow-[0_30px_90px_rgba(33,39,56,0.25)]"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="relative mx-auto h-28 w-36 [perspective:900px]" aria-hidden="true">
          <div className="absolute inset-x-6 bottom-3 h-3 rounded-full bg-darknavy/10 blur-md" />
          <div className="absolute left-1/2 top-5 h-20 w-28 -translate-x-1/2 rounded-md bg-darknavy/10 shadow-[0_18px_48px_rgba(33,39,56,0.14)]" />
          <div className="absolute left-1/2 top-2 h-22 w-14 -translate-x-full rounded-l-md border border-darknavy/10 bg-white shadow-[0_14px_32px_rgba(33,39,56,0.12)]">
            <div className="absolute left-3 right-3 top-5 h-1 rounded-full bg-skyblue/70" />
            <div className="absolute left-3 right-5 top-9 h-1 rounded-full bg-darknavy/12" />
            <div className="absolute left-3 right-4 top-13 h-1 rounded-full bg-darknavy/10" />
          </div>
          <div className="absolute left-1/2 top-2 h-22 w-14 rounded-r-md border border-darknavy/10 bg-white shadow-[0_14px_32px_rgba(33,39,56,0.12)]">
            <div className="absolute left-4 right-3 top-5 h-1 rounded-full bg-citron/80" />
            <div className="absolute left-3 right-3 top-9 h-1 rounded-full bg-darknavy/12" />
            <div className="absolute left-5 right-3 top-13 h-1 rounded-full bg-darknavy/10" />
          </div>
          <div className="absolute left-1/2 top-2 h-22 w-14 origin-left animate-[gr8-page-turn_1.45s_ease-in-out_infinite] rounded-r-md border-y border-r border-darknavy/10 bg-white shadow-[10px_10px_24px_rgba(33,39,56,0.12)]">
            <BookOpenText className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-skyblue" />
          </div>
        </div>
        <p className="mt-4 text-sm font-semibold text-darknavy">
          Opening manual...
        </p>
      </div>
    </div>
  );
}
