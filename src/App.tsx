import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Basic } from "./examples/WithContextBasic";
import { WithQueryStore } from "@/service/WithQueryStore.ts";

export const App = observer(() => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
        staleTime: Infinity,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <TestWithQuery />
        <Basic />
      </div>
    </QueryClientProvider>
  );
});

export const TestWithQuery = observer(() => {
  const [store] = useState(() => new WithQueryStore());

  if (store.postsData.isLoading) return <div>Loading...</div>;

  if (store.postsData.error) {
    console.log(store.postsData.error);
    // return <div>{'An error has occurred: ' + error.message}</div>;
  }

  return (
    <ul>
      {store.postsData.data?.map((u) => (
        <li key={u.id}>{u.title}</li>
      ))}
    </ul>
  );
});
