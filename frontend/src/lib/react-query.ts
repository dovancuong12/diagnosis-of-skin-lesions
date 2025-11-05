import { QueryClient, DefaultOptions } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

const queryConfig: DefaultOptions = {
  queries: {
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  },
};

export const queryClient = new QueryClient({ defaultOptions: queryConfig });

export const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

