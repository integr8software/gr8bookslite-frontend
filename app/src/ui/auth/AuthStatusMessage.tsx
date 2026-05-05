import type { AuthActionState } from "@/app/src/data/auth/AuthTypes";

type AuthStatusMessageProps = {
  state: AuthActionState;
};

export function AuthStatusMessage({ state }: AuthStatusMessageProps) {
  if (!state.message) {
    return null;
  }

  const className =
    state.status === "success"
      ? "border-skyblue/30 bg-skyblue/10 text-darknavy"
      : "border-coralpink/30 bg-coralpink/10 text-coralpink";

  return (
    <p className={`rounded-md border px-4 py-3 text-sm ${className}`}>
      {state.message}
    </p>
  );
}
