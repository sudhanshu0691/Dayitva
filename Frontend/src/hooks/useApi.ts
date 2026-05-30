// ============================================================
// useApi Hook
// Hook for making API calls with loading and error states
// ============================================================

"use client";

import { useState, useCallback } from "react";
import toast from "react-hot-toast";

interface UseApiState {
  loading: boolean;
  error: Error | null;
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>
) {
  const [state, setState] = useState<UseApiState>({
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setState({ loading: true, error: null });
      try {
        const result = await apiFunction(...args);
        return result;
      } catch (error) {
        const err = error as Error;
        setState({ loading: false, error: err });
        toast.error(err.message || "An error occurred");
        return null;
      } finally {
        setState({ loading: false, error: null });
      }
    },
    [apiFunction]
  );

  return {
    ...state,
    execute,
  };
}
