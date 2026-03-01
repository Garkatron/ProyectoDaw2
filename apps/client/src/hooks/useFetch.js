import { useEffect } from "react";
import { useApi } from "./useApi";

export function useFetch(url, options = {}, defaultData = null) {
  const { data, loading, error, request } = useApi(defaultData);

  useEffect(() => {
    if (!url) return;
    request({ url, method: "GET", ...options });
  }, [url]);

  return [data, loading, error];
}