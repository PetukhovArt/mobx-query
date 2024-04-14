import { makeAutoObservable } from "mobx";
import { WithQuery } from "@/service/withQuery.ts";

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
      url: `https://jsonplaceholder.typicode.com/posts`,
    },
    {
      // onError: (error) => {
      //   console.error("error", error);
      // },
      // onSuccess: (data) => {
      //   console.log("success");
      // },
      // refetchInterval: 3000,
    }
  );
}
