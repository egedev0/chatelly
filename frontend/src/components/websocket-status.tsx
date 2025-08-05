'use client'

import { useChat } from '@/contexts/chat-context'
import { Badge } from '@/components/ui/badge'
import { Wifi, WifiOff, AlertCircle, Loader2 } from 'lucide-react'

export const WebSocketStatus = () => {
  const { connectionStatus, isConnected } = useChat()

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: <Wifi className="h-3 w-3" />,
          label: 'Connected',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200'
        }
      case 'connecting':
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          label: 'Connecting...',
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        }
      case 'error':
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          label: 'Connection Error',
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200'
        }
      default:
        return {
          icon: <WifiOff className="h-3 w-3" />,
          label: 'Disconnected',
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }
  }

  const statusConfig = getStatusConfig()

  return (
    <Badge 
      variant={statusConfig.variant}
      className={`flex items-center gap-1 text-xs ${statusConfig.className}`}
    >
      {statusConfig.icon}
      {statusConfig.label}
    </Badge>
  )
} 