import { observer } from 'mobx-react-lite';
import { createContext } from 'react';
import { observable } from 'mobx';
import { createUseStore } from '@/createUseStore';

const StoreContext = createContext(undefined); // any context
const useStore = createUseStore(StoreContext);

export const Basic = observer(() => {
  return (
    <StoreContext.Provider value={observable({ ui: {}, user: {}, api: {} })}>
      <Component />
    </StoreContext.Provider>
  );
});

const Component = observer(() => {
  const { context } = useStore();
  return <div>{context.user.name}</div>;
});
