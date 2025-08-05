import { 
  APIResponse, 
  APIError, 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  User, 
  UpdateProfileData,
  Website,
  CreateWebsiteData,
  UpdateWebsiteData,
  PaginatedResponse,
  ListParams,
  Analytics,
  AnalyticsParams,
  ChatSession,
  Message,
  WidgetConfig,
  DashboardData,
  DashboardParams,
  WebsiteMetrics,
  MetricsParams
} from '@/types/api';

class HTTPClient {
  private baseURL: string;
  private token: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadTokens();
  }

  private loadTokens() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
      this.refreshToken = localStorage.getItem('refresh_token');
    }
  }

  private saveTokens(token: string, refreshToken: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('refresh_token', refreshToken);
    }
    this.token = token;
    this.refreshToken = refreshToken;
  }

  private clearTokens() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    }
    this.token = null;
    this.refreshToken = null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401 && this.refreshToken) {
        // Try to refresh token
        const refreshed = await this.refreshTokens();
        if (refreshed) {
          // Retry the original request
          headers.Authorization = `Bearer ${this.token}`;
          const retryResponse = await fetch(url, {
            ...options,
            headers,
          });
          return this.handleResponse<T>(retryResponse);
        }
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      let errorData: any = {};
      
      if (isJson) {
        try {
          errorData = await response.json();
        } catch {
          // Ignore JSON parse errors
        }
      }

      const apiError: APIError = {
        code: errorData.code || 'UNKNOWN_ERROR',
        message: errorData.message || response.statusText,
        details: errorData.details,
        statusCode: response.status,
      };

      throw apiError;
    }

    if (isJson) {
      const data = await response.json();
      return data as T;
    }

    return response.text() as unknown as T;
  }

  private async refreshTokens(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (response.ok) {
        const data: AuthResponse = await response.json();
        this.saveTokens(data.token, data.refreshToken);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    this.clearTokens();
    return false;
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    this.saveTokens(response.token, response.refreshToken);
    return response;
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    this.saveTokens(response.token, response.refreshToken);
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } finally {
      this.clearTokens();
    }
  }

  async getProfile(): Promise<User> {
    return this.request<User>('/auth/profile');
  }

  async updateProfile(data: UpdateProfileData): Promise<User> {
    return this.request<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Website methods
  async getWebsites(params?: ListParams): Promise<PaginatedResponse<Website>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const query = searchParams.toString();
    return this.request<PaginatedResponse<Website>>(`/websites${query ? `?${query}` : ''}`);
  }

  async createWebsite(data: CreateWebsiteData): Promise<Website> {
    return this.request<Website>('/websites', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWebsite(id: string): Promise<Website> {
    return this.request<Website>(`/websites/${id}`);
  }

  async updateWebsite(id: string, data: UpdateWebsiteData): Promise<Website> {
    return this.request<Website>(`/websites/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteWebsite(id: string): Promise<void> {
    await this.request(`/websites/${id}`, {
      method: 'DELETE',
    });
  }

  async getWebsiteAnalytics(id: string, params?: AnalyticsParams): Promise<Analytics> {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    if (params?.granularity) searchParams.set('granularity', params.granularity);

    const query = searchParams.toString();
    return this.request<Analytics>(`/websites/${id}/analytics${query ? `?${query}` : ''}`);
  }

  // Chat methods
  async getChatSessions(websiteId: string): Promise<ChatSession[]> {
    return this.request<ChatSession[]>(`/websites/${websiteId}/chats`);
  }

  async getChatMessages(sessionId: string): Promise<Message[]> {
    return this.request<Message[]>(`/chats/${sessionId}/messages`);
  }

  async sendMessage(sessionId: string, message: string): Promise<Message> {
    return this.request<Message>(`/chats/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content: message }),
    });
  }

  // Widget methods
  async getWidgetConfig(websiteId: string): Promise<WidgetConfig> {
    return this.request<WidgetConfig>(`/websites/${websiteId}/widget`);
  }

  async updateWidgetConfig(websiteId: string, config: WidgetConfig): Promise<WidgetConfig> {
    return this.request<WidgetConfig>(`/websites/${websiteId}/widget`, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  async generateWidgetScript(websiteId: string): Promise<string> {
    return this.request<string>(`/websites/${websiteId}/widget/script`);
  }

  // Analytics methods
  async getDashboard(params?: DashboardParams): Promise<DashboardData> {
    const searchParams = new URLSearchParams();
    if (params?.dateRange) {
      searchParams.set('startDate', params.dateRange.start);
      searchParams.set('endDate', params.dateRange.end);
    }

    const query = searchParams.toString();
    return this.request<DashboardData>(`/analytics/dashboard${query ? `?${query}` : ''}`);
  }

  async getWebsiteMetrics(websiteId: string, params?: MetricsParams): Promise<WebsiteMetrics> {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    if (params?.metrics) searchParams.set('metrics', params.metrics.join(','));

    const query = searchParams.toString();
    return this.request<WebsiteMetrics>(`/analytics/websites/${websiteId}${query ? `?${query}` : ''}`);
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }
}

// Create and export API client instance
const apiClient = new HTTPClient(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1');

export default apiClient;