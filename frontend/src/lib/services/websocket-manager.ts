import { EventEmitter } from 'events'

export interface WebSocketMessage {
  type: string
  data: any
  timestamp: number
}

export interface WebSocketConfig {
  url: string
  reconnectInterval?: number
  maxReconnectAttempts?: number
  heartbeatInterval?: number
}

export class WebSocketManager extends EventEmitter {
  private ws: WebSocket | null = null
  private config: WebSocketConfig
  private reconnectAttempts = 0
  private maxReconnectAttempts: number
  private reconnectInterval: number
  private heartbeatInterval: number
  private heartbeatTimer: NodeJS.Timeout | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
  private isConnecting = false
  private isManualClose = false

  constructor(config: WebSocketConfig) {
    super()
    this.config = config
    this.maxReconnectAttempts = config.maxReconnectAttempts || 5
    this.reconnectInterval = config.reconnectInterval || 3000
    this.heartbeatInterval = config.heartbeatInterval || 30000
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve()
        return
      }

      if (this.isConnecting) {
        this.once('connected', resolve)
        this.once('error', reject)
        return
      }

      this.isConnecting = true
      this.isManualClose = false

      try {
        this.ws = new WebSocket(this.config.url)
        this.setupEventHandlers(resolve, reject)
      } catch (error) {
        this.isConnecting = false
        reject(error)
      }
    })
  }

  private setupEventHandlers(resolve: () => void, reject: (error: any) => void) {
    if (!this.ws) return

    this.ws.onopen = () => {
      this.isConnecting = false
      this.reconnectAttempts = 0
      this.startHeartbeat()
      this.emit('connected')
      resolve()
    }

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data)
        this.emit('message', message)
        this.emit(`message:${message.type}`, message.data)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    this.ws.onclose = (event) => {
      this.stopHeartbeat()
      this.emit('disconnected', event.code, event.reason)

      if (!this.isManualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect()
      }
    }

    this.ws.onerror = (error) => {
      this.isConnecting = false
      this.emit('error', error)
      reject(error)
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    this.reconnectAttempts++
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1)

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => {
        console.error('Reconnection failed:', error)
      })
    }, delay)
  }

  private startHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
    }

    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping', data: { timestamp: Date.now() } })
      }
    }, this.heartbeatInterval)
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      throw new Error('WebSocket is not connected')
    }
  }

  sendTyped<T>(type: string, data: T): void {
    this.send({
      type,
      data,
      timestamp: Date.now()
    })
  }

  disconnect(): void {
    this.isManualClose = true
    this.stopHeartbeat()
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  getState(): number {
    return this.ws?.readyState || WebSocket.CLOSED
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  // Message queuing for offline scenarios
  private messageQueue: WebSocketMessage[] = []

  queueMessage(message: WebSocketMessage): void {
    this.messageQueue.push(message)
  }

  flushMessageQueue(): void {
    if (!this.isConnected()) return

    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()
      if (message) {
        try {
          this.send(message)
        } catch (error) {
          console.error('Failed to send queued message:', error)
          // Put the message back at the front of the queue
          this.messageQueue.unshift(message)
          break
        }
      }
    }
  }

  // Typing indicators
  private typingUsers = new Set<string>()

  setTyping(userId: string, isTyping: boolean): void {
    if (isTyping) {
      this.typingUsers.add(userId)
    } else {
      this.typingUsers.delete(userId)
    }

    this.emit('typing', Array.from(this.typingUsers))
  }

  getTypingUsers(): string[] {
    return Array.from(this.typingUsers)
  }

  // Presence management
  private presenceData = new Map<string, { status: string; lastSeen: number }>()

  updatePresence(userId: string, status: string): void {
    this.presenceData.set(userId, {
      status,
      lastSeen: Date.now()
    })

    this.emit('presence', { userId, status })
  }

  getPresence(userId: string): { status: string; lastSeen: number } | undefined {
    return this.presenceData.get(userId)
  }

  getAllPresence(): Map<string, { status: string; lastSeen: number }> {
    return new Map(this.presenceData)
  }
} 