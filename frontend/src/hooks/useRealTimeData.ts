import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useCallback } from 'react';

interface RealTimeDataOptions {
  queryKey: string[];
  queryFn: () => Promise<any>;
  enabled?: boolean;
  refetchInterval?: number;
}

export const useRealTimeData = ({
  queryKey,
  queryFn,
  enabled = true,
  refetchInterval = 30000, // 30 seconds
}: RealTimeDataOptions) => {
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const query = useQuery({
    queryKey,
    queryFn,
    enabled,
    refetchInterval: enabled ? refetchInterval : false,
  });

  // Manual refresh functionality
  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  // Background refresh when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled) {
        refresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, refresh]);

  // Cleanup interval on unmount
  useEffect(() => {
    const currentInterval = intervalRef.current;
    return () => {
      if (currentInterval) {
        clearInterval(currentInterval);
      }
    };
  }, []);

  return {
    ...query,
    refresh,
    isRealTime: enabled,
  };
};