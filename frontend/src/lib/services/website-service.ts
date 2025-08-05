import { apiClient } from './api-client'

export interface Website {
  id: number
  name: string
  domain: string
  widget_key: string
  max_users: number
  is_active: boolean
  settings: WebsiteSettings
  created_at: string
  updated_at: string
}

export interface WebsiteSettings {
  theme: string
  primary_color: string
  position: string
  welcome_message: string
  offline_message: string
  language: string
  translation_enabled: boolean
  moderation_enabled: boolean
  custom_css: string
  allowed_domains: string[]
  business_hours: Record<string, string>
}

export interface CreateWebsiteRequest {
  name: string
  domain: string
  max_users?: number
}

export interface UpdateWebsiteRequest {
  name?: string
  domain?: string
  max_users?: number
  is_active?: boolean
  settings?: WebsiteSettings
}

export interface WebsiteStats {
  total_chats: number
  active_chats: number
  total_messages: number
  avg_response_time: number
  conversion_rate: number
}

export interface WebsiteSearchParams {
  query?: string
  status?: 'active' | 'inactive'
  page?: number
  limit?: number
}

class WebsiteService {
  async getWebsites(params?: WebsiteSearchParams): Promise<Website[]> {
    const searchParams = new URLSearchParams()
    
    if (params?.query) searchParams.append('query', params.query)
    if (params?.status) searchParams.append('status', params.status)
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    
    const response = await apiClient.get(`/websites?${searchParams.toString()}`)
    return response.data
  }

  async getWebsite(id: number): Promise<Website> {
    const response = await apiClient.get(`/websites/${id}`)
    return response.data
  }

  async createWebsite(data: CreateWebsiteRequest): Promise<Website> {
    const response = await apiClient.post('/websites', data)
    return response.data
  }

  async updateWebsite(id: number, data: UpdateWebsiteRequest): Promise<Website> {
    const response = await apiClient.put(`/websites/${id}`, data)
    return response.data
  }

  async deleteWebsite(id: number): Promise<void> {
    await apiClient.delete(`/websites/${id}`)
  }

  async toggleWebsiteStatus(id: number): Promise<Website> {
    const response = await apiClient.post(`/websites/${id}/toggle-status`)
    return response.data
  }

  async getWebsiteStats(id: number): Promise<WebsiteStats> {
    const response = await apiClient.get(`/websites/${id}/stats`)
    return response.data
  }

  async regenerateWidgetKey(id: number): Promise<Website> {
    const response = await apiClient.post(`/websites/${id}/regenerate-key`)
    return response.data
  }

  async updateWebsiteSettings(id: number, settings: WebsiteSettings): Promise<Website> {
    const response = await apiClient.put(`/websites/${id}/settings`, { settings })
    return response.data
  }

  async searchWebsites(query: string): Promise<Website[]> {
    const response = await apiClient.get(`/websites/search?query=${encodeURIComponent(query)}`)
    return response.data
  }
}

export const websiteService = new WebsiteService() 