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
import {
  IconChartBar,
  IconUsers,
  IconMessageCircle,
  IconClock,
  IconTrendingUp,
  IconGlobe,
  IconActivity,
  IconEye
} from "@tabler/icons-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Link from "next/link"
import { useState } from "react"
import { InteractiveWorldMap } from "@/components/interactive-world-map"
import { LocationAnalytics } from "@/components/location-analytics"
import { LocationHeatmap } from "@/components/location-heatmap"

// Mock analytics data for sites
const sitesAnalytics = [
  {
    id: 1,
    domain: "example.com",
    isActive: "active",
    totalMessages: 1247,
    activeUsers: 12,
    avgResponseTime: "2.3s",
    satisfactionRate: 4.2,
    category: "E-commerce",
    description: "Main e-commerce website for online retail",
    monthlyGrowth: "+15%",
    dailyVisitors: "2.4k",
    conversionRate: "3.2%"
  },
  {
    id: 2,
    domain: "mystore.com",
    isActive: "passive",
    totalMessages: 892,
    activeUsers: 3,
    avgResponseTime: "1.8s",
    satisfactionRate: 4.5,
    category: "Retail",
    description: "Online store for fashion and accessories",
    monthlyGrowth: "+8%",
    dailyVisitors: "1.2k",
    conversionRate: "2.8%"
  },
  {
    id: 3,
    domain: "blog.site.org",
    isActive: "progress",
    totalMessages: 234,
    activeUsers: 0,
    avgResponseTime: "3.1s",
    satisfactionRate: 3.8,
    category: "Blog",
    description: "Technology blog and news site",
    monthlyGrowth: "+22%",
    dailyVisitors: "890",
    conversionRate: "1.5%"
  },
  {
    id: 4,
    domain: "company.net",
    isActive: "inactive",
    totalMessages: 45,
    activeUsers: 0,
    avgResponseTime: "4.2s",
    satisfactionRate: 3.2,
    category: "Corporate",
    description: "Corporate website for business services",
    monthlyGrowth: "-5%",
    dailyVisitors: "450",
    conversionRate: "0.8%"
  },
  {
    id: 5,
    domain: "techblog.dev",
    isActive: "active",
    totalMessages: 678,
    activeUsers: 8,
    avgResponseTime: "2.1s",
    satisfactionRate: 4.7,
    category: "Technology",
    description: "Developer blog and tutorials",
    monthlyGrowth: "+31%",
    dailyVisitors: "1.8k",
    conversionRate: "4.1%"
  }
]

export default function AnalyticsPage() {
  const [selectedSite, setSelectedSite] = useState<typeof sitesAnalytics[0] | null>(null)

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return { variant: "default" as const, className: "bg-green-100 text-green-800 border-green-200" }
      case "passive":
        return { variant: "secondary" as const, className: "bg-yellow-100 text-yellow-800 border-yellow-200" }
      case "inactive":
        return { variant: "destructive" as const, className: "bg-red-100 text-red-800 border-red-200" }
      case "progress":
        return { variant: "outline" as const, className: "bg-blue-100 text-blue-800 border-blue-200" }
      default:
        return { variant: "secondary" as const, className: "bg-gray-100 text-gray-800 border-gray-200" }
    }
  }

  const handleSiteClick = (site: typeof sitesAnalytics[0]) => {
    setSelectedSite(site)
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
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                      <IconChartBar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold">Analytics</h1>
                      <p className="text-muted-foreground">View detailed analytics for all your sites</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {!selectedSite ? (
                  /* Sites List */
                  <div className="px-4 lg:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sitesAnalytics.map((site) => {
                        const statusConfig = getStatusConfig(site.isActive)
                        return (
                          <Card 
                            key={site.id} 
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => handleSiteClick(site)}
                          >
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{site.domain}</CardTitle>
                                <Badge variant={statusConfig.variant} className={statusConfig.className}>
                                  {site.isActive.charAt(0).toUpperCase() + site.isActive.slice(1)}
                                </Badge>
                              </div>
                              <CardDescription>{site.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <IconMessageCircle className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Messages</span>
                                  </div>
                                  <p className="text-2xl font-bold">{site.totalMessages.toLocaleString()}</p>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <IconUsers className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Active Users</span>
                                  </div>
                                  <p className="text-2xl font-bold">{site.activeUsers}</p>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <IconClock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Avg Response</span>
                                  </div>
                                  <p className="text-lg font-semibold">{site.avgResponseTime}</p>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Satisfaction</span>
                                  </div>
                                  <p className="text-lg font-semibold">{site.satisfactionRate}/5</p>
                                </div>
                              </div>
                              <div className="mt-4 pt-4 border-t">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">Monthly Growth</span>
                                  <span className={`font-medium ${
                                    site.monthlyGrowth.startsWith('+') ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {site.monthlyGrowth}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  /* Selected Site Analytics */
                  <div className="px-4 lg:px-6">
                    <div className="flex items-center gap-4 mb-6">
                      <Button variant="outline" size="sm" onClick={() => setSelectedSite(null)}>
                        ← Back to Sites
                      </Button>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                        <IconGlobe className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{selectedSite.domain}</h2>
                        <p className="text-muted-foreground">{selectedSite.description}</p>
                      </div>
                      <Badge variant={getStatusConfig(selectedSite.isActive).variant} className={getStatusConfig(selectedSite.isActive).className}>
                        <IconActivity className="h-3 w-3 mr-1" />
                        {selectedSite.isActive.charAt(0).toUpperCase() + selectedSite.isActive.slice(1)}
                      </Badge>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                          <IconUsers className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{selectedSite.activeUsers}</div>
                          <p className="text-xs text-muted-foreground">
                            Currently online
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                          <IconMessageCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{selectedSite.totalMessages.toLocaleString()}</div>
                          <p className="text-xs text-muted-foreground">
                            All time messages
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                          <IconClock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{selectedSite.avgResponseTime}</div>
                          <p className="text-xs text-muted-foreground">
                            Average response time
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
                          <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{selectedSite.satisfactionRate}/5</div>
                          <p className="text-xs text-muted-foreground">
                            User satisfaction
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Interactive World Map & Location Analytics */}
                    <div className="space-y-6">
                      <InteractiveWorldMap />
                      <LocationHeatmap />
                      <LocationAnalytics />
                    </div>

                    {/* Additional Analytics */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Performance Metrics</CardTitle>
                          <CardDescription>Key performance indicators for {selectedSite.domain}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Daily Visitors:</span>
                            <span className="text-sm font-bold">{selectedSite.dailyVisitors}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Conversion Rate:</span>
                            <span className="text-sm font-bold">{selectedSite.conversionRate}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Monthly Growth:</span>
                            <span className={`text-sm font-bold ${
                              selectedSite.monthlyGrowth.startsWith('+') ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {selectedSite.monthlyGrowth}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Category:</span>
                            <Badge variant="outline">{selectedSite.category}</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Quick Actions</CardTitle>
                          <CardDescription>Manage and monitor this site</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <Button asChild className="w-full">
                            <Link href={`/sites/${selectedSite.id}`}>
                              <IconEye className="h-4 w-4 mr-2" />
                              View Site Details
                            </Link>
                          </Button>
                          <Button asChild variant="outline" className="w-full">
                            <Link href={`/sites/${selectedSite.id}/chat`}>
                              <IconMessageCircle className="h-4 w-4 mr-2" />
                              View Live Chat
                            </Link>
                          </Button>
                          <Button variant="outline" className="w-full">
                            <IconChartBar className="h-4 w-4 mr-2" />
                            Export Analytics
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}