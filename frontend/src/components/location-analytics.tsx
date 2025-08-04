'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  IconMapPin, 
  IconUsers, 
  IconClock,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconWifi,
  IconDeviceMobile,
  IconDeviceDesktop,
  IconDeviceTablet
} from "@tabler/icons-react"

// Mock real-time location data
const realtimeLocationData = [
  {
    id: 1,
    country: "United States",
    city: "New York",
    flag: "🇺🇸",
    users: 45,
    trend: "up",
    change: "+12%",
    avgSessionTime: "4m 32s",
    bounceRate: "23%",
    devices: { mobile: 65, desktop: 30, tablet: 5 },
    connectionSpeed: "Fast",
    peakHours: "14:00-16:00 EST"
  },
  {
    id: 2,
    country: "Turkey",
    city: "Istanbul",
    flag: "🇹🇷",
    users: 32,
    trend: "up",
    change: "+8%",
    avgSessionTime: "3m 45s",
    bounceRate: "18%",
    devices: { mobile: 75, desktop: 20, tablet: 5 },
    connectionSpeed: "Medium",
    peakHours: "15:00-17:00 TRT"
  },
  {
    id: 3,
    country: "United Kingdom",
    city: "London",
    flag: "🇬🇧",
    users: 19,
    trend: "down",
    change: "-3%",
    avgSessionTime: "5m 12s",
    bounceRate: "15%",
    devices: { mobile: 55, desktop: 40, tablet: 5 },
    connectionSpeed: "Fast",
    peakHours: "13:00-15:00 GMT"
  },
  {
    id: 4,
    country: "Germany",
    city: "Berlin",
    flag: "🇩🇪",
    users: 13,
    trend: "stable",
    change: "0%",
    avgSessionTime: "4m 18s",
    bounceRate: "20%",
    devices: { mobile: 60, desktop: 35, tablet: 5 },
    connectionSpeed: "Fast",
    peakHours: "14:00-16:00 CET"
  }
]

interface LocationAnalyticsProps {
  className?: string
}

export function LocationAnalytics({ className }: LocationAnalyticsProps) {
  const [selectedMetric, setSelectedMetric] = useState<'users' | 'sessions' | 'bounce'>('users')
  const [isLive, setIsLive] = useState(true)

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <IconTrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <IconTrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <IconMinus className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800'
      case 'down':
        return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950 dark:border-gray-800'
    }
  }

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile':
        return <IconDeviceMobile className="h-4 w-4" />
      case 'desktop':
        return <IconDeviceDesktop className="h-4 w-4" />
      case 'tablet':
        return <IconDeviceTablet className="h-4 w-4" />
      default:
        return <IconDeviceMobile className="h-4 w-4" />
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Live Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-sm font-medium">
            {isLive ? 'Live Analytics' : 'Offline Mode'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={selectedMetric === 'users' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedMetric('users')}
          >
            Users
          </Button>
          <Button
            variant={selectedMetric === 'sessions' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedMetric('sessions')}
          >
            Sessions
          </Button>
          <Button
            variant={selectedMetric === 'bounce' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedMetric('bounce')}
          >
            Bounce Rate
          </Button>
        </div>
      </div>

      {/* Location Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {realtimeLocationData.map((location) => (
          <Card key={location.id} className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{location.flag}</span>
                  <div>
                    <CardTitle className="text-lg">{location.city}</CardTitle>
                    <CardDescription>{location.country}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(location.trend)}
                  <Badge variant="outline" className={getTrendColor(location.trend)}>
                    {location.change}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Main Metrics */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{location.users}</div>
                  <div className="text-xs text-muted-foreground">Active Users</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">{location.avgSessionTime}</div>
                  <div className="text-xs text-muted-foreground">Avg Session</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">{location.bounceRate}</div>
                  <div className="text-xs text-muted-foreground">Bounce Rate</div>
                </div>
              </div>

              {/* Device Breakdown */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Device Distribution</span>
                  <IconWifi className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      {getDeviceIcon('mobile')}
                      <span>Mobile</span>
                    </div>
                    <span className="font-medium">{location.devices.mobile}%</span>
                  </div>
                  <Progress value={location.devices.mobile} className="h-1" />
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      {getDeviceIcon('desktop')}
                      <span>Desktop</span>
                    </div>
                    <span className="font-medium">{location.devices.desktop}%</span>
                  </div>
                  <Progress value={location.devices.desktop} className="h-1" />
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      {getDeviceIcon('tablet')}
                      <span>Tablet</span>
                    </div>
                    <span className="font-medium">{location.devices.tablet}%</span>
                  </div>
                  <Progress value={location.devices.tablet} className="h-1" />
                </div>
              </div>

              {/* Additional Info */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Connection:</span>
                    <div className="font-medium">{location.connectionSpeed}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Peak Hours:</span>
                    <div className="font-medium">{location.peakHours}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconMapPin className="h-5 w-5 text-blue-600" />
            Location Summary
          </CardTitle>
          <CardDescription>Overall location-based performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">109</div>
              <div className="text-sm text-muted-foreground">Total Active Users</div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">+5.2% from yesterday</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">4m 27s</div>
              <div className="text-sm text-muted-foreground">Avg Session Time</div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">+12s from yesterday</div>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">19%</div>
              <div className="text-sm text-muted-foreground">Overall Bounce Rate</div>
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">-2% from yesterday</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">6</div>
              <div className="text-sm text-muted-foreground">Active Countries</div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">+1 new country</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}