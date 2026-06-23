"use client";

import { useEffect, useRef, useState } from "react";

export function useRemoteData(loadData, { initialData, onError, dependencyKey } = {}) {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const loadDataRef = useRef(loadData);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    loadDataRef.current = loadData;
    onErrorRef.current = onError;
  }, [loadData, onError]);

  const refresh = async () => {
    try {
      setIsRefreshing(true);
      const nextData = await loadDataRef.current();
      setData(nextData);
      return nextData;
    } catch (error) {
      onErrorRef.current?.(error);
      return null;
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        if (isMounted) {
          setIsLoading(true);
        }
        const nextData = await loadDataRef.current();
        if (isMounted) {
          setData(nextData);
        }
      } catch (error) {
        if (isMounted) {
          onErrorRef.current?.(error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [dependencyKey]);

  return {
    data,
    setData,
    isLoading,
    isRefreshing,
    refresh,
  };
}
