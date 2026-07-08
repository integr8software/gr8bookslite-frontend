import type { ModuleHelpArticle } from "@/app/src/types/shared/module/ModuleHelpTypes";

export function getHelpArticleForPath(
  pathname: string,
  articles: ModuleHelpArticle[],
) {
  return (
    [...articles]
      .sort((first, second) => second.path.length - first.path.length)
      .find(
        (article) =>
          pathname === article.path || pathname.startsWith(`${article.path}/`),
      ) ?? articles[0]
  );
}

export function createHelpArticle(
  key: string,
  title: string,
  path: string,
  summary: string,
  content: string[],
  relatedKeys: string[],
): ModuleHelpArticle {
  return {
    key,
    title,
    path,
    summary,
    content,
    relatedKeys,
  };
}
