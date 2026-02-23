export type NetworkStatus = 'good' | 'fair' | 'poor' | 'offline';

export const determineNetworkStatus = (latency: number | null, isOffline: boolean): NetworkStatus => {
  if (isOffline || latency === null) return 'offline';
  if (latency < 100) return 'good';
  if (latency < 300) return 'fair';
  return 'poor';
};
