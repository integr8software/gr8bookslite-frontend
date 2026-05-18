export function UserListHeader({
  description,
  title,
}: {
  addHref?: string;
  description: string;
  title: string;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-darknavy">{title}</h2>
      <p className="sr-only">{description}</p>
    </div>
  );
}
