import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";

export function UserListHeader({
  addHref,
  description,
  title,
  onStartSpotlightTutorial,
}: {
  addHref?: string;
  description: string;
  title: string;
  onStartSpotlightTutorial: () => void;
}) {
  return (
    <div
      className="flex flex-col gap-4 rounded-xl border border-darknavy/10 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between"
      data-spotlight-id="users-header"
    >
      <div>
        <h2 className="text-2xl font-bold text-darknavy">{title}</h2>
        <p className="mt-2 text-sm text-darknavy/55">{description}</p>
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
        {addHref ? (
          <Link
            href={addHref}
            data-spotlight-id="users-add-user"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-skyblue px-4 text-sm font-semibold text-white shadow-sm shadow-skyblue/15 transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add User
          </Link>
        ) : null}
      </div>
    </div>
  );
}
