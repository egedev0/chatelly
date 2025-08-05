// API Response and Request Types
export interface APIResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
  statusCode: number;
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

// Website Types
export interface Website {
  id: string;
  name: string;
  domain: string;
  widgetKey: string;
  settings: WidgetConfig;
  analytics: WebsiteAnalytics;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWebsiteData {
  name: string;
  domain: string;
}

export interface UpdateWebsiteData {
  name?: string;
  domain?: string;
  settings?: Partial<WidgetConfig>;
}

export interface WebsiteAnalytics {
  totalVisitors: number;
  totalSessions: number;
  totalMessages: number;
  averageSessionDuration: number;
}

// Chat Types
export interface ChatSession {
  id: string;
  websiteId: string;
  visitorId: string;
  status: 'active' | 'ended' | 'archived';
  startedAt: string;
  endedAt?: string;
  metadata: Record<string, any>;
}

export interface Message {
  id: string;
  sessionId: string;
  content: string;
  sender: 'visitor' | 'operator';
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ChatMessage {
  sessionId: string;
  content: string;
  sender: 'visitor' | 'operator';
  timestamp?: string;
}

export interface TypingData {
  sessionId: string;
  isTyping: boolean;
  sender: 'visitor' | 'operator';
}

// Widget Types
export interface WidgetConfig {
  theme: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    borderRadius: number;
  };
  behavior: {
    autoOpen: boolean;
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    showOnPages: string[];
    hideOnPages: string[];
  };
  features: {
    fileUpload: boolean;
    emailCapture: boolean;
    offlineMessages: boolean;
  };
}

// Analytics Types
export interface Analytics {
  websiteId: string;
  visitors: number;
  sessions: number;
  messages: number;
  averageResponseTime: number;
  satisfactionScore: number;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface DashboardData {
  totalWebsites: number;
  totalVisitors: number;
  totalSessions: number;
  totalMessages: number;
  recentActivity: ActivityItem[];
  topWebsites: Website[];
}

export interface WebsiteMetrics {
  websiteId: string;
  visitors: VisitorMetric[];
  sessions: SessionMetric[];
  messages: MessageMetric[];
  performance: PerformanceMetric[];
}

export interface ActivityItem {
  id: string;
  type: 'new_session' | 'message' | 'website_created';
  description: string;
  timestamp: string;
  websiteId?: string;
}

export interface VisitorMetric {
  date: string;
  count: number;
  unique: number;
}

export interface SessionMetric {
  date: string;
  count: number;
  averageDuration: number;
}

export interface MessageMetric {
  date: string;
  count: number;
  averageResponseTime: number;
}

export interface PerformanceMetric {
  date: string;
  responseTime: number;
  satisfactionScore: number;
}

// Request Parameter Types
export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AnalyticsParams {
  startDate?: string;
  endDate?: string;
  granularity?: 'hour' | 'day' | 'week' | 'month';
}

export interface DashboardParams {
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface MetricsParams {
  startDate?: string;
  endDate?: string;
  metrics?: string[];
}

// Connection Status
export interface ConnectionStatus {
  connected: boolean;
  reconnecting: boolean;
  lastConnected?: string;
  error?: string;
}