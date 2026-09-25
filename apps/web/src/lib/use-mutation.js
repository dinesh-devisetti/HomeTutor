import { useCallback, useState } from "react";

// Wraps an async action (create/update/transition call) with loading/error
// state and a trigger function — the hand-rolled substitute for TanStack
// Query's useMutation. Re-throws on failure so callers can also show a
// form-level error message alongside this hook's .error.
export function useMutation(mutationFn) {
  const [state, setState] = useState({ loading: false, error: null });

  const mutate = useCallback(
    async (...args) => {
      setState({ loading: true, error: null });
      try {
        const result = await mutationFn(...args);
        setState({ loading: false, error: null });
        return result;
      } catch (error) {
        setState({ loading: false, error });
        throw error;
      }
    },
    [mutationFn]
  );

  return { ...state, mutate };
}
