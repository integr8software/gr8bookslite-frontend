import type { AxiosRequestConfig } from "axios";
import axios from "axios";
import { ApiClient } from "./ApiClient";
import { BuildApiRequestDedupeKey, RunDedupedApiRequest } from "./ApiRequestDeduper";

type CancelablePromise<T> = Promise<T> & {
  cancel?: () => void;
};

export function OrvalApiClient<T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): CancelablePromise<T> {
  const abortController = new AbortController();
  const signal = config.signal ?? options?.signal ?? abortController.signal;
  const url = typeof config.url === "string" ? config.url.replace(/^\/api(?:\/api)?\/v\d+(?=\/)/, "") : config.url;
  const requestConfig = {
    ...config,
    ...options,
    url,
    signal,
  };
  const key = BuildApiRequestDedupeKey({
    baseURL: requestConfig.baseURL,
    data: requestConfig.data,
    method: requestConfig.method,
    params: requestConfig.params,
    url: requestConfig.url,
  });
  const promise = RunDedupedApiRequest({ key }, () => ApiClient(requestConfig).then(({ data }) => data as T)) as CancelablePromise<T>;

  promise.cancel = () => {
    abortController.abort();
  };

  return promise;
}

export function isOrvalApiCancel(error: unknown) {
  return axios.isCancel(error);
}
