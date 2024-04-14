import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Store } from './service/store';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { Basic } from './examples/WithContextBasic';

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
  const [store] = useState(() => new Store());
  const { isLoading, users, error } = store.users;

  if (isLoading) return <div>Loading...</div>;

  if (error) {
    return <div>{'An error has occurred: ' + error.message}</div>;
  }

  return (
    <ul>
      {store.users.data?.map((u) => (
        <li>{u.title}</li>
      ))}
    </ul>
  );
});
