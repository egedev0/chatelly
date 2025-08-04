'use client'

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  IconArrowLeft,
  IconBan,
  IconMessageCircle,
  IconTrash,
  IconUser,
  IconUsers,
  IconActivity,
  IconClock,
  IconGlobe,
  IconSend
} from "@tabler/icons-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Link from "next/link"
import { toast } from "sonner"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"

// Mock data for chat messages
const mockChatData = {
  1: {
    domain: "example.com",
    activeUsers: 12,
    messages: [
      {
        id: 1,
        userId: "user_123",
        username: "John Doe",
        message: "Hello, I need help with my order",
        timestamp: "2024-02-08T10:30:00Z",
        type: "user"
      },
      {
        id: 2,
        userId: "user_456",
        username: "Jane Smith",
        message: "Hi there! How can I assist you today?",
        timestamp: "2024-02-08T10:31:00Z",
        type: "user"
      },
      {
        id: 3,
        userId: "user_123",
        username: "John Doe",
        message: "I placed an order yesterday but haven't received a confirmation email",
        timestamp: "2024-02-08T10:32:00Z",
        type: "user"
      },
      {
        id: 4,
        userId: "user_789",
        username: "Mike Johnson",
        message: "Is anyone available to help?",
        timestamp: "2024-02-08T10:33:00Z",
        type: "user"
      },
      {
        id: 5,
        userId: "user_456",
        username: "Jane Smith",
        message: "@John Doe Let me check that for you. Can you provide your order number?",
        timestamp: "2024-02-08T10:34:00Z",
        type: "user"
      },
      {
        id: 6,
        userId: "user_123",
        username: "John Doe",
        message: "Sure, it's #ORD-2024-001234",
        timestamp: "2024-02-08T10:35:00Z",
        type: "user"
      }
    ]
  },
  2: {
    domain: "mystore.com",
    activeUsers: 3,
    messages: [
      {
        id: 1,
        userId: "user_abc",
        username: "Alice Brown",
        message: "What are your store hours?",
        timestamp: "2024-02-08T09:15:00Z",
        type: "user"
      },
      {
        id: 2,
        userId: "user_def",
        username: "Bob Wilson",
        message: "We're open Monday-Friday 9AM-6PM, weekends 10AM-4PM",
        timestamp: "2024-02-08T09:16:00Z",
        type: "user"
      }
    ]
  }
}

export default function ChatMonitorPage() {
  const params = useParams()
  const siteId = parseInt(params.id as string)
  const chatData = mockChatData[siteId as keyof typeof mockChatData]
  
  const [messages, setMessages] = useState(chatData?.messages || [])
  const [blockedUsers, setBlockedUsers] = useState<string[]>([])
  const [newMessage, setNewMessage] = useState("")

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new messages occasionally
      if (Math.random() > 0.95) {
        const newMessage = {
          id: messages.length + 1,
          userId: `user_${Math.random().toString(36).substr(2, 9)}`,
          username: `User ${Math.floor(Math.random() * 1000)}`,
          message: "New message from user",
          timestamp: new Date().toISOString(),
          type: "user" as const
        }
        setMessages(prev => [...prev, newMessage])
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [messages.length])

  const handleDeleteMessage = (messageId: number) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId))
    toast.success("Message deleted successfully")
  }

  const handleBlockUser = (userId: string, username: string) => {
    setBlockedUsers(prev => [...prev, userId])
    setMessages(prev => prev.filter(msg => msg.userId !== userId))
    toast.success(`User ${username} has been blocked`)
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const adminMessage = {
      id: messages.length + 1,
      userId: "admin",
      username: "Admin",
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: "admin" as const
    }

    setMessages(prev => [...prev, adminMessage])
    setNewMessage("")
    toast.success("Message sent successfully")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getBadgeVariant = (userId: string) => {
    if (userId === "admin") {
      return "destructive" as const
    }
    return "secondary" as const
  }

  const getUserInitials = (username: string) => {
    return username.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (!chatData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Site not found</h2>
          <p className="text-muted-foreground">The requested site could not be found.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard">
              <IconArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

                {/* Header */}
                <div className="px-4 lg:px-6">
                  <div className="flex items-center gap-4 mb-6">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/dashboard">
                        <IconArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                      </Link>
                    </Button>
                  </div>

                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                        <IconMessageCircle className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold">Live Chat Monitor</h1>
                        <p className="text-muted-foreground">{chatData.domain}</p>
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        <IconActivity className="h-3 w-3 mr-1" />
                        {chatData.activeUsers} Active Users
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Chat Messages */}
                <div className="px-4 lg:px-6">
                  <Card className="flex flex-col">
                    <CardHeader className="flex-shrink-0">
                      <CardTitle className="flex items-center gap-2">
                        <IconUsers className="h-5 w-5" />
                        Live Chat Messages
                      </CardTitle>
                      <CardDescription>
                        Monitor real-time conversations between users
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col p-0">
                      <ScrollArea className="h-[500px] p-4">
                        <div className="space-y-4">
                          {messages.length === 0 ? (
                            <div className="text-center py-8">
                              <IconMessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                              <p className="text-muted-foreground">No messages yet</p>
                            </div>
                          ) : (
                            messages.map((message) => (
                              <div key={message.id} className="group relative">
                                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                  <div className="flex-shrink-0">
                                    <Avatar className="w-8 h-8">
                                      <AvatarImage src="" alt={message.username} />
                                      <AvatarFallback className={`text-xs font-medium ${
                                        message.userId === "admin" 
                                          ? "bg-red-100 text-red-700" 
                                          : "bg-blue-100 text-blue-700"
                                      }`}>
                                        {getUserInitials(message.username)}
                                      </AvatarFallback>
                                    </Avatar>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge variant={getBadgeVariant(message.userId)}>
                                        {message.username}
                                        {message.userId === "admin" && " 👑"}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {formatTime(message.timestamp)}
                                      </span>
                                    </div>
                                    <p className="text-sm break-words">{message.message}</p>
                                  </div>
                                </div>
                                
                                {/* Action buttons - shown on hover (not for admin messages) */}
                                {message.userId !== "admin" && (
                                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-7 w-7 p-0 border-red-200 hover:bg-red-50 hover:border-red-300"
                                          onClick={() => handleDeleteMessage(message.id)}
                                        >
                                          <IconTrash className="h-3 w-3 text-red-600" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Delete Message</p>
                                      </TooltipContent>
                                    </Tooltip>
                                    
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-7 w-7 p-0 border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                                          onClick={() => handleBlockUser(message.userId, message.username)}
                                          disabled={blockedUsers.includes(message.userId)}
                                        >
                                          <IconBan className="h-3 w-3 text-orange-600" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Block User</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                      
                      {/* Message Input Area - Fixed at bottom */}
                      <div className="border-t bg-background p-4 flex-shrink-0">
                        <div className="flex gap-2">
                          <Textarea
                            placeholder="Type your message as admin..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="flex-1 min-h-[60px] max-h-[120px] resize-none"
                            rows={2}
                          />
                          <Button 
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                            className="self-end"
                          >
                            <IconSend className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Press Enter to send, Shift+Enter for new line
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}