'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useChat } from '@/contexts/chat-context'
import { useWebsites } from '@/hooks/use-api'
import { analyticsService } from '@/lib/services/analytics-service'
import { 
  Users, 
  MessageSquare, 
  Activity, 
  Wifi, 
  WifiOff,
  RefreshCw,
  TrendingUp,
  Clock
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface RealTimeMetrics {
  active_visitors: number
  active_chats: number
  recent_events: any[]
  top_pages: { page: string; active_visitors: number }[]
}

export const RealTimeDashboard = () => {
  const { isConnected, connectionStatus, activeSessions } = useChat()
  const { data: websites, mutate: refreshWebsites } = useWebsites()
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics>({
    active_visitors: 0,
    active_chats: 0,
    recent_events: [],
    top_pages: []
  })
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Simulate real-time updates
  useEffect(() => {
    if (!isConnected) return

    const interval = setInterval(() => {
      setRealTimeMetrics(prev => ({
        ...prev,
        active_visitors: Math.floor(Math.random() * 50) + 10,
        active_chats: activeSessions.length,
        recent_events: [
          {
            id: Date.now(),
            type: 'page_view',
            visitor: `Visitor ${Math.floor(Math.random() * 1000)}`,
            page: '/products',
            timestamp: new Date()
          },
          {
            id: Date.now() + 1,
            type: 'chat_started',
            visitor: `Visitor ${Math.floor(Math.random() * 1000)}`,
            timestamp: new Date()
          }
        ].slice(0, 5),
        top_pages: [
          { page: '/home', active_visitors: Math.floor(Math.random() * 20) + 5 },
          { page: '/products', active_visitors: Math.floor(Math.random() * 15) + 3 },
          { page: '/about', active_visitors: Math.floor(Math.random() * 10) + 2 }
        ]
      }))
      setLastUpdate(new Date())
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [isConnected, activeSessions])

  const handleRefresh = () => {
    refreshWebsites()
    setLastUpdate(new Date())
  }

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-500'
      case 'connecting':
        return 'bg-yellow-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected'
      case 'connecting':
        return 'Connecting...'
      case 'error':
        return 'Error'
      default:
        return 'Disconnected'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Real-Time Dashboard</h2>
          <p className="text-muted-foreground">
            Live updates of your website activity
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getConnectionStatusColor()}`} />
            <span className="text-sm">{getConnectionStatusText()}</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Real-time metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeMetrics.active_visitors}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% from last hour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Chats</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeMetrics.active_chats}</div>
            <p className="text-xs text-muted-foreground">
              <Activity className="inline h-3 w-3 mr-1" />
              Live conversations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Websites</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{websites?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active websites
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Update</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {formatDistanceToNow(lastUpdate, { addSuffix: true })}
            </div>
            <p className="text-xs text-muted-foreground">
              Auto-refreshing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {realTimeMetrics.recent_events.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <div>
                      <p className="text-sm font-medium">{event.visitor}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.type === 'page_view' ? `Viewed ${event.page}` : 'Started a chat'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Pages (Live)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {realTimeMetrics.top_pages.map((page, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">{index + 1}</Badge>
                    <span className="text-sm font-medium">{page.page}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{page.active_visitors} visitors</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm font-medium">WebSocket Connection</span>
              </div>
              <Badge variant={isConnected ? 'default' : 'destructive'}>
                {getConnectionStatusText()}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Sessions</span>
              <Badge variant="secondary">{activeSessions.length}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Last Update</span>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(lastUpdate, { addSuffix: true })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 