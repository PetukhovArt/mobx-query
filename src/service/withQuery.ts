/* import { makeAutoObservable, onBecomeObserved } from "mobx"

export class WithQuery<TData, TResult = TData> {
  constructor(
    private method: (...args: any) => Promise<TData>,
    private config?: {
      loadOnMount?: boolean
      onError?: () => void
      onSuccess?: (data: TData) => void
      transform?: (data: TData) => TResult
    },
  ) {
    makeAutoObservable(this)
    this.config = { loadOnMount: true, ...this.config }
    if (this.config.loadOnMount) onBecomeObserved(this, "data", this.load)
  }

  isLoading?: boolean
  started = false
  state: "fulfilled" | "pending" | "rejected" = "pending"
  data?: TResult = undefined
  error?: unknown

  load = async (...args: any) => {
    try {
      this.started = true
      this.isLoading = true

      const result = await this.method(args)
      this.data = this.config?.transform
        ? this.config.transform(result)
        : (result as TResult)

      this.state = "fulfilled"
      this.config?.onSuccess?.(result)
    } catch (error) {
      this.error = error
      this.state = "rejected"
      this.config?.onError?.()
    } finally {
      this.isLoading = false
      return this.data as TData
    }
  }
} */

import { makeAutoObservable, onBecomeObserved, onBecomeUnobserved } from 'mobx';
import axios from 'axios';

export class WithQuery<TData, TResult = TData> {
  refetchIntervalId?: number | null;
  constructor(
    private method: (...args: any) => Promise<TData>,
    private config?: {
      loadOnMount?: boolean;
      onError?: () => void;
      onSuccess?: (data: TData) => void;
      transform?: (data: TData) => TResult;
      refetchInterval?: number; // Добавляем новую опцию для интервала повторения
    }
  ) {
    makeAutoObservable(this);
    this.config = { loadOnMount: true, ...this.config };
    if (this.config.loadOnMount) {
      onBecomeObserved(this, 'data', this.load);
    }
    if (this.config.refetchInterval) {
      onBecomeObserved(this, 'data', this.startRefetching);
      onBecomeUnobserved(this, 'data', () => {
        this.stopRefetching;
        this.refetchIntervalId = null;
      });
    }
  }

  isLoading?: boolean;
  started = false;
  state: 'fulfilled' | 'pending' | 'rejected' = 'pending';
  data?: TResult = undefined;
  error?: unknown;

  startRefetching = () => {
    this.load();
    if (this.config?.refetchInterval) {
      this.refetchIntervalId = window.setInterval(
        this.load,
        this.config.refetchInterval
      );
    }
  };

  stopRefetching = () => {
    if (this.refetchIntervalId) {
      clearInterval(this.refetchIntervalId);
    }
  };

  load = async (...args: any) => {
    try {
      this.started = true;
      this.isLoading = true;

      const response = await axios(this.method(args));
      const result = response.data;
      this.data = this.config?.transform
        ? this.config.transform(result)
        : (result as TResult);

      this.state = 'fulfilled';
      this.config?.onSuccess?.(result);
    } catch (error) {
      this.error = error;
      this.state = 'rejected';
      this.config?.onError?.();
    } finally {
      this.isLoading = false;
      return this.data as TData;
    }
  };
}
