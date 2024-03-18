import { QueryCache, QueryClientConfig } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

export const queryClientOptions: QueryClientConfig = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      // refetchOnMount: false,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      retry: 2,
      staleTime: 20000,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.log(error, query);
      if (query.meta?.errorMessage) {
        toast.error(query.meta.errorMessage as string);
      } else {
        toast.error(JSON.stringify(error));
      }
    },
  }),
};
