import { useQuery } from "@tanstack/react-query";
import { ILHA_QUERY_KEY, ILHA_QUERY_STALE_MS } from "../constants";
import { fetchIlhaResumo } from "../services/ilhaService";
import { normalize } from "../utils/normalize";
import type { IlhaResumo } from "../types";

export function useIlhaData() {
  return useQuery<IlhaResumo, Error>({
    queryKey: ILHA_QUERY_KEY,
    queryFn: async () => normalize(await fetchIlhaResumo()),
    staleTime: ILHA_QUERY_STALE_MS,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
