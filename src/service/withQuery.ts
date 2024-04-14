import { makeAutoObservable, onBecomeObserved, onBecomeUnobserved } from "mobx";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export class WithQuery<TData, TResult = TData> {
  refetchIntervalId?: ReturnType<typeof setInterval> | null = null;

  constructor(
    private axiosConfig: AxiosRequestConfig,
    private readonly viewConfig?: {
      loadOnMount?: boolean;
      onError?: (error: unknown) => void;
      onSuccess?: (data: TData) => void;
      transform?: (data: TData) => TResult;
      refetchInterval?: number;
    },
    private queryOptions: {
      skipToken?: boolean;
      useTimeout?: boolean;
    } = {}
  ) {
    makeAutoObservable(this);
    this.viewConfig = { loadOnMount: true, ...this.viewConfig };
    if (this.viewConfig.loadOnMount) {
      onBecomeObserved(this, "data", this.load);
    }
    if (this.viewConfig.refetchInterval !== undefined) {
      onBecomeObserved(this, "data", this.startRefetching);
      onBecomeUnobserved(this, "data", () => {
        this.stopRefetching();
      });
    }
  }

  isLoading?: boolean;
  started = false;
  state: "fulfilled" | "pending" | "rejected" = "pending";
  data?: TResult = undefined;
  error?: unknown;

  startRefetching = () => {
    this.load();
    if (this.viewConfig?.refetchInterval) {
      this.refetchIntervalId = setInterval(
        this.load,
        this.viewConfig?.refetchInterval
      );
    }
  };

  stopRefetching = () => {
    if (this.refetchIntervalId) {
      clearInterval(this.refetchIntervalId);
      this.refetchIntervalId = null;
    }
  };

  load = async () => {
    try {
      this.started = true;
      this.isLoading = true;
      const { data } = await this.Request(this.axiosConfig, this.queryOptions);
      this.data = this.viewConfig?.transform
        ? this.viewConfig.transform(data)
        : (data as TResult);
      this.state = "fulfilled";
      this.viewConfig?.onSuccess?.(
        this.viewConfig?.transform ? this.data : data
      );
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Request canceled", error.message);
      } else {
        this.error = error;
        this.state = "rejected";
        this.viewConfig?.onError?.(this.error);
      }
    } finally {
      this.isLoading = false;
    }
  };

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
