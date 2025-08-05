import { toast } from 'sonner'

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

// Types
export interface User {
  id: number
  email: string
  name: string
  plan: string
  is_active: boolean
  created_at: string
  updated_at: string
}

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

export interface Chat {
  id: number
  website_id: number
  session_id: string
  visitor_ip: string
  user_agent: string
  language: string
  is_active: boolean
  started_at: string
  ended_at?: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: number
  chat_id: number
  content: string
  original_content: string
  sender: string
  language: string
  translated: boolean
  moderated: boolean
  flagged: boolean
  timestamp: string
  created_at: string
  updated_at: string
}

export interface DashboardMetrics {
  total_visitors: number
  total_page_views: number
  total_chats: number
  total_messages: number
  conversion_rate: number
  avg_chat_duration: number
  top_pages: PageMetric[]
  top_countries: CountryMetric[]
  hourly_activity: HourlyMetric[]
  daily_activity: DailyMetric[]
  chat_satisfaction: SatisfactionMetric[]
  response_times: ResponseTimeMetric[]
}

export interface PageMetric {
  page: string
  views: number
  visitors: number
  avg_time: number
}

export interface CountryMetric {
  country: string
  visitors: number
  chats: number
}

export interface HourlyMetric {
  hour: number
  visitors: number
  chats: number
  messages: number
}

export interface DailyMetric {
  date: string
  visitors: number
  chats: number
  messages: number
}

export interface SatisfactionMetric {
  rating: number
  count: number
}

export interface ResponseTimeMetric {
  time_range: string
  avg_time: number
  count: number
}

export interface TokenPair {
  access_token: string
  refresh_token: string
  expires_in: number
}

export interface ApiResponse<T> {
  data?: T
  message?: string
  error?: string
  details?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  limit: number
  total: number
  total_pages: number
}

