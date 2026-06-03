"use client";

import { Home, RefreshCw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset?: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className="flex h-dvh w-screen items-center justify-center bg-offwhite px-6 text-darknavy">
            <section className="w-full max-w-md text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-coralpink/15 text-coralpink">
                    <TriangleAlert className="h-10 w-10" aria-hidden />
                </div>

                <h1 className="text-3xl font-bold">
                    Something went wrong
                </h1>

                <p className="mt-3 text-sm leading-6 text-darknavy/70">
                    We hit an unexpected error while loading this page. Try again
                    or return home.
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => reset?.()}
                        disabled={!reset}
                        className="inline-flex items-center gap-2 rounded-xl bg-skyblue px-5 py-3 text-sm font-semibold text-darknavy shadow-sm transition hover:bg-skyblue/90 disabled:pointer-events-none disabled:opacity-50"
                    >
                        <RefreshCw className="h-4 w-4" aria-hidden />
                        Try Again
                    </button>

                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-xl border border-darknavy/10 bg-white px-5 py-3 text-sm font-semibold text-darknavy shadow-sm transition hover:bg-white/80"
                    >
                        <Home className="h-4 w-4" aria-hidden />
                        Return Home
                    </Link>
                </div>
            </section>
        </main>
    );
}