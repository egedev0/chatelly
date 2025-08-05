'use client'

import { useState, useEffect, useRef } from 'react'
import { useChat } from '@/contexts/chat-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  Send, 
  User, 
  Bot, 
  Clock, 
  Globe,
  MessageSquare,
  Phone,
  Mail
} from 'lucide-react'
import { format } from 'date-fns'

export const ChatMessageInterface = () => {
  const { 
    selectedSession, 
    sendMessage, 
    setTyping,
    typingUsers 
  } = useChat()
  
  const [messageInput, setMessageInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [selectedSession?.messages])

  // Handle typing indicators
  useEffect(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    if (isTyping) {
      setTyping(true)
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false)
        setTyping(false)
      }, 1000)
    }
  }, [isTyping, setTyping])

  const handleInputChange = (value: string) => {
    setMessageInput(value)
    if (!isTyping) {
      setIsTyping(true)
    }
  }

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedSession) return

    sendMessage(selectedSession.id, messageInput.trim())
    setMessageInput('')
    setIsTyping(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!selectedSession) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center h-full">
          <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No session selected</h3>
          <p className="text-muted-foreground text-center">
            Select a chat session from the list to start messaging.
          </p>
        </CardContent>
      </Card>
    )
  }

  const isVisitorTyping = typingUsers.includes(selectedSession.visitorId)

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={`/api/avatar/${selectedSession.visitorId}`} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">
                {selectedSession.visitorName || `Visitor ${selectedSession.visitorId.slice(0, 8)}`}
              </CardTitle>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Session started {format(selectedSession.startedAt, 'MMM d, h:mm a')}</span>
                {isVisitorTyping && (
                  <Badge variant="outline" className="text-xs">
                    typing...
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {selectedSession.visitorEmail && (
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Mail className="h-4 w-4" />
              </Button>
            )}
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <Phone className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <Globe className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
          <div className="space-y-4 py-4">
            {selectedSession.messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              selectedSession.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[70%] ${
                    message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={message.sender === 'user' ? '/api/avatar/user' : `/api/avatar/${selectedSession.visitorId}`} />
                      <AvatarFallback>
                        {message.sender === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`rounded-lg px-3 py-2 ${
                      message.sender === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs opacity-70">
                          {format(message.timestamp, 'h:mm a')}
                        </span>
                        {message.translated && (
                          <Badge variant="outline" className="text-xs">
                            Translated
                          </Badge>
                        )}
                        {message.language && (
                          <Badge variant="outline" className="text-xs">
                            {message.language}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        
        <div className="border-t p-4">
          <div className="flex items-center space-x-2">
            <Input
              value={messageInput}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 