// API Client Class
class ApiClient {
  private baseURL: string
  private accessToken: string | null = null
  private refreshToken: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.loadTokensFromStorage()
  }

  private loadTokensFromStorage() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token')
      this.refreshToken = localStorage.getItem('refresh_token')
    }
  }

  private saveTokensToStorage(tokens: TokenPair) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', tokens.access_token)
      localStorage.setItem('refresh_token', tokens.refresh_token)
      localStorage.setItem('token_expires_at', (Date.now() + tokens.expires_in * 1000).toString())
    }
    this.accessToken = tokens.access_token
    this.refreshToken = tokens.refresh_token
  }

  private clearTokensFromStorage() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('token_expires_at')
    }
    this.accessToken = null
    this.refreshToken = null
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: this.refreshToken,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        this.saveTokensToStorage(data.tokens)
        return true
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
    }

    this.clearTokensFromStorage()
    return false
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`
    }

    let response = await fetch(url, {
      ...options,
      headers,
    })

    // Handle token refresh
    if (response.status === 401 && this.refreshToken) {
      const refreshed = await this.refreshAccessToken()
      if (refreshed) {
        headers.Authorization = `Bearer ${this.accessToken}`
        response = await fetch(url, {
          ...options,
          headers,
        })
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const error = new Error(errorData.error || `HTTP ${response.status}`)
      ;(error as any).status = response.status
      ;(error as any).details = errorData.details
      throw error
    }

    return response.json()
  }

  // Authentication
  async register(email: string, password: string, name: string): Promise<{ user: User; tokens: TokenPair }> {
    const response = await this.request<{ user: User; tokens: TokenPair }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    })
    
    this.saveTokensToStorage(response.tokens)
    return response
  }

  async login(email: string, password: string): Promise<{ user: User; tokens: TokenPair }> {
    const response = await this.request<{ user: User; tokens: TokenPair }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    
    this.saveTokensToStorage(response.tokens)
    return response
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' })
    } finally {
      this.clearTokensFromStorage()
    }
  }

  // User Profile
  async getProfile(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/user/profile')
  }

  async updateProfile(name: string): Promise<{ user: User }> {
    return this.request<{ user: User }>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify({ name }),
    })
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.request('/user/change-password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    })
  }

  // Websites
  async getWebsites(page = 1, limit = 10): Promise<PaginatedResponse<Website>> {
    return this.request<PaginatedResponse<Website>>(`/websites?page=${page}&limit=${limit}`)
  }

  async createWebsite(name: string, domain: string, maxUsers = 100): Promise<{ website: Website }> {
    return this.request<{ website: Website }>('/websites', {
      method: 'POST',
      body: JSON.stringify({
        name,
        domain,
        max_users: maxUsers,
      }),
    })
  }

  async getWebsite(id: number): Promise<{ website: Website }> {
    return this.request<{ website: Website }>(`/websites/${id}`)
  }

  async updateWebsite(id: number, data: Partial<Website>): Promise<{ website: Website }> {
    return this.request<{ website: Website }>(`/websites/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteWebsite(id: number): Promise<void> {
    await this.request(`/websites/${id}`, { method: 'DELETE' })
  }

  async updateWebsiteSettings(id: number, settings: WebsiteSettings): Promise<{ website: Website }> {
    return this.request<{ website: Website }>(`/websites/${id}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    })
  }

  async toggleWebsiteStatus(id: number): Promise<{ website: Website }> {
    return this.request<{ website: Website }>(`/websites/${id}/toggle-status`, {
      method: 'POST',
    })
  }

  async regenerateWidgetKey(id: number): Promise<{ widget_key: string }> {
    return this.request<{ widget_key: string }>(`/websites/${id}/regenerate-key`, {
      method: 'POST',
    })
  }

  // Chats
  async getChats(websiteId: number, page = 1, limit = 10): Promise<PaginatedResponse<Chat>> {
    return this.request<PaginatedResponse<Chat>>(`/websites/${websiteId}/chats?page=${page}&limit=${limit}`)
  }

  async getChat(id: number): Promise<{ chat: Chat }> {
    return this.request<{ chat: Chat }>(`/chats/${id}`)
  }

  async getChatMessages(id: number, page = 1, limit = 50): Promise<PaginatedResponse<Message>> {
    return this.request<PaginatedResponse<Message>>(`/chats/${id}/messages?page=${page}&limit=${limit}`)
  }

  async endChat(id: number): Promise<void> {
    await this.request(`/chats/${id}/end`, { method: 'POST' })
  }

  // Analytics
  async getDashboardMetrics(days = 30): Promise<{ metrics: DashboardMetrics }> {
    return this.request<{ metrics: DashboardMetrics }>(`/analytics/dashboard?days=${days}`)
  }

  async getWebsiteAnalytics(websiteId: number, startDate: string, endDate: string): Promise<any> {
    return this.request(`/websites/${websiteId}/analytics?start_date=${startDate}&end_date=${endDate}`)
  }

  async getRealTimeMetrics(websiteId: number): Promise<any> {
    return this.request(`/websites/${websiteId}/analytics/realtime`)
  }

  // Widget Configuration
  async getAvailableThemes(): Promise<{ themes: any[] }> {
    return this.request<{ themes: any[] }>('/widget/themes')
  }

  async getAvailablePositions(): Promise<{ positions: any[] }> {
    return this.request<{ positions: any[] }>('/widget/positions')
  }

  async validateWidgetSettings(settings: WebsiteSettings): Promise<{ settings: WebsiteSettings }> {
    return this.request<{ settings: WebsiteSettings }>('/widget/validate-settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    })
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.accessToken
  }

  getAccessToken(): string | null {
    return this.accessToken
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL)

// Helper function for handling API errors
export const handleApiError = (error: any) => {
  console.error('API Error:', error)
  
  if (error.status === 401) {
    toast.error('Authentication required. Please log in.')
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login'
    }
  } else if (error.status === 403) {
    toast.error('Access denied. Insufficient permissions.')
  } else if (error.status === 429) {
    toast.error('Too many requests. Please try again later.')
  } else if (error.status >= 500) {
    toast.error('Server error. Please try again later.')
  } else {
    toast.error(error.message || 'An unexpected error occurred.')
  }
}

export default apiClient