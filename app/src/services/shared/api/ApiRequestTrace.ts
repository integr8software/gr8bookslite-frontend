import type { InternalAxiosRequestConfig } from "axios";

const ApiRequestTraceStorageKey = "gr8booksneo.debugRequests";

const RequestTraceState = new WeakMap<
  InternalAxiosRequestConfig,
  {
    method: string;
    startedAt: number;
    url: string;
  }
>();

export function StartApiRequestTrace(config: InternalAxiosRequestConfig) {
  if (!IsApiRequestTraceEnabled()) {
    return;
  }

  const method = (config.method ?? "GET").toUpperCase();
  const url = BuildRequestUrl(config);
  const startedAt = performance.now();

  RequestTraceState.set(config, {
    method,
    startedAt,
    url,
  });
  console.info(`[api] ${method} ${url} started`);
}

export function FinishApiRequestTrace(
  config: InternalAxiosRequestConfig | undefined,
  status: number | undefined,
) {
  if (!config || !IsApiRequestTraceEnabled()) {
    return;
  }

  const trace = RequestTraceState.get(config);

  if (!trace) {
    return;
  }

  RequestTraceState.delete(config);
  const elapsedMs = Math.round(performance.now() - trace.startedAt);
  const statusLabel = status == null ? "failed" : String(status);

  console.info(
    `[api] ${trace.method} ${trace.url} ${statusLabel} in ${elapsedMs}ms`,
  );
}

function IsApiRequestTraceEnabled() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(ApiRequestTraceStorageKey) === "true";
}

function BuildRequestUrl(config: InternalAxiosRequestConfig) {
  if (!config.params) {
    return config.url ?? "";
  }

  const searchParams = new URLSearchParams();

  Object.entries(config.params as Record<string, unknown>).forEach(
    ([key, value]) => {
      if (value == null) {
        return;
      }

      searchParams.set(key, String(value));
    },
  );

  const query = searchParams.toString();

  return query ? `${config.url ?? ""}?${query}` : (config.url ?? "");
}
