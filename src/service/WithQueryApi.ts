import { makeAutoObservable, onBecomeObserved, onBecomeUnobserved } from "mobx";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export class WithQuery<TData, TResult extends TData = TData> {
  private isQueryLoading?: boolean = false;
  private isQuerySuccess?: boolean = false;
  private isQueryError?: boolean = false;
  private queryData?: TResult = undefined;
  private error?: unknown;
  //
  private interval?: ReturnType<typeof setInterval> | null = null;

  constructor(
    private axiosConfig: AxiosRequestConfig,
    private readonly options: {
      loadOnMount?: boolean;
      onError?: (error: unknown) => void;
      onSuccess?: (data: TData) => void;
      transform?: (data: TData) => TResult;
      refetchInterval?: number;
      retryCount?: number;
      retry?: boolean;
      retryDelay?: number;
    },
    private queryOptions: {
      skipToken?: boolean;
      useTimeout?: boolean;
    } = {}
  ) {
    makeAutoObservable(this, {}, { autoBind: true });

    this.options = {
      loadOnMount: true,
      retry: true,
      retryCount: 3,
      retryDelay: 1000,
      ...this.options,
    };

    if (this.options.loadOnMount) {
      onBecomeObserved(this, "data", this.queryFn);
    }
    if (this.options.refetchInterval) {
      onBecomeObserved(this, "data", () => this.withIntervalQuery());
      onBecomeUnobserved(this, "data", () => this.stopInterval());
    }
  }

  get isLoading() {
    return this.isQueryLoading;
  }

  get isSuccess() {
    return this.isQuerySuccess;
  }

  get isError() {
    return this.isQueryError;
  }

  get data() {
    return this.queryData;
  }

  private setIsLoading(value: boolean) {
    this.isQueryLoading = value;
  }

  private setIsSuccess(value: boolean) {
    this.isQuerySuccess = value;
  }

  private setIsError(value: boolean) {
    this.isQueryError = value;
  }

  private setData(data: TResult) {
    if (this.options?.transform) {
      this.queryData = this.options.transform(data);
      return;
    }
    this.queryData = data;
  }

  private setError(value: unknown) {
    this.error = value;
  }

  private withIntervalQuery() {
    if (this.options?.refetchInterval && this.axiosConfig.method === "GET") {
      this.interval = setInterval(
        () => this.queryFn(),
        this.options.refetchInterval
      );
    }
  }

  private stopInterval() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  public async queryFn(retryCount = this.options.retryCount) {
    try {
      this.setIsLoading(true);
      const { data } = await this.Request(this.axiosConfig, this.queryOptions);
      this.setData(data);
      this.setIsError(false);
      this.setError(undefined);
      this.setIsSuccess(true);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      this.options?.onSuccess?.(this.queryData);
    } catch (error) {
      this.setIsError(true);
      this.setError(error);
      if (axios.isCancel(error)) {
        console.log("Request canceled", error.message);
        return;
      }
      this.options?.onError?.(this.error);
      if (
        retryCount &&
        this.options.retryCount &&
        retryCount < this.options.retryCount
      ) {
        setTimeout(() => this.queryFn(retryCount + 1), this.options.retryDelay);
      }
    } finally {
      this.setIsLoading(false);
    }
  }

  private async Request(
    config: AxiosRequestConfig,
    options: {
      skipToken?: boolean;
      useTimeout?: boolean;
    } = {}
  ): Promise<AxiosResponse> {
    const {
      skipToken = false,
      useTimeout = config.method?.toUpperCase() === "GET",
    } = options;

    const source = axios.CancelToken.source();
    config.cancelToken = source.token;

    if (config.signal && config.signal instanceof AbortSignal) {
      config.signal?.addEventListener("abort", () => {
        source.cancel("Operation canceled by the user.");
      });
    }

    if (skipToken) {
      config = { ...config, headers: { skipToken: true } };
    }

    if (useTimeout) {
      config.timeout = config.timeout ? config.timeout : 10000;
    }
    return axios.request(config);
  }
}
