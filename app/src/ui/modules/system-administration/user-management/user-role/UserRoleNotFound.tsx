import Link from "next/link";

export function UserRoleNotFound({
  href,
  title,
}: {
  href: string;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-darknavy">{title}</h2>
      <Link
        href={href}
        className="mt-4 inline-flex h-10 items-center rounded-md bg-skyblue px-4 text-sm font-semibold text-white"
      >
        Back
      </Link>
    </section>
  );
}
