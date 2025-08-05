import { apiClient } from './api-client'

export interface AnalyticsMetrics {
  total_visitors: number
  total_chats: number
  total_messages: number
  avg_response_time: number
  conversion_rate: number
  satisfaction_score: number
  active_sessions: number
  total_websites: number
}

export interface WebsiteAnalytics {
  website_id: number
  metrics: AnalyticsMetrics
  trends: {
    visitors: { date: string; count: number }[]
    chats: { date: string; count: number }[]
    messages: { date: string; count: number }[]
  }
  top_pages: { page: string; visits: number }[]
  visitor_sources: { source: string; count: number }[]
  languages: { language: string; count: number }[]
}

export interface EventType {
  id: string
  name: string
  description: string
  category: string
}

export interface AnalyticsEvent {
  id: string
  website_id: number
  visitor_id: string
  event_type: string
  event_data: Record<string, any>
  timestamp: number
  page_url?: string
  user_agent?: string
  ip_address?: string
}

export interface VisitorJourney {
  visitor_id: string
  website_id: number
  events: AnalyticsEvent[]
  session_duration: number
  pages_visited: string[]
  first_visit: number
  last_visit: number
}

export interface RealTimeMetrics {
  active_visitors: number
  active_chats: number
  recent_events: AnalyticsEvent[]
  top_pages: { page: string; active_visitors: number }[]
}

export interface AnalyticsFilters {
  date_from?: string
  date_to?: string
  website_id?: number
  event_type?: string
  visitor_id?: string
}

class AnalyticsService {
  async getDashboardMetrics(): Promise<AnalyticsMetrics> {
    const response = await apiClient.get('/analytics/dashboard')
    return response.data
  }

  async getWebsiteAnalytics(websiteId: number, filters?: AnalyticsFilters): Promise<WebsiteAnalytics> {
    const params = new URLSearchParams()
    if (filters?.date_from) params.append('date_from', filters.date_from)
    if (filters?.date_to) params.append('date_to', filters.date_to)

    const response = await apiClient.get(`/websites/${websiteId}/analytics?${params.toString()}`)
    return response.data
  }

  async getEventTypes(): Promise<EventType[]> {
    const response = await apiClient.get('/analytics/event-types')
    return response.data
  }

  async getEventsByType(websiteId: number, eventType: string, filters?: AnalyticsFilters): Promise<AnalyticsEvent[]> {
    const params = new URLSearchParams({ event_type: eventType })
    if (filters?.date_from) params.append('date_from', filters.date_from)
    if (filters?.date_to) params.append('date_to', filters.date_to)

    const response = await apiClient.get(`/websites/${websiteId}/analytics/events?${params.toString()}`)
    return response.data
  }

  async getVisitorJourney(websiteId: number, visitorId: string): Promise<VisitorJourney> {
    const response = await apiClient.get(`/websites/${websiteId}/analytics/visitors/${visitorId}`)
    return response.data
  }

  async getRealTimeMetrics(websiteId: number): Promise<RealTimeMetrics> {
    const response = await apiClient.get(`/websites/${websiteId}/analytics/realtime`)
    return response.data
  }

  async exportAnalytics(websiteId: number, filters?: AnalyticsFilters): Promise<Blob> {
    const params = new URLSearchParams()
    if (filters?.date_from) params.append('date_from', filters.date_from)
    if (filters?.date_to) params.append('date_to', filters.date_to)
    if (filters?.event_type) params.append('event_type', filters.event_type)

    const response = await apiClient.get(`/websites/${websiteId}/analytics/export?${params.toString()}`, {
      responseType: 'blob'
    })
    return response.data
  }

  // Helper methods for data processing
  calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`
  }

  formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`
    }
    if (seconds < 3600) {
      return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
    }
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  getChartData(data: any[], key: string, valueKey: string) {
    return data.map(item => ({
      name: item[key],
      value: item[valueKey]
    }))
  }

  getTimeSeriesData(data: { date: string; count: number }[]) {
    return data.map(item => ({
      date: new Date(item.date).toLocaleDateString(),
      value: item.count
    }))
  }
}

export const analyticsService = new AnalyticsService() 