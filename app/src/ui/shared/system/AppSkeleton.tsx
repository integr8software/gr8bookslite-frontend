"use client";

type AppSkeletonProps = {
  className?: string;
};

type AppSkeletonCardProps = {
  children: React.ReactNode;
  className?: string;
};

function JoinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function AppSkeleton({ className }: AppSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={JoinClasses(
        "rounded-full bg-darknavy/12 animate-pulse motion-reduce:animate-none",
        className,
      )}
    />
  );
}

export function AppSkeletonCard({ children, className }: AppSkeletonCardProps) {
  return (
    <section
      aria-hidden="true"
      className={JoinClasses(
        "rounded-3xl border border-darknavy/10 bg-white p-8 shadow-sm",
        className,
      )}
    >
      {children}
    </section>
  );
}
