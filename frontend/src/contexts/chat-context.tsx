'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { WebSocketManager, WebSocketMessage } from '@/lib/services/websocket-manager'

export interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'visitor'
  timestamp: number
  translated?: boolean
  language?: string
}

export interface ChatSession {
  id: string
  websiteId: number
  visitorId: string
  visitorName?: string
  visitorEmail?: string
  status: 'active' | 'ended' | 'archived'
  startedAt: number
  endedAt?: number
  messages: ChatMessage[]
  unreadCount: number
}

export interface ChatContextType {
  // WebSocket connection
  isConnected: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  
  // Chat sessions
  activeSessions: ChatSession[]
  selectedSession: ChatSession | null
  
  // WebSocket methods
  connect: (widgetKey: string) => Promise<void>
  disconnect: () => void
  sendMessage: (sessionId: string, content: string) => void
  
  // Session management
  selectSession: (sessionId: string) => void
  endSession: (sessionId: string) => void
  archiveSession: (sessionId: string) => void
  
  // Typing indicators
  typingUsers: string[]
  setTyping: (isTyping: boolean) => void
  
  // Presence
  presenceData: Map<string, { status: string; lastSeen: number }>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const useChat = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}

interface ChatProviderProps {
  children: React.ReactNode
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [wsManager, setWsManager] = useState<WebSocketManager | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  
  const [activeSessions, setActiveSessions] = useState<ChatSession[]>([])
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [presenceData, setPresenceData] = useState<Map<string, { status: string; lastSeen: number }>>(new Map())

  // Initialize WebSocket manager
  const initializeWebSocket = useCallback((widgetKey: string) => {
    const wsUrl = `ws://localhost:8080/widget/ws/${widgetKey}`
    
    const manager = new WebSocketManager({
      url: wsUrl,
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
    })

    // Set up event listeners
    manager.on('connected', () => {
      setIsConnected(true)
      setConnectionStatus('connected')
      console.log('WebSocket connected')
    })

    manager.on('disconnected', (code, reason) => {
      setIsConnected(false)
      setConnectionStatus('disconnected')
      console.log('WebSocket disconnected:', code, reason)
    })

    manager.on('error', (error) => {
      setConnectionStatus('error')
      console.error('WebSocket error:', error)
    })

    manager.on('message', (message: WebSocketMessage) => {
      handleWebSocketMessage(message)
    })

    manager.on('typing', (users: string[]) => {
      setTypingUsers(users)
    })

    manager.on('presence', ({ userId, status }) => {
      setPresenceData(prev => {
        const newMap = new Map(prev)
        newMap.set(userId, { status, lastSeen: Date.now() })
        return newMap
      })
    })

    setWsManager(manager)
    return manager
  }, [])

  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'session_started':
        handleSessionStarted(message.data)
        break
      case 'message_received':
        handleMessageReceived(message.data)
        break
      case 'session_ended':
        handleSessionEnded(message.data)
        break
      case 'typing_started':
        handleTypingStarted(message.data)
        break
      case 'typing_stopped':
        handleTypingStopped(message.data)
        break
      case 'presence_update':
        handlePresenceUpdate(message.data)
        break
      default:
        console.log('Unknown message type:', message.type)
    }
  }, [])

  const handleSessionStarted = useCallback((data: any) => {
    const newSession: ChatSession = {
      id: data.sessionId,
      websiteId: data.websiteId,
      visitorId: data.visitorId,
      visitorName: data.visitorName,
      visitorEmail: data.visitorEmail,
      status: 'active',
      startedAt: Date.now(),
      messages: [],
      unreadCount: 0,
    }

    setActiveSessions(prev => [...prev, newSession])
  }, [])

  const handleMessageReceived = useCallback((data: any) => {
    const message: ChatMessage = {
      id: data.messageId,
      content: data.content,
      sender: data.sender,
      timestamp: Date.now(),
      translated: data.translated,
      language: data.language,
    }

    setActiveSessions(prev => prev.map(session => {
      if (session.id === data.sessionId) {
        const updatedSession = {
          ...session,
          messages: [...session.messages, message],
          unreadCount: session.id === selectedSession?.id ? session.unreadCount : session.unreadCount + 1,
        }
        return updatedSession
      }
      return session
    }))
  }, [selectedSession])

  const handleSessionEnded = useCallback((data: any) => {
    setActiveSessions(prev => prev.map(session => {
      if (session.id === data.sessionId) {
        return {
          ...session,
          status: 'ended' as const,
          endedAt: Date.now(),
        }
      }
      return session
    }))
  }, [])

  const handleTypingStarted = useCallback((data: any) => {
    // Typing indicators are handled by the WebSocket manager
  }, [])

  const handleTypingStopped = useCallback((data: any) => {
    // Typing indicators are handled by the WebSocket manager
  }, [])

  const handlePresenceUpdate = useCallback((data: any) => {
    // Presence updates are handled by the WebSocket manager
  }, [])

  const connect = useCallback(async (widgetKey: string) => {
    try {
      setConnectionStatus('connecting')
      const manager = initializeWebSocket(widgetKey)
      await manager.connect()
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
      setConnectionStatus('error')
    }
  }, [initializeWebSocket])

  const disconnect = useCallback(() => {
    if (wsManager) {
      wsManager.disconnect()
      setWsManager(null)
    }
  }, [wsManager])

  const sendMessage = useCallback((sessionId: string, content: string) => {
    if (!wsManager || !isConnected) {
      console.error('WebSocket not connected')
      return
    }

    try {
      wsManager.sendTyped('send_message', {
        sessionId,
        content,
      })
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }, [wsManager, isConnected])

  const selectSession = useCallback((sessionId: string) => {
    const session = activeSessions.find(s => s.id === sessionId)
    if (session) {
      setSelectedSession(session)
      // Mark messages as read
      setActiveSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, unreadCount: 0 } : s
      ))
    }
  }, [activeSessions])

  const endSession = useCallback((sessionId: string) => {
    if (!wsManager || !isConnected) return

    try {
      wsManager.sendTyped('end_session', { sessionId })
    } catch (error) {
      console.error('Failed to end session:', error)
    }
  }, [wsManager, isConnected])

  const archiveSession = useCallback((sessionId: string) => {
    setActiveSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        return { ...session, status: 'archived' as const }
      }
      return session
    }))
  }, [])

  const setTyping = useCallback((isTyping: boolean) => {
    if (!wsManager || !isConnected) return

    try {
      wsManager.sendTyped('typing', { isTyping })
    } catch (error) {
      console.error('Failed to send typing indicator:', error)
    }
  }, [wsManager, isConnected])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsManager) {
        wsManager.disconnect()
      }
    }
  }, [wsManager])

  const value: ChatContextType = {
    isConnected,
    connectionStatus,
    activeSessions,
    selectedSession,
    typingUsers,
    presenceData,
    connect,
    disconnect,
    sendMessage,
    selectSession,
    endSession,
    archiveSession,
    setTyping,
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
} 