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
  IconMessageCircle,
  IconTrash,
  IconBan,
  IconUser,
  IconUsers,
  IconActivity,
  IconSend,
  IconGlobe
} from "@tabler/icons-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "sonner"
import { useState, useEffect } from "react"

// Mock data for sites and their conversations
const sitesData = [
  {
    id: 1,
    domain: "example.com",
    activeUsers: 12,
    isActive: true,
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
      }
    ]
  },
  {
    id: 2,
    domain: "mystore.com",
    activeUsers: 3,
    isActive: true,
    messages: [
      {
        id: 1,
        userId: "user_abc",
        username: "Alice Brown",
        message: "What are your store hours?",
        timestamp: "2024-02-08T09:15:00Z",
        type: "user"
      }
    ]
  },
  {
    id: 3,
    domain: "blog.site.org",
    activeUsers: 0,
    isActive: false,
    messages: []
  },
  {
    id: 4,
    domain: "company.net",
    activeUsers: 8,
    isActive: true,
    messages: [
      {
        id: 1,
        userId: "user_xyz",
        username: "Mike Johnson",
        message: "I'm having trouble with the login system",
        timestamp: "2024-02-08T11:00:00Z",
        type: "user"
      }
    ]
  }
]

export default function LiveConversationsPage() {
  const [selectedSite, setSelectedSite] = useState(sitesData[0])
  const [messages, setMessages] = useState(selectedSite.messages)
  const [newMessage, setNewMessage] = useState("")
  const [blockedUsers, setBlockedUsers] = useState<string[]>([])

  useEffect(() => {
    setMessages(selectedSite.messages)
  }, [selectedSite])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedSite.isActive && Math.random() > 0.98) {
        const newMsg = {
          id: messages.length + 1,
          userId: `user_${Math.random().toString(36).substr(2, 9)}`,
          username: `User ${Math.floor(Math.random() * 1000)}`,
          message: "New message from user",
          timestamp: new Date().toISOString(),
          type: "user" as const
        }
        setMessages(prev => [...prev, newMsg])
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [messages.length, selectedSite.isActive])

  const handleSiteSelect = (site: typeof sitesData[0]) => {
    setSelectedSite(site)
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

  const handleDeleteMessage = (messageId: number) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId))
    toast.success("Message deleted successfully")
  }

  const handleBlockUser = (userId: string, username: string) => {
    setBlockedUsers(prev => [...prev, userId])
    setMessages(prev => prev.filter(msg => msg.userId !== userId))
    toast.success(`User ${username} has been blocked`)
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
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                      <IconMessageCircle className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold">Live Conversations</h1>
                      <p className="text-muted-foreground">Monitor and participate in real-time conversations across all sites</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Main Content */}
                <div className="px-4 lg:px-6 flex-1">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
                    
                    {/* Sites List */}
                    <div className="lg:col-span-1">
                      <Card className="h-full">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <IconGlobe className="h-5 w-5" />
                            Sites
                          </CardTitle>
                          <CardDescription>
                            Select a site to view its live conversations
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                          <ScrollArea className="h-[calc(100vh-350px)]">
                            <div className="p-3 space-y-2">
                              {sitesData.map((site) => (
                                <div
                                  key={site.id}
                                  className={`cursor-pointer transition-colors hover:bg-muted/50 p-3 rounded-lg border ${
                                    selectedSite.id === site.id ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : ''
                                  }`}
                                  onClick={() => handleSiteSelect(site)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-medium text-sm truncate">{site.domain}</h3>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge variant={site.isActive ? "default" : "secondary"} className="text-xs px-1.5 py-0.5">
                                          <IconActivity className="h-2.5 w-2.5 mr-1" />
                                          {site.activeUsers}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                          {site.messages.length} msgs
                                        </span>
                                      </div>
                                    </div>
                                    {site.isActive && (
                                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0 ml-2" />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Chat Area */}
                    <div className="lg:col-span-2">
                      <Card className="h-full flex flex-col">
                        <CardHeader className="flex-shrink-0">
                          <CardTitle className="flex items-center gap-2">
                            <IconUsers className="h-5 w-5" />
                            {selectedSite.domain}
                          </CardTitle>
                          <CardDescription>
                            Live chat for {selectedSite.domain} • {selectedSite.activeUsers} active users
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col p-0">
                          <ScrollArea className="flex-1 p-4">
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
                          
                          {/* Message Input Area */}
                          <div className="border-t bg-background p-4 flex-shrink-0">
                            <div className="flex gap-2">
                              <Textarea
                                placeholder={`Send message to ${selectedSite.domain} users...`}
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
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}