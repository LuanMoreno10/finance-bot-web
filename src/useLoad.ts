import { useCallback, useEffect, useState } from "react";

import { SessionExpiredError } from "./api";

export function useLoad<T>(load: () => Promise<T>, onSessionExpired: () => void) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    load()
      .then(setData)
      .catch((err: unknown) => {
        if (err instanceof SessionExpiredError) onSessionExpired();
        else setError(err instanceof Error ? err.message : "Ocorreu um erro.");
      })
      .finally(() => setLoading(false));
  }, [load, onSessionExpired]);

  useEffect(reload, [reload]);

  return { data, error, loading, reload };
}
