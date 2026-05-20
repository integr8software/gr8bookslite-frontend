import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";

export function UserTypeHeader({
  addHref,
  description,
  onStartSpotlightTutorial,
  title,
}: {
  addHref: string;
  description: string;
  onStartSpotlightTutorial: () => void;
  title: string;
}) {
  return (
    <div
      className="flex flex-col gap-4 rounded-xl border border-darknavy/10 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
      data-spotlight-id="user-type-header"
    >
      <div>
        <h2 className="text-xl font-semibold text-darknavy">{title}</h2>
        <p className="mt-1 text-sm text-darknavy/55">{description}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onStartSpotlightTutorial}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy/75 transition hover:border-skyblue/45 hover:bg-skyblue/8 hover:text-darknavy"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Quick Tour
        </button>
        <Link
          href={addHref}
          data-spotlight-id="user-type-add"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-600/15 transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Type
        </Link>
      </div>
    </div>
  );
}
