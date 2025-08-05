// Local storage utilities for offline data persistence

export class LocalStorage {
  private static instance: LocalStorage
  private prefix: string

  constructor(prefix = 'chatelly_') {
    this.prefix = prefix
  }

  static getInstance(): LocalStorage {
    if (!LocalStorage.instance) {
      LocalStorage.instance = new LocalStorage()
    }
    return LocalStorage.instance
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }

  set<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value)
      localStorage.setItem(this.getKey(key), serializedValue)
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }

  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(this.getKey(key))
      if (item === null) {
        return defaultValue || null
      }
      return JSON.parse(item)
    } catch (error) {
      console.error('Failed to read from localStorage:', error)
      return defaultValue || null
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(this.getKey(key))
    } catch (error) {
      console.error('Failed to remove from localStorage:', error)
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
    }
  }

  has(key: string): boolean {
    try {
      return localStorage.getItem(this.getKey(key)) !== null
    } catch (error) {
      console.error('Failed to check localStorage:', error)
      return false
    }
  }

  // Utility methods for specific data types
  setUser(user: any): void {
    this.set('user', user)
  }

  getUser(): any | null {
    return this.get('user')
  }

  setToken(token: string): void {
    this.set('token', token)
  }

  getToken(): string | null {
    return this.get('token')
  }

  setSettings(settings: any): void {
    this.set('settings', settings)
  }

  getSettings(): any | null {
    return this.get('settings')
  }

  setOfflineData(key: string, data: any): void {
    this.set(`offline_${key}`, data)
  }

  getOfflineData(key: string): any | null {
    return this.get(`offline_${key}`)
  }

  // Cache management
  setCache(key: string, data: any, ttl: number = 3600000): void {
    const cacheData = {
      data,
      timestamp: Date.now(),
      ttl
    }
    this.set(`cache_${key}`, cacheData)
  }

  getCache<T>(key: string): T | null {
    const cacheData = this.get<{ data: T; timestamp: number; ttl: number }>(`cache_${key}`)
    if (!cacheData) return null

    const isExpired = Date.now() - cacheData.timestamp > cacheData.ttl
    if (isExpired) {
      this.remove(`cache_${key}`)
      return null
    }

    return cacheData.data
  }

  clearCache(): void {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(this.getKey('cache_'))) {
        localStorage.removeItem(key)
      }
    })
  }

  // Form data persistence
  setFormData(formId: string, data: any): void {
    this.set(`form_${formId}`, data)
  }

  getFormData(formId: string): any | null {
    return this.get(`form_${formId}`)
  }

  clearFormData(formId: string): void {
    this.remove(`form_${formId}`)
  }

  // Theme preferences
  setTheme(theme: 'light' | 'dark'): void {
    this.set('theme', theme)
  }

  getTheme(): 'light' | 'dark' | null {
    return this.get('theme')
  }

  // Language preferences
  setLanguage(language: string): void {
    this.set('language', language)
  }

  getLanguage(): string | null {
    return this.get('language')
  }

  // Widget settings
  setWidgetSettings(websiteId: number, settings: any): void {
    this.set(`widget_settings_${websiteId}`, settings)
  }

  getWidgetSettings(websiteId: number): any | null {
    return this.get(`widget_settings_${websiteId}`)
  }

  // Chat history
  setChatHistory(chatId: string, messages: any[]): void {
    this.set(`chat_history_${chatId}`, messages)
  }

  getChatHistory(chatId: string): any[] | null {
    return this.get(`chat_history_${chatId}`)
  }

  // Analytics data
  setAnalyticsData(websiteId: number, data: any): void {
    this.set(`analytics_${websiteId}`, data)
  }

  getAnalyticsData(websiteId: number): any | null {
    return this.get(`analytics_${websiteId}`)
  }
}

// Export singleton instance
export const storage = LocalStorage.getInstance() 