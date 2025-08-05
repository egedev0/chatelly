'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useChat } from '@/contexts/chat-context'
import { 
  Bell, 
  MessageSquare, 
  User, 
  Globe,
  X,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
  id: string
  type: 'chat_started' | 'message_received' | 'visitor_online' | 'website_status'
  title: string
  message: string
  timestamp: Date
  read: boolean
  data?: any
}

export const LiveNotifications = () => {
  const { activeSessions, isConnected } = useChat()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showNotifications, setShowNotifications] = useState(true)

  // Simulate incoming notifications
  useEffect(() => {
    if (!isConnected) return

    const interval = setInterval(() => {
      const shouldAddNotification = Math.random() > 0.7 // 30% chance
      if (shouldAddNotification) {
        const notificationTypes: Notification['type'][] = [
          'chat_started',
          'message_received',
          'visitor_online',
          'website_status'
        ]
        
        const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)]
        const newNotification = createNotification(randomType)
        
        setNotifications(prev => [newNotification, ...prev.slice(0, 9)]) // Keep last 10
        
        // Play sound if enabled
        if (soundEnabled) {
          playNotificationSound()
        }
      }
    }, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [isConnected, soundEnabled])

  const createNotification = (type: Notification['type']): Notification => {
    const id = Date.now().toString()
    const timestamp = new Date()
    
    switch (type) {
      case 'chat_started':
        return {
          id,
          type,
          title: 'New Chat Started',
          message: `Visitor ${Math.floor(Math.random() * 1000)} started a conversation`,
          timestamp,
          read: false
        }
      case 'message_received':
        return {
          id,
          type,
          title: 'New Message',
          message: `New message from visitor ${Math.floor(Math.random() * 1000)}`,
          timestamp,
          read: false
        }
      case 'visitor_online':
        return {
          id,
          type,
          title: 'Visitor Online',
          message: `Visitor ${Math.floor(Math.random() * 1000)} is browsing your site`,
          timestamp,
          read: false
        }
      case 'website_status':
        return {
          id,
          type,
          title: 'Website Status',
          message: 'All websites are running smoothly',
          timestamp,
          read: false
        }
      default:
        return {
          id,
          type: 'chat_started',
          title: 'Notification',
          message: 'Something happened',
          timestamp,
          read: false
        }
    }
  }

  const playNotificationSound = () => {
    // Create a simple notification sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.2)
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'chat_started':
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      case 'message_received':
        return <MessageSquare className="h-4 w-4 text-green-500" />
      case 'visitor_online':
        return <User className="h-4 w-4 text-purple-500" />
      case 'website_status':
        return <Globe className="h-4 w-4 text-orange-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'chat_started':
        return 'border-l-blue-500'
      case 'message_received':
        return 'border-l-green-500'
      case 'visitor_online':
        return 'border-l-purple-500'
      case 'website_status':
        return 'border-l-orange-500'
      default:
        return 'border-l-gray-500'
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <CardTitle className="text-lg">Live Notifications</CardTitle>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showNotifications ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">
                {notifications.length} notifications
              </span>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  Mark all read
                </Button>
                <Button variant="outline" size="sm" onClick={clearNotifications}>
                  Clear all
                </Button>
              </div>
            </div>
            
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notifications yet</p>
                    <p className="text-xs">Notifications will appear here</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border-l-4 ${getNotificationColor(notification.type)} ${
                        notification.read ? 'bg-muted/50' : 'bg-background'
                      } transition-colors`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{notification.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Notifications disabled</p>
            <p className="text-xs">Enable to see live updates</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 