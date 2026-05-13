import { Building2, ShieldAlert } from "lucide-react";

type NoBranchAccessProps = {
  companyName: string;
};

export function NoBranchAccess({ companyName }: NoBranchAccessProps) {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-3xl items-center justify-center px-4 py-10">
      <div className="w-full rounded-lg border border-darknavy/10 bg-white p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-coralpink/10 text-coralpink">
          <ShieldAlert className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold text-darknavy">
          No branch access
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-darknavy/62">
          Your user account is connected to {companyName}, but it does not have
          access to any branch yet. Ask an administrator to assign at least one
          branch before continuing.
        </p>
        <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-3 rounded-md border border-darknavy/10 bg-darknavy/5 px-4 py-3 text-left">
          <Building2 className="h-5 w-5 shrink-0 text-darknavy/55" aria-hidden="true" />
          <p className="text-sm text-darknavy/65">
            The main branch loads first when your role has branch access.
          </p>
        </div>
      </div>
    </section>
  );
}
