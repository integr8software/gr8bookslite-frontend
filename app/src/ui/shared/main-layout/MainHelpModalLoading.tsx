import { BookOpenText } from "lucide-react";

export function MainHelpModalLoading() {
  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-transparent px-3 py-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-darknavy/10 bg-white p-6 text-center shadow-[0_30px_90px_rgba(33,39,56,0.25)]">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md bg-skyblue/15 text-darknavy">
          <BookOpenText className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="mt-4 text-sm font-semibold text-darknavy">
          Loading manual...
        </p>
      </div>
    </div>
  );
}
