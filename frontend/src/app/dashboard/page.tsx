'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AnimatedTabs } from '@/components/ui/animated-tabs'
import {
  Globe,
  MessageSquare,
  Users,
  TrendingUp,
  Plus,
  BarChart3,
  Clock,
  Eye,
} from 'lucide-react'

const stats = [
  {
    name: 'Total Websites',
    value: '3',
    icon: Globe,
    change: '+2',
    changeType: 'positive',
  },
  {
    name: 'Active Chats',
    value: '24',
    icon: MessageSquare,
    change: '+12',
    changeType: 'positive',
  },
  {
    name: 'Total Visitors',
    value: '1,234',
    icon: Users,
    change: '+5.2%',
    changeType: 'positive',
  },
  {
    name: 'Response Rate',
    value: '98.5%',
    icon: TrendingUp,
    change: '+2.1%',
    changeType: 'positive',
  },
]

const recentChats = [
  {
    id: 1,
    website: 'example.com',
    visitor: 'Anonymous User',
    lastMessage: 'Hello, I need help with...',
    time: '2 minutes ago',
    status: 'active',
  },
  {
    id: 2,
    website: 'mystore.com',
    visitor: 'John Smith',
    lastMessage: 'What are your shipping options?',
    time: '15 minutes ago',
    status: 'waiting',
  },
  {
    id: 3,
    website: 'blog.example.com',
    visitor: 'Sarah Johnson',
    lastMessage: 'Thank you for your help!',
    time: '1 hour ago',
    status: 'resolved',
  },
]

const websites = [
  {
    id: 1,
    name: 'Main Website',
    domain: 'example.com',
    chats: 12,
    status: 'active',
  },
  {
    id: 2,
    name: 'Online Store',
    domain: 'mystore.com',
    chats: 8,
    status: 'active',
  },
  {
    id: 3,
    name: 'Blog',
    domain: 'blog.example.com',
    chats: 4,
    status: 'active',
  },
]

export default function DashboardPage() {
  const dashboardTabs = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.name}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">{stat.change}</span> from last month
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "recent-chats",
      label: "Recent Chats",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Recent Chats</CardTitle>
            <CardDescription>
              Latest conversations from your websites
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentChats.map((chat) => (
                <div key={chat.id} className="flex items-center space-x-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium">{chat.visitor}</p>
                      <Badge
                        variant={chat.status === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {chat.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{chat.website}</p>
                    <p className="text-sm">{chat.lastMessage}</p>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    {chat.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      id: "websites",
      label: "Websites",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Your Websites</CardTitle>
            <CardDescription>
              Manage your chat widgets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {websites.map((website) => (
                <div key={website.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{website.name}</p>
                    <p className="text-xs text-muted-foreground">{website.domain}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                      <span>{website.chats}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {website.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Analytics
            </Button>
          </CardContent>
        </Card>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your chat widgets.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Website
        </Button>
      </div>

      {/* Animated Tabs */}
      <AnimatedTabs tabs={dashboardTabs} />
    </div>
  )
}