import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ActivateAccountForm } from "@/app/src/ui/auth/ActivateAccountForm";
import { GradientBlurBackground } from "@/app/src/ui/shared/layout/GradientBlurBackground";

export const metadata: Metadata = {
  title: `Create password | ${AppName}`,
};

type ActivateAccountPageProps = {
  searchParams: Promise<{
    email?: string | string[];
    token?: string | string[];
  }>;
};

export default async function ActivateAccountPage({
  searchParams,
}: ActivateAccountPageProps) {
  const params = await searchParams;
  const email = readQueryParam(params.email);
  const token = readQueryParam(params.token);

  return (
    <div className="relative isolate min-h-screen">
      <GradientBlurBackground />
      <ActivateAccountForm email={email} token={token} />
    </div>
  );
}

function readQueryParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}
