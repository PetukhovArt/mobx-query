import { Context, useContext, useEffect, useRef, useState } from "react";
import { IReactionDisposer, observable, runInAction } from "mobx";

export interface ViewModelConstructor<TContext extends never> {
  systemFileName?: string;
  props?: Record<string, any>;
  context: TContext;
  beforeMount?: () => void;
  afterMount?: () => void;
  beforeUnmount?: () => void;
  autorunDisposers?: Array<IReactionDisposer>;
}

export function createUseStore<TContext extends any>(
  ctx: Context<TContext>,
  options?: {
    beforeMount?: (context: TContext, vm?: any) => void;
    afterMount?: (context: TContext, vm?: any) => void;
    beforeUnmount?: (context: TContext, vm?: any) => void;
  }
) {
  function useStore(): { context: TContext };
  function useStore<
    TViewModel extends new (context: TContext) => ViewModelConstructor<TContext>
  >(ViewModel: TViewModel): { vm: InstanceType<TViewModel>; context: TContext };

  function useStore<
    TViewModel extends new (
      context: TContext,
      p: ConstructorParameters<TViewModel>[1]
    ) => ViewModelConstructor<TContext>
  >(
    ViewModel: TViewModel,
    props: ConstructorParameters<TViewModel>[1],
    exclude?: Partial<Record<keyof ConstructorParameters<TViewModel>[1], false>>
  ): { vm: InstanceType<TViewModel>; context: TContext };

  function useStore(ViewModel?: any, props?: any, exclude?: any) {
    const isFirstRenderRef = useRef(true);
    const context = useContext(ctx);

    useState(() => {
      if (!ViewModel) options?.beforeMount?.(context);
    });

    useEffect(() => {
      if (!ViewModel) options?.afterMount?.(context);

      return () => {
        if (!ViewModel) options?.beforeUnmount?.(context);
      };
    }, []);

    if (!ViewModel) return { context };

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [vm] = useState(() => {
      const instance = new ViewModel(context, observable(props || {}, exclude));

      runInAction(() => {
        options?.beforeMount?.(context, instance);
        instance.beforeMount?.();
      });

      return instance;
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (isFirstRenderRef.current) {
        isFirstRenderRef.current = false;
      } else if (props) {
        runInAction(() => {
          vm.props = observable(props || {}, exclude);
        });
      }
    }, [props]);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      options?.afterMount?.(context, vm);
      vm.afterMount?.();

      return () => {
        options?.beforeUnmount?.(context, vm);
        vm.autorunDisposers?.forEach((disposer: () => void) => disposer());
        vm.beforeUnmount?.();
      };
    }, []);

    return { context, vm };
  }

  return useStore;
}
