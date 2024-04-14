import axios, { type AxiosRequestConfig, AxiosResponse } from "axios";


const NETWORK_TIMEOUT = 10000;
type AsyncResult<T> = [null,  T] | [Error, null];

axios.interceptors.request.use(
   config => {
      config.withCredentials = true;
      const token = sessionStorage.getItem("token");
      const skipToken = config.headers.skipToken && config.headers.skipToken === "true";
      if (skipToken || !token) return config;
      if (token) {
         config.headers.Authorization = `Token ${token}`;
      }
      return config;
   },
   error => Promise.reject(error),
);

export class BaseApi {
   //helper to return tuple with [err,data]

   // static handleMessage(error: AxiosError) {
   //    let m;
   //    if (error.code === "ECONNABORTED") {
   //       // toast.error(i18n.t("Operation timeout"));
   //       return;
   //    }
   //    switch (error?.response?.status) {
   //       case 500:
   //          m = "notAvailable";
   //          break;
   //       default:
   //    }
   //    toast.error(i18n.t(m ? m : "someError"));
   // }

   /**
    * @description return promise with tuple result [error, null] or [null,data]
    * @description where data type : TBaseResponse & T
    * @description handleMessage - method for show error toasts
    * @description type AsyncResult<T> = [null, TBaseResponse & T] | [Error, null]
    */
   static async handle<T>(
      promise: Promise<AxiosResponse<T>>,
   ): Promise<AsyncResult<T>> {
      try {
         const { data } = await promise;
         return [null, data];
         // eslint-disable-next-line
		} catch (err: any) {
         const { response: error } = err;
         if (!axios.isCancel(err) && error && "status" in error) {
            // this.handleMessage(error);
         }
         return [err as Error, null];
      }
   }

   /**
    * @description <T> - second generic type , added to TBaseResponseType
    */
   static async Request<T>(
      config: AxiosRequestConfig,
      options: {
         skipToken?: boolean;
         useTimeout?: boolean;
      } = {},
   ): Promise<AsyncResult<T>> {
      const { skipToken = false, useTimeout = config.method?.toUpperCase() === "GET" } = options;

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
         config.timeout = config.timeout ? config.timeout : NETWORK_TIMEOUT;
      }

      const [err, data] = await this.handle(axios.request(config));

      return err
         ? [err, null] // Error
         : data?.resultCode !== 0
           ? [new Error(data.message), null] //string error
           : [null, data]; // data T
   }
}
