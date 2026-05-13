import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen overflow-hidden bg-offwhite text-darknavy">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(87,196,229,0.20),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(249,112,104,0.18),transparent_30%),linear-gradient(135deg,rgba(236,242,239,1),rgba(255,255,255,1))]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(87,196,229,0.18),transparent_68%)]" />

      <div className="relative mx-auto flex w-full max-w-7xl items-center px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        <section className="w-full">
          <div className="mx-auto max-w-6xl">
            <div className="flex justify-center">
              <Image
                src="/img/404-background.png"
                alt="Illustration for a 404 page not found error."
                width={1536}
                height={1152}
                priority
                className="h-auto w-full max-w-3xl lg:max-w-xl"
              />
            </div>

            <div className="mx-auto mt-3 max-w-2xl text-center sm:mt-1">
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                This page wandered off the ledger.
              </h1>
              <p className="mt-4 text-base leading-7 text-darknavy/70 sm:text-lg">
                The link may be outdated, the address may be mistyped, or the
                page may have been moved. Let&apos;s get you back to something
                useful.
              </p>
            </div>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full bg-darknavy px-6 py-3 text-sm font-semibold text-offwhite transition hover:bg-coralpink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink focus-visible:ring-offset-2"
              >
                Return home
              </Link>
              <a
                href="mailto:legal@gr8booklite.com"
                className="inline-flex items-center justify-center rounded-full border border-darknavy/15 bg-white px-6 py-3 text-sm font-semibold text-darknavy transition hover:border-darknavy/30 hover:bg-darknavy/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue focus-visible:ring-offset-2"
              >
                Contact us
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
