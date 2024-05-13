import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { WithQueryStore } from "@/service/PostsService.ts";
import {TestComponents} from '@/different/TestComponents.tsx';

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
      {/*<TestWithQuery />*/}
      <TestComponents/>
    </QueryClientProvider>
  );
});

export const TestWithQuery = observer(() => {
  const [store] = useState(() => new WithQueryStore());

  // if (store.postsData.isLoading) return <div>Loading...</div>;

  if (store.postsData.isError) {
    console.log("error");
  }

  return (
    <div style={{ overflow: "auto", height: "100%" }}>
      <ul>
        {store.postsData.data?.map((u) => (
          <li key={u.id}>{u.title}</li>
        ))}
      </ul>
    </div>
  );
});
