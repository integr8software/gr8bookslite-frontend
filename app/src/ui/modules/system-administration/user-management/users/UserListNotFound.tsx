import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";

export function UserListNotFound({
  href,
  title,
}: {
  href: string;
  title: string;
}) {
  return (
    <ModuleNotFound
      title={title}
      titleClassName="text-xl font-semibold text-darknavy"
      actionHref={href}
      actionLabel="Back"
    />
  );
}
