import useSWR, { SWRConfiguration, mutate } from 'swr'
import { apiClient } from '@/lib/api-client'

// Global SWR configuration
export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 2000,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
}

// Generic API hook
export function useApi<T>(
  key: string | null,
  fetcher?: (url: string) => Promise<T>,
  config?: SWRConfiguration
) {
  const defaultFetcher = async (url: string): Promise<T> => {
    const response = await apiClient.get(url)
    return response.data
  }

  return useSWR<T>(
    key,
    fetcher || defaultFetcher,
    {
      ...swrConfig,
      ...config,
    }
  )
}

// Website-specific hooks
export function useWebsites(config?: SWRConfiguration) {
  return useApi<any[]>('/websites', undefined, config)
}

export function useWebsite(id: number | null, config?: SWRConfiguration) {
  return useApi<any>(id ? `/websites/${id}` : null, undefined, config)
}

export function useWebsiteStats(id: number | null, config?: SWRConfiguration) {
  return useApi<any>(id ? `/websites/${id}/stats` : null, undefined, config)
}

// Analytics hooks
export function useDashboardMetrics(config?: SWRConfiguration) {
  return useApi<any>('/analytics/dashboard', undefined, config)
}

export function useWebsiteAnalytics(
  websiteId: number | null,
  filters?: { date_from?: string; date_to?: string },
  config?: SWRConfiguration
) {
  const params = new URLSearchParams()
  if (filters?.date_from) params.append('date_from', filters.date_from)
  if (filters?.date_to) params.append('date_to', filters.date_to)

  const key = websiteId ? `/websites/${websiteId}/analytics?${params.toString()}` : null
  return useApi<any>(key, undefined, config)
}

// Chat hooks
export function useChats(websiteId: number | null, config?: SWRConfiguration) {
  return useApi<any[]>(websiteId ? `/websites/${websiteId}/chats` : null, undefined, config)
}

export function useChat(chatId: number | null, config?: SWRConfiguration) {
  return useApi<any>(chatId ? `/chats/${chatId}` : null, undefined, config)
}

export function useChatMessages(chatId: number | null, config?: SWRConfiguration) {
  return useApi<any[]>(chatId ? `/chats/${chatId}/messages` : null, undefined, config)
}

// Widget hooks
export function useWidgetThemes(config?: SWRConfiguration) {
  return useApi<any[]>('/widget/themes', undefined, config)
}

export function useWidgetPositions(config?: SWRConfiguration) {
  return useApi<any[]>('/widget/positions', undefined, config)
}

// User hooks
export function useUserProfile(config?: SWRConfiguration) {
  return useApi<any>('/user/profile', undefined, config)
}

// Optimistic updates
export async function optimisticUpdate<T>(
  key: string,
  updateFn: (data: T) => T,
  revalidate = true
) {
  await mutate(key, updateFn, false)
  if (revalidate) {
    await mutate(key)
  }
}

// Cache management
export async function invalidateCache(pattern?: string) {
  if (pattern) {
    await mutate(pattern)
  } else {
    await mutate(() => true, undefined, { revalidate: false })
  }
}

// Prefetch data
export async function prefetchData<T>(key: string, fetcher?: (url: string) => Promise<T>) {
  const defaultFetcher = async (url: string): Promise<T> => {
    const response = await apiClient.get(url)
    return response.data
  }

  await mutate(key, fetcher || defaultFetcher, false)
} 