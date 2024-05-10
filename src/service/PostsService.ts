import { makeAutoObservable } from "mobx";
import { WithQuery } from "@/service/WithQueryApi.ts";

export type TPost = {
  id: number;
  title: string;
  body: string;
  userId: number;
};

export class WithQueryStore {
  constructor() {
    makeAutoObservable(this);
  }

  postsData = new WithQuery<TPost[]>(
    {
      method: "GET",
      url: `https://jsonplaceholder.typicode.com/p`,
    },
    {
      onError: (error) => {
        console.error("error", error);
      },
      onSuccess: (data) => {
        console.log("response", data);
      },
      refetchInterval: 500,
    }
  );
}
