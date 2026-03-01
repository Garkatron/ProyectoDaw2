import { API } from "../services/base.service";
import { useState, useCallback } from "react";

export function useApi(defaultData = null) {
  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (config) => {
    setLoading(true);
    setError(null);

    try {
      console.info("useApi API CONFIG:", config);
      const res = await API(config);

      const payload =
        res.data && typeof res.data === "object" && "data" in res.data
          ? res.data.data
          : res.data;

      setData(payload);
      return payload;
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Request error"
      );
      setData(defaultData);
      console.error("Error fetching data with useApi.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, request };
}