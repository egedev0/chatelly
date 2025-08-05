'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { WebSocketStatus } from "@/components/websocket-status"
import { ChatSessionList } from "@/components/chat/chat-session-list"
import { ChatMessageInterface } from "@/components/chat/chat-message-interface"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useChat } from '@/contexts/chat-context'
import { websiteService } from '@/lib/services/website-service'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

export default function ChatPage() {
  const params = useParams()
  const websiteId = params.id as string
  const { connect, disconnect, connectionStatus } = useChat()
  const [website, setWebsite] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadWebsite()
  }, [websiteId])

  useEffect(() => {
    if (website?.widget_key) {
      connectToWebSocket()
    }
  }, [website])

  const loadWebsite = async () => {
    try {
      setLoading(true)
      const websiteData = await websiteService.getWebsite(parseInt(websiteId))
      setWebsite(websiteData)
    } catch (error) {
      console.error('Failed to load website:', error)
      toast({
        title: "Error",
        description: "Failed to load website data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const connectToWebSocket = async () => {
    try {
      await connect(website.widget_key)
      toast({
        title: "Connected",
        description: "WebSocket connection established.",
      })
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
      toast({
        title: "Connection Error",
        description: "Failed to connect to chat server.",
        variant: "destructive",
      })
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading chat...</span>
      </div>
    )
  }

  return (
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
              {/* Header with connection status */}
              <div className="flex items-center justify-between px-4 lg:px-6">
                <div>
                  <h1 className="text-2xl font-bold">
                    {website?.name} - Live Chat
                  </h1>
                  <p className="text-muted-foreground">
                    Manage real-time conversations with your visitors
                  </p>
                </div>
                <WebSocketStatus />
              </div>

              {/* Chat Interface */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 px-4 lg:px-6 h-[calc(100vh-200px)]">
                {/* Session List */}
                <div className="lg:col-span-1">
                  <ChatSessionList />
                </div>

                {/* Message Interface */}
                <div className="lg:col-span-2">
                  <ChatMessageInterface />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}