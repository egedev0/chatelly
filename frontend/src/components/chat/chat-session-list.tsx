'use client'

import { useChat } from '@/contexts/chat-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  MessageSquare, 
  User, 
  Clock, 
  Phone, 
  Mail,
  MoreVertical,
  Archive,
  X
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export const ChatSessionList = () => {
  const { 
    activeSessions, 
    selectedSession, 
    selectSession, 
    endSession, 
    archiveSession,
    typingUsers 
  } = useChat()

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'ended':
        return 'bg-gray-500'
      case 'archived':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getSessionStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active'
      case 'ended':
        return 'Ended'
      case 'archived':
        return 'Archived'
      default:
        return 'Unknown'
    }
  }

  const handleSessionSelect = (sessionId: string) => {
    selectSession(sessionId)
  }

  const handleEndSession = (sessionId: string) => {
    endSession(sessionId)
  }

  const handleArchiveSession = (sessionId: string) => {
    archiveSession(sessionId)
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Active Sessions</span>
          <Badge variant="secondary">{activeSessions.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          {activeSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No active sessions</h3>
              <p className="text-muted-foreground">
                When visitors start chatting, their sessions will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {activeSessions.map((session) => {
                const isSelected = selectedSession?.id === session.id
                const isTyping = typingUsers.includes(session.visitorId)
                const lastMessage = session.messages[session.messages.length - 1]
                
                return (
                  <div
                    key={session.id}
                    className={`relative p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => handleSessionSelect(session.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`/api/avatar/${session.visitorId}`} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium truncate">
                              {session.visitorName || `Visitor ${session.visitorId.slice(0, 8)}`}
                            </span>
                            <div className={`w-2 h-2 rounded-full ${getSessionStatusColor(session.status)}`} />
                          </div>
                          
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span className="truncate">
                              {lastMessage ? lastMessage.content : 'No messages yet'}
                            </span>
                            {isTyping && (
                              <Badge variant="outline" className="text-xs">
                                typing...
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                            <span>
                              {formatDistanceToNow(session.startedAt, { addSuffix: true })}
                            </span>
                            {session.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {session.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {session.visitorEmail && (
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <Mail className="h-3 w-3" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <Phone className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEndSession(session.id)
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleArchiveSession(session.id)
                          }}
                        >
                          <Archive className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
} 