import { useCallback, useEffect, useRef, useState } from "react";

// Minimal fetch-on-mount(+deps-change) hook — the hand-rolled substitute
// for TanStack Query the plan calls for (no query-library dependency).
// `fetcher` re-runs whenever any value in `deps` changes; `refetch()`
// re-runs it manually (e.g. after a mutation elsewhere on the page).
export function useQuery(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetcherRef.current();
      setState({ data, error: null, loading: false });
    } catch (error) {
      setState({ data: null, error, loading: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  return { ...state, refetch: run };
}
