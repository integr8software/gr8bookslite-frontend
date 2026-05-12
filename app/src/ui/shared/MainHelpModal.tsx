"use client";

import { BookOpenText, ChevronRight, X } from "lucide-react";
import type { MainHelpArticle } from "@/app/src/data/shared/MainLayoutData";

type MainHelpModalProps = {
  articles: MainHelpArticle[];
  currentArticle: MainHelpArticle;
  selectedArticleKey: string;
  onClose: () => void;
  onSelectArticle: (articleKey: string) => void;
};

export function MainHelpModal({
  articles,
  currentArticle,
  selectedArticleKey,
  onClose,
  onSelectArticle,
}: MainHelpModalProps) {
  const selectedArticle =
    articles.find((article) => article.key === selectedArticleKey) ??
    currentArticle;
  const relatedArticles = currentArticle.relatedKeys
    .map((key) => articles.find((article) => article.key === key))
    .filter((article): article is MainHelpArticle => Boolean(article));
  const remainingArticles = articles.filter(
    (article) =>
      article.key !== currentArticle.key &&
      !currentArticle.relatedKeys.includes(article.key),
  );

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-darknavy/40 px-3 py-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="main-help-title"
    >
      <div className="flex max-h-[min(42rem,calc(100vh-2rem))] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-[0_30px_90px_rgba(33,39,56,0.25)]">
        <div className="flex items-center justify-between gap-3 border-b border-darknavy/10 px-4 py-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-skyblue/15 text-darknavy">
              <BookOpenText className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2
                id="main-help-title"
                className="truncate text-base font-semibold text-darknavy"
              >
                Help manual
              </h2>
              <p className="truncate text-sm text-darknavy/55">
                {currentArticle.title}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close help"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-darknavy/60 transition hover:bg-darknavy/5 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 md:grid-cols-[19rem_1fr]">
          <aside className="min-h-0 overflow-y-auto border-b border-darknavy/10 bg-darknavy/5 p-3 md:border-b-0 md:border-r">
            <ArticleGroup title="Current page">
              <ArticleButton
                article={currentArticle}
                isActive={selectedArticle.key === currentArticle.key}
                onClick={() => onSelectArticle(currentArticle.key)}
              />
            </ArticleGroup>

            <ArticleGroup title="Related">
              {relatedArticles.map((article) => (
                <ArticleButton
                  key={article.key}
                  article={article}
                  isActive={selectedArticle.key === article.key}
                  onClick={() => onSelectArticle(article.key)}
                />
              ))}
            </ArticleGroup>

            <ArticleGroup title="More manuals">
              {remainingArticles.map((article) => (
                <ArticleButton
                  key={article.key}
                  article={article}
                  isActive={selectedArticle.key === article.key}
                  onClick={() => onSelectArticle(article.key)}
                />
              ))}
            </ArticleGroup>
          </aside>

          <article className="min-h-0 overflow-y-auto px-5 py-5 sm:px-7">
            <p className="text-xs font-semibold uppercase text-darknavy/45">
              {selectedArticle.path}
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-darknavy">
              {selectedArticle.title}
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-darknavy/62">
              {selectedArticle.summary}
            </p>

            <div className="mt-6 space-y-4">
              {selectedArticle.content.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-sm leading-6 text-darknavy/72"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

type ArticleGroupProps = {
  children: React.ReactNode;
  title: string;
};

function ArticleGroup({ children, title }: ArticleGroupProps) {
  return (
    <section className="mb-4">
      <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-darknavy/45">
        {title}
      </h3>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

type ArticleButtonProps = {
  article: MainHelpArticle;
  isActive: boolean;
  onClick: () => void;
};

function ArticleButton({ article, isActive, onClick }: ArticleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={joinClasses(
        "flex w-full items-center gap-2 rounded-md px-2 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35",
        isActive
          ? "bg-white text-darknavy shadow-sm"
          : "text-darknavy/65 hover:bg-white/70 hover:text-darknavy",
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">
          {article.title}
        </span>
        <span className="mt-1 block truncate text-xs text-darknavy/45">
          {article.path}
        </span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-darknavy/35" aria-hidden="true" />
    </button>
  );
}

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}
