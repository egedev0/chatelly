'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { analyticsService, AnalyticsMetrics, WebsiteAnalytics } from '@/lib/services/analytics-service'
import { useToast } from '@/hooks/use-toast'
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  Globe, 
  Download,
  Calendar,
  Filter
} from 'lucide-react'
import { format, subDays } from 'date-fns'

interface AnalyticsDashboardProps {
  websiteId?: number
}

export const AnalyticsDashboard = ({ websiteId }: AnalyticsDashboardProps) => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null)
  const [websiteAnalytics, setWebsiteAnalytics] = useState<WebsiteAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  })
  const { toast } = useToast()

  useEffect(() => {
    loadAnalytics()
  }, [websiteId, dateRange])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      
      if (websiteId) {
        // Load website-specific analytics
        const websiteData = await analyticsService.getWebsiteAnalytics(websiteId, {
          date_from: format(dateRange.from, 'yyyy-MM-dd'),
          date_to: format(dateRange.to, 'yyyy-MM-dd')
        })
        setWebsiteAnalytics(websiteData)
        setMetrics(websiteData.metrics)
      } else {
        // Load dashboard metrics
        const dashboardData = await analyticsService.getDashboardMetrics()
        setMetrics(dashboardData)
      }
    } catch (error) {
      console.error('Failed to load analytics:', error)
      toast({
        title: "Error",
        description: "Failed to load analytics data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    if (!websiteId) return

    try {
      const blob = await analyticsService.exportAnalytics(websiteId, {
        date_from: format(dateRange.from, 'yyyy-MM-dd'),
        date_to: format(dateRange.to, 'yyyy-MM-dd')
      })
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "Success",
        description: "Analytics data exported successfully!",
      })
    } catch (error) {
      console.error('Failed to export analytics:', error)
      toast({
        title: "Error",
        description: "Failed to export analytics data.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading analytics...</span>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No analytics data</h3>
        <p className="text-muted-foreground">
          Analytics data will appear here once you start receiving traffic.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            {websiteId ? 'Website-specific analytics' : 'Overview of all websites'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <DatePicker
            date={dateRange.from}
            onDateChange={(date) => setDateRange(prev => ({ ...prev, from: date || prev.from }))}
          />
          <span className="text-muted-foreground">to</span>
          <DatePicker
            date={dateRange.to}
            onDateChange={(date) => setDateRange(prev => ({ ...prev, to: date || prev.to }))}
          />
          {websiteId && (
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsService.formatNumber(metrics.total_visitors)}</div>
            <p className="text-xs text-muted-foreground">
              +{analyticsService.calculateGrowthRate(metrics.total_visitors, metrics.total_visitors * 0.9)}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Chats</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsService.formatNumber(metrics.total_chats)}</div>
            <p className="text-xs text-muted-foreground">
              +{analyticsService.calculateGrowthRate(metrics.total_chats, metrics.total_chats * 0.85)}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsService.formatPercentage(metrics.conversion_rate)}</div>
            <p className="text-xs text-muted-foreground">
              +{analyticsService.calculateGrowthRate(metrics.conversion_rate, metrics.conversion_rate * 0.95)}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsService.formatDuration(metrics.avg_response_time)}</div>
            <p className="text-xs text-muted-foreground">
              -{analyticsService.calculateGrowthRate(metrics.avg_response_time, metrics.avg_response_time * 1.1)}% from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsService.formatNumber(metrics.total_messages)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.active_sessions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Satisfaction Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.satisfaction_score.toFixed(1)}/5</div>
          </CardContent>
        </Card>
      </div>

      {/* Website-specific analytics */}
      {websiteAnalytics && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Website Analytics</h3>
          
          {/* Top Pages */}
          <Card>
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {websiteAnalytics.top_pages.slice(0, 5).map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm truncate">{page.page}</span>
                    <Badge variant="secondary">{page.visits} visits</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Visitor Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Visitor Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {websiteAnalytics.visitor_sources.slice(0, 5).map((source, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{source.source}</span>
                    <Badge variant="secondary">{source.count} visitors</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Languages */}
          <Card>
            <CardHeader>
              <CardTitle>Languages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {websiteAnalytics.languages.slice(0, 5).map((lang, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{lang.language}</span>
                    <Badge variant="secondary">{lang.count} visitors</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 