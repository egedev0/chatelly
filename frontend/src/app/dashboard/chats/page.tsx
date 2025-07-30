'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MessageSquare,
  Search,
  Send,
  Clock,
  Globe,
  User,
  Bot,
  Filter,
} from 'lucide-react'

const chats = [
  {
    id: 1,
    website: 'example.com',
    visitor: {
      name: 'Anonymous User',
      avatar: '',
      id: 'visitor_1',
    },
    lastMessage: 'Hello, I need help with your pricing plans',
    time: '2 minutes ago',
    status: 'active',
    unread: 2,
    messages: [
      {
        id: 1,
        sender: 'visitor',
        content: 'Hello, I need help with your pricing plans',
        time: '2 minutes ago',
      },
      {
        id: 2,
        sender: 'bot',
        content: 'Hello! I\'d be happy to help you with our pricing plans. We have three main options: Starter ($9/month), Pro ($29/month), and Pro Max ($99/month). Which one would you like to know more about?',
        time: '1 minute ago',
      },
    ],
  },
  {
    id: 2,
    website: 'mystore.com',
    visitor: {
      name: 'John Smith',
      avatar: '',
      id: 'visitor_2',
    },
    lastMessage: 'What are your shipping options?',
    time: '15 minutes ago',
    status: 'waiting',
    unread: 1,
    messages: [
      {
        id: 1,
        sender: 'visitor',
        content: 'What are your shipping options?',
        time: '15 minutes ago',
      },
    ],
  },
  {
    id: 3,
    website: 'blog.example.com',
    visitor: {
      name: 'Sarah Johnson',
      avatar: '',
      id: 'visitor_3',
    },
    lastMessage: 'Thank you for your help!',
    time: '1 hour ago',
    status: 'resolved',
    unread: 0,
    messages: [
      {
        id: 1,
        sender: 'visitor',
        content: 'I\'m having trouble finding the contact information',
        time: '2 hours ago',
      },
      {
        id: 2,
        sender: 'admin',
        content: 'You can find our contact information in the footer of the website, or you can reach us at contact@example.com',
        time: '1 hour ago',
      },
      {
        id: 3,
        sender: 'visitor',
        content: 'Thank you for your help!',
        time: '1 hour ago',
      },
    ],
  },
]

export default function ChatsPage() {
  const [selectedChat, setSelectedChat] = useState(chats[0])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredChats = chats.filter((chat) => {
    const matchesSearch = chat.visitor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         chat.website.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || chat.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    
    // TODO: Implement message sending logic
    console.log('Sending message:', newMessage)
    setNewMessage('')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'waiting':
        return 'bg-yellow-500'
      case 'resolved':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chats</h1>
          <p className="text-muted-foreground">
            Manage conversations with your website visitors
          </p>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Chat List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              Conversations
            </CardTitle>
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Chats</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="waiting">Waiting</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <div className="space-y-1 p-4">
                {filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedChat.id === chat.id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedChat(chat)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={chat.visitor.avatar} />
                          <AvatarFallback>
                            {chat.visitor.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(chat.status)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">
                            {chat.visitor.name}
                          </p>
                          {chat.unread > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {chat.unread}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Globe className="h-3 w-3" />
                          <span>{chat.website}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {chat.lastMessage}
                        </p>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <Clock className="mr-1 h-3 w-3" />
                          {chat.time}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedChat.visitor.avatar} />
                  <AvatarFallback>
                    {selectedChat.visitor.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{selectedChat.visitor.name}</CardTitle>
                  <CardDescription className="flex items-center">
                    <Globe className="mr-1 h-3 w-3" />
                    {selectedChat.website}
                  </CardDescription>
                </div>
              </div>
              <Badge variant={selectedChat.status === 'active' ? 'default' : 'secondary'}>
                {selectedChat.status}
              </Badge>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            <ScrollArea className="h-[400px] p-4">
              <div className="space-y-4">
                {selectedChat.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.sender === 'visitor' ? '' : 'flex-row-reverse space-x-reverse'
                    }`}
                  >
                    <Avatar className="h-6 w-6">
                      {message.sender === 'visitor' ? (
                        <>
                          <AvatarImage src={selectedChat.visitor.avatar} />
                          <AvatarFallback>
                            <User className="h-3 w-3" />
                          </AvatarFallback>
                        </>
                      ) : (
                        <AvatarFallback>
                          {message.sender === 'bot' ? (
                            <Bot className="h-3 w-3" />
                          ) : (
                            'A'
                          )}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.sender === 'visitor'
                          ? 'bg-gray-100'
                          : message.sender === 'bot'
                          ? 'bg-blue-100'
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">{message.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Separator />
            <div className="p-4">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} size="sm">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}