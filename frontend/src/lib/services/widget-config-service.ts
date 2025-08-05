import { apiClient } from './api-client'

export interface WidgetTheme {
  id: string
  name: string
  description: string
  preview: string
}

export interface WidgetPosition {
  id: string
  name: string
  description: string
}

export interface WidgetSettings {
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

export interface WidgetConfig {
  widget_key: string
  settings: WidgetSettings
  script_url: string
  embed_code: string
}

export interface WidgetPreview {
  html: string
  css: string
  js: string
}

class WidgetConfigService {
  async getAvailableThemes(): Promise<WidgetTheme[]> {
    const response = await apiClient.get('/widget/themes')
    return response.data
  }

  async getAvailablePositions(): Promise<WidgetPosition[]> {
    const response = await apiClient.get('/widget/positions')
    return response.data
  }

  async validateWidgetSettings(settings: WidgetSettings): Promise<{ valid: boolean; errors?: string[] }> {
    const response = await apiClient.post('/widget/validate-settings', { settings })
    return response.data
  }

  async previewWidget(settings: WidgetSettings): Promise<WidgetPreview> {
    const response = await apiClient.post('/widget/preview', { settings })
    return response.data
  }

  async getWidgetConfig(widgetKey: string): Promise<WidgetConfig> {
    const response = await apiClient.get(`/widget/config/${widgetKey}`)
    return response.data
  }

  async getWidgetScript(widgetKey: string): Promise<string> {
    const response = await apiClient.get(`/widget/script/${widgetKey}`)
    return response.data
  }

  async updateWidgetSettings(websiteId: number, settings: WidgetSettings): Promise<WidgetSettings> {
    const response = await apiClient.put(`/websites/${websiteId}/settings`, { settings })
    return response.data.settings
  }

  // Helper methods for widget configuration
  getDefaultSettings(): WidgetSettings {
    return {
      theme: 'modern',
      primary_color: '#3B82F6',
      position: 'bottom-right',
      welcome_message: 'Hello! How can we help you today?',
      offline_message: 'We\'re currently offline. Please leave a message and we\'ll get back to you soon.',
      language: 'en',
      translation_enabled: false,
      moderation_enabled: false,
      custom_css: '',
      allowed_domains: [],
      business_hours: {
        monday: '09:00-18:00',
        tuesday: '09:00-18:00',
        wednesday: '09:00-18:00',
        thursday: '09:00-18:00',
        friday: '09:00-18:00',
        saturday: '10:00-16:00',
        sunday: 'closed'
      }
    }
  }

  generateEmbedCode(widgetKey: string): string {
    return `<script src="http://localhost:8080/widget/script/${widgetKey}"></script>`
  }

  validateColor(color: string): boolean {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    return hexColorRegex.test(color)
  }

  validateDomain(domain: string): boolean {
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    return domainRegex.test(domain)
  }
}

export const widgetConfigService = new WidgetConfigService() 