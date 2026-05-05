type AuthSubmitButtonProps = {
  children: string;
  pending: boolean;
};

export function AuthSubmitButton({
  children,
  pending,
}: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-12 w-full rounded-md bg-darknavy px-5 text-sm font-semibold text-offwhite transition hover:bg-darknavy/90 disabled:cursor-not-allowed disabled:bg-darknavy/50"
    >
      {pending ? "Please wait..." : children}
    </button>
  );
}
