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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  IconArrowLeft,
  IconCopy,
  IconEye,
  IconMessageCircle,
  IconSettings,
  IconUsers,
  IconActivity,
  IconClock,
  IconTrendingUp,
  IconGlobe,
  IconCode,
  IconCamera,
  IconUpload,
  IconX
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
import { useState, useRef } from "react"
import { InteractiveWorldMap } from "@/components/interactive-world-map"
import { LocationAnalytics } from "@/components/location-analytics"
import { LocationHeatmap } from "@/components/location-heatmap"
import { Icon } from "lucide-react"

// Mock data - gerçek uygulamada API'den gelecek
const getSiteData = (id: string) => {
  const sites = [
    {
      id: 1,
      domain: "example.com",
      isActive: "active",
      userCount: "12/100",
      widgetId: "widget_abc123",
      createdAt: "2024-01-15",
      lastActivity: "2024-01-31T14:30:00Z",
      totalMessages: 1247,
      activeUsers: 12,
      avgResponseTime: "2.3s",
      satisfactionRate: 4.2,
      category: "E-commerce",
      description: "Main e-commerce website for online retail",
      settings: {
        theme: "light",
        position: "bottom-right",
        language: "en",
        autoGreeting: true,
        moderationEnabled: true
      }
    },
    {
      id: 2,
      domain: "mystore.com",
      isActive: "passive",
      userCount: "3/50",
      widgetId: "widget_def456",
      createdAt: "2024-01-10",
      lastActivity: "2024-01-31T12:15:00Z",
      totalMessages: 892,
      activeUsers: 3,
      avgResponseTime: "1.8s",
      satisfactionRate: 4.5,
      category: "Retail",
      description: "Online store for fashion and accessories",
      settings: {
        theme: "dark",
        position: "bottom-left",
        language: "tr",
        autoGreeting: false,
        moderationEnabled: true
      }
    }
  ]

  return sites.find(site => site.id === parseInt(id)) || sites[0]
}

export default function SiteDetailPage() {
  const params = useParams()
  const siteId = params.id as string
  const site = getSiteData(siteId)

  // State for settings
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [triggerIconFile, setTriggerIconFile] = useState<File | null>(null)
  const [triggerButtonColor, setTriggerButtonColor] = useState("#3b82f6")
  const [widgetBackgroundColor, setWidgetBackgroundColor] = useState("#ffffff")
  const [chatBubbleColor, setChatBubbleColor] = useState("#f3f4f6")
  const [bubbleStyle, setBubbleStyle] = useState<"sharp" | "rounded">("rounded")
  const [domain, setDomain] = useState(site.domain)
  const [maxUsers, setMaxUsers] = useState("100")
  const [triggerPosition, setTriggerPosition] = useState("bottom-right")
  const [chatDirection, setChatDirection] = useState("right")

  // File input refs
  const logoInputRef = useRef<HTMLInputElement>(null)
  const triggerIconInputRef = useRef<HTMLInputElement>(null)

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return { variant: "secondary" as const, className: "bg-green-100 text-green-800 border-green-200 h-5 min-w-5 px-1 font-mono tabular-nums", icon: IconActivity }
      case "passive":
        return { variant: "secondary" as const, className: "bg-yellow-100 text-yellow-800 border-yellow-200 h-5 min-w-5 px-1 font-mono tabular-nums", icon: IconClock }
      case "inactive":
        return { variant: "destructive" as const, className: "bg-red-100 text-red-800 border-red-200 h-5 min-w-5 px-1 font-mono tabular-nums", icon: IconEye }
      case "progress":
        return { variant: "outline" as const, className: "bg-blue-100 text-blue-800 border-blue-200 h-5 min-w-5 px-1 font-mono tabular-nums", icon: IconTrendingUp }
      default:
        return { variant: "secondary" as const, className: "bg-gray-100 text-gray-800 border-gray-200 h-5 min-w-5 px-1 font-mono tabular-nums", icon: IconActivity }
    }
  }

  const statusConfig = getStatusConfig(site.isActive)
  const StatusIcon = statusConfig.icon

  const copyWidgetId = () => {
    navigator.clipboard.writeText(site.widgetId)
    toast.success("Widget ID copied to clipboard!", {
      description: `Widget ID: ${site.widgetId} for ${site.domain}`,
      duration: 3000,
    })
  }

  // File upload handlers
  const handleFileUpload = (file: File, type: 'logo' | 'triggerIcon') => {
    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type", {
        description: "Please upload PNG, JPEG, WebP, or JPG files only.",
      })
      return
    }

    // Validate file size (3MB max)
    const maxSize = 3 * 1024 * 1024 // 3MB in bytes
    if (file.size > maxSize) {
      toast.error("File too large", {
        description: "Please upload files smaller than 3MB.",
      })
      return
    }

    if (type === 'logo') {
      setLogoFile(file)
      toast.success("Logo uploaded successfully!")
    } else {
      setTriggerIconFile(file)
      toast.success("Trigger icon uploaded successfully!")
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent, type: 'logo' | 'triggerIcon') => {
    e.preventDefault()
    e.stopPropagation()

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0], type)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'triggerIcon') => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0], type)
    }
  }

  const removeFile = (type: 'logo' | 'triggerIcon') => {
    if (type === 'logo') {
      setLogoFile(null)
      if (logoInputRef.current) logoInputRef.current.value = ''
    } else {
      setTriggerIconFile(null)
      if (triggerIconInputRef.current) triggerIconInputRef.current.value = ''
    }
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
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                        <IconGlobe className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex">
                        <div>
                          <div className="flex align-center gap-2">
                            <h1 className="text-2xl font-bold">{site.domain}</h1>
                            <Badge variant={statusConfig.variant} className={statusConfig.className}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {site.isActive.charAt(0).toUpperCase() + site.isActive.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">{site.description}</p>
                        </div>

                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={copyWidgetId}>
                        <IconCopy className="h-4 w-4 mr-2" />
                        Copy Widget ID
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Stats Cards */}
                <div className="px-4 lg:px-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <IconUsers className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{site.activeUsers} / 100</div>
                        <p className="text-xs text-muted-foreground">
                          total capacity
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                        <IconMessageCircle className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{site.totalMessages.toLocaleString()}</div>
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
                        <div className="text-2xl font-bold">{site.avgResponseTime}</div>
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
                        <div className="text-2xl font-bold">{site.satisfactionRate}/5</div>
                        <p className="text-xs text-muted-foreground">
                          User satisfaction
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Tabs */}
                <div className="px-4 lg:px-6">
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="analytics">Analytics</TabsTrigger>
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                      <TabsTrigger value="integration">Integration</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 max-w-2xl">
                        <Card>
                          <CardHeader>
                            <CardTitle>Site Information</CardTitle>
                            <CardDescription>Basic information about this site</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Domain:</span>
                              <span className="text-sm">{site.domain}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Category:</span>
                              <span className="text-sm">{site.category}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Created:</span>
                              <span className="text-sm">{new Date(site.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Last Activity:</span>
                              <span className="text-sm">{new Date(site.lastActivity).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Max User Capacity:</span>
                              <span className="text-sm font-semibold">50 / 1000 users</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Widget ID:</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-mono">{site.widgetId}</span>
                                <Button variant="ghost" size="sm" onClick={copyWidgetId}>
                                  <IconCopy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-6">


                      {/* System Analytics */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Device Analytics</CardTitle>
                            <CardDescription>User device breakdown</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Mobile</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                  <div className="w-3/5 h-full bg-blue-500"></div>
                                </div>
                                <span className="text-sm font-medium">60%</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Desktop</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                  <div className="w-1/3 h-full bg-green-500"></div>
                                </div>
                                <span className="text-sm font-medium">35%</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Tablet</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                  <div className="w-1/20 h-full bg-orange-500"></div>
                                </div>
                                <span className="text-sm font-medium">5%</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Browser Analytics</CardTitle>
                            <CardDescription>User browser breakdown</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Chrome</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                  <div className="w-3/4 h-full bg-blue-500"></div>
                                </div>
                                <span className="text-sm font-medium">75%</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Safari</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                  <div className="w-1/6 h-full bg-gray-500"></div>
                                </div>
                                <span className="text-sm font-medium">15%</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Firefox</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                  <div className="w-1/12 h-full bg-orange-500"></div>
                                </div>
                                <span className="text-sm font-medium">8%</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Other</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                  <div className="w-1/50 h-full bg-purple-500"></div>
                                </div>
                                <span className="text-sm font-medium">2%</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Interactive World Map & Location Analytics */}
                      <InteractiveWorldMap />

                      {/* Activity Heatmap */}
                      <LocationHeatmap />

                      {/* Detailed Location Analytics */}
                      <LocationAnalytics />
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Logo & Branding */}
                        <Card className="lg:col-span-2">
                          <CardHeader>
                            <CardTitle>Logo & Branding</CardTitle>
                            <CardDescription>Customize your widget branding</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            {/* Logo and Trigger Icon Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Logo Upload */}
                              <div className="space-y-2">
                                <Label htmlFor="logo-upload" className="text-sm font-medium">Upload Logo</Label>
                                <div
                                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors relative"
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDrop(e, 'logo')}
                                  onClick={() => logoInputRef.current?.click()}
                                >
                                  {logoFile ? (
                                    <div className="relative">
                                      <img
                                        src={URL.createObjectURL(logoFile)}
                                        alt="Logo preview"
                                        className="h-16 w-auto mx-auto mb-2 rounded"
                                      />
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          removeFile('logo')
                                        }}
                                      >
                                        <IconX className="h-3 w-3" />
                                      </Button>
                                      <p className="text-xs text-muted-foreground">{logoFile.name}</p>
                                    </div>
                                  ) : (
                                    <>
                                      <IconUpload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                      <p className="text-sm text-muted-foreground mb-1">Drag & drop or click to upload logo</p>
                                      <p className="text-xs text-muted-foreground">Max 3MB • PNG, JPEG, WebP, JPG</p>
                                    </>
                                  )}
                                  <input
                                    ref={logoInputRef}
                                    type="file"
                                    accept=".png,.jpeg,.jpg,.webp"
                                    className="hidden"
                                    onChange={(e) => handleFileInputChange(e, 'logo')}
                                  />
                                </div>
                              </div>

                              {/* Trigger Icon Upload */}
                              <div className="space-y-2">
                                <Label htmlFor="trigger-icon" className="text-sm font-medium">Trigger Icon</Label>
                                <div
                                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors relative"
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDrop(e, 'triggerIcon')}
                                  onClick={() => triggerIconInputRef.current?.click()}
                                >
                                  {triggerIconFile ? (
                                    <div className="relative">
                                      <img
                                        src={URL.createObjectURL(triggerIconFile)}
                                        alt="Trigger icon preview"
                                        className="h-16 w-auto mx-auto mb-2 rounded"
                                      />
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          removeFile('triggerIcon')
                                        }}
                                      >
                                        <IconX className="h-3 w-3" />
                                      </Button>
                                      <p className="text-xs text-muted-foreground">{triggerIconFile.name}</p>
                                    </div>
                                  ) : (
                                    <>
                                      <IconUpload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                      <p className="text-sm text-muted-foreground mb-1">Drag & drop or click to upload icon</p>
                                      <p className="text-xs text-muted-foreground">Max 3MB • PNG, JPEG, WebP, JPG</p>
                                    </>
                                  )}
                                  <input
                                    ref={triggerIconInputRef}
                                    type="file"
                                    accept=".png,.jpeg,.jpg,.webp"
                                    className="hidden"
                                    onChange={(e) => handleFileInputChange(e, 'triggerIcon')}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Text Fields */}
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="title" className="text-sm font-medium">Title</Label>
                                <Input
                                  id="title"
                                  type="text"
                                  placeholder="Chat Support"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                                <textarea
                                  id="description"
                                  className="w-full px-3 py-2 border border-input rounded-md resize-none"
                                  rows={3}
                                  placeholder="We're here to help you!"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* General Settings */}
                        <Card className="lg:col-span-2">
                          <CardHeader>
                            <CardTitle>General Settings</CardTitle>
                            <CardDescription>Configure domain, user limits, colors, and chat bubble style</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            {/* Domain and Max Users */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="domain" className="text-sm font-medium">Domain</Label>
                                <Input
                                  id="domain"
                                  type="text"
                                  value={domain}
                                  onChange={(e) => setDomain(e.target.value)}
                                  placeholder="example.com"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="max-users" className="text-sm font-medium">Max Users in Chat</Label>
                                <Select value={maxUsers} onValueChange={setMaxUsers}>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select max users" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="100">100 users</SelectItem>
                                    <SelectItem value="250">250 users</SelectItem>
                                    <SelectItem value="500">500 users</SelectItem>
                                    <SelectItem value="1000">1000 users</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Colors */}
                            <div className="space-y-4">
                              <h4 className="text-sm font-medium">Colors</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Trigger Button Color</Label>
                                  <div className="flex items-center gap-3">
                                    <div className="relative">
                                      <input
                                        type="color"
                                        value={triggerButtonColor}
                                        onChange={(e) => setTriggerButtonColor(e.target.value)}
                                        className="w-12 h-12 border-2 border-input rounded-full cursor-pointer overflow-hidden"
                                        style={{
                                          WebkitAppearance: 'none',
                                          MozAppearance: 'none',
                                          appearance: 'none',
                                          backgroundColor: 'transparent',
                                          padding: '2px'
                                        }}
                                      />
                                      <div
                                        className="absolute inset-1 rounded-full pointer-events-none"
                                        style={{ backgroundColor: triggerButtonColor }}
                                      />
                                    </div>
                                    <span className="text-sm text-muted-foreground font-mono">{triggerButtonColor}</span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Widget Background Color</Label>
                                  <div className="flex items-center gap-3">
                                    <div className="relative">
                                      <input
                                        type="color"
                                        value={widgetBackgroundColor}
                                        onChange={(e) => setWidgetBackgroundColor(e.target.value)}
                                        className="w-12 h-12 border-2 border-input rounded-full cursor-pointer overflow-hidden"
                                        style={{
                                          WebkitAppearance: 'none',
                                          MozAppearance: 'none',
                                          appearance: 'none',
                                          backgroundColor: 'transparent',
                                          padding: '2px'
                                        }}
                                      />
                                      <div
                                        className="absolute inset-1 rounded-full pointer-events-none"
                                        style={{ backgroundColor: widgetBackgroundColor }}
                                      />
                                    </div>
                                    <span className="text-sm text-muted-foreground font-mono">{widgetBackgroundColor}</span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Chat Bubble Color</Label>
                                  <div className="flex items-center gap-3">
                                    <div className="relative">
                                      <input
                                        type="color"
                                        value={chatBubbleColor}
                                        onChange={(e) => setChatBubbleColor(e.target.value)}
                                        className="w-12 h-12 border-2 border-input rounded-full cursor-pointer overflow-hidden"
                                        style={{
                                          WebkitAppearance: 'none',
                                          MozAppearance: 'none',
                                          appearance: 'none',
                                          backgroundColor: 'transparent',
                                          padding: '2px'
                                        }}
                                      />
                                      <div
                                        className="absolute inset-1 rounded-full pointer-events-none"
                                        style={{ backgroundColor: chatBubbleColor }}
                                      />
                                    </div>
                                    <span className="text-sm text-muted-foreground font-mono">{chatBubbleColor}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Corner Style */}
                            <div className="space-y-4">
                              <h4 className="text-sm font-medium">Chat Bubble Style</h4>
                              <div className="flex gap-4 max-w-md">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className={`flex-1 h-16 flex-col gap-2 transition-all duration-200 ${bubbleStyle === "sharp"
                                        ? "border-2 border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-50 focus:bg-blue-50 focus-visible:bg-blue-50"
                                        : "hover:bg-muted/50 focus:bg-muted/50 focus-visible:bg-muted/50"
                                        }`}
                                      onClick={() => setBubbleStyle("sharp")}
                                    >
                                      <div className={`w-6 h-4 transition-colors ${bubbleStyle === "sharp" ? "bg-blue-500" : "bg-gray-400"
                                        } rounded-none`}></div>
                                      <span className="text-xs">Sharp</span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Sharp Corners</p>
                                  </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className={`flex-1 h-16 flex-col gap-2 transition-all duration-200 ${bubbleStyle === "rounded"
                                        ? "border-2 border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-50 focus:bg-blue-50 focus-visible:bg-blue-50"
                                        : "hover:bg-muted/50 focus:bg-muted/50 focus-visible:bg-muted/50"
                                        }`}
                                      onClick={() => setBubbleStyle("rounded")}
                                    >
                                      <div className={`w-6 h-4 transition-colors ${bubbleStyle === "rounded" ? "bg-blue-500" : "bg-gray-400"
                                        } rounded-lg`}></div>
                                      <span className="text-xs">Rounded</span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Rounded Corners</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </div>

                            {/* Widget Position */}
                            <div className="space-y-4">
                              <h4 className="text-sm font-medium">Widget Position</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Trigger Button Position</Label>
                                  <Select value={triggerPosition} onValueChange={setTriggerPosition}>
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select trigger position" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                                      <SelectItem value="bottom-center">Bottom Center</SelectItem>
                                      <SelectItem value="top-right">Top Right</SelectItem>
                                      <SelectItem value="top-left">Top Left</SelectItem>
                                      <SelectItem value="top-center">Top Center</SelectItem>
                                      <SelectItem value="center-right">Center Right</SelectItem>
                                      <SelectItem value="center-left">Center Left</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Chat Window Direction</Label>
                                  <Select value={chatDirection} onValueChange={setChatDirection}>
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select chat direction" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="right">Open from Right</SelectItem>
                                      <SelectItem value="left">Open from Left</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              
                              {/* Position Preview */}
                              <div className="p-4 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  <span className="text-sm font-medium">Preview</span>
                                </div>
                                <div className="relative bg-white dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg h-32 overflow-hidden">
                                  <div className="absolute inset-2 text-center text-xs text-muted-foreground flex items-center justify-center">
                                    Your Website
                                  </div>
                                  
                                  {/* Trigger Button Preview */}
                                  <div 
                                    className={`absolute w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center ${
                                      triggerPosition === "bottom-right" ? "bottom-2 right-2" :
                                      triggerPosition === "bottom-left" ? "bottom-2 left-2" :
                                      triggerPosition === "bottom-center" ? "bottom-2 left-1/2 transform -translate-x-1/2" :
                                      triggerPosition === "top-right" ? "top-2 right-2" :
                                      triggerPosition === "top-left" ? "top-2 left-2" :
                                      triggerPosition === "top-center" ? "top-2 left-1/2 transform -translate-x-1/2" :
                                      triggerPosition === "center-right" ? "top-1/2 right-2 transform -translate-y-1/2" :
                                      triggerPosition === "center-left" ? "top-1/2 left-2 transform -translate-y-1/2" :
                                      "bottom-2 right-2"
                                    }`}
                                  >
                                    <div className="w-3 h-3 bg-white rounded-full"></div>
                                  </div>

                                  {/* Chat Window Preview */}
                                  <div 
                                    className={`absolute w-16 h-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg ${
                                      chatDirection === "right" ? "bottom-10 right-2" : "bottom-10 left-2"
                                    } opacity-50`}
                                  >
                                    <div className="p-1">
                                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded mb-1"></div>
                                      <div className="w-3/4 h-1 bg-gray-200 dark:bg-gray-600 rounded mb-1"></div>
                                      <div className="w-1/2 h-1 bg-gray-200 dark:bg-gray-600 rounded"></div>
                                    </div>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                  Trigger: {triggerPosition.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} • 
                                  Chat: Opens from {chatDirection}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Save Button */}
                      <div className="flex justify-end">
                        <Button className="px-8" onClick={() => {
                          toast.success("Settings saved successfully!", {
                            description: "Your widget settings have been updated.",
                          })
                        }}>
                          <IconSettings className="h-4 w-4 mr-2" />
                          Save Settings
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="integration" className="space-y-6">
                      {/* Step-by-step Integration Guide */}
                      <div className="space-y-6">
                        <div className="text-center mb-8">
                          <h3 className="text-2xl font-bold mb-2">Widget Integration Guide</h3>
                          <p className="text-muted-foreground">Follow these simple steps to add Chatelly to your website</p>
                        </div>

                        {/* Step 1 */}
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                                1
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold mb-2">Copy the Integration Code</h4>
                                <p className="text-sm text-muted-foreground mb-4">
                                  Copy the JavaScript code below and paste it into your website's HTML.
                                </p>
                                <div className="bg-muted p-4 rounded-lg relative">
                                  <code className="text-sm block whitespace-pre">
                                    {`<script src="https://chatelly.com/widget.js"></script>
<script>
  Chatelly.init({
    widgetId: "${site.widgetId}",
    domain: "${site.domain}"
  });
</script>`}
                                  </code>
                                  <Button
                                    size="sm"
                                    className="absolute top-2 right-2"
                                    onClick={() => {
                                      const code = `<script src="https://chatelly.com/widget.js"></script>\n<script>\n  Chatelly.init({\n    widgetId: "${site.widgetId}",\n    domain: "${site.domain}"\n  });\n</script>`
                                      navigator.clipboard.writeText(code)
                                      toast.success("Integration code copied!", {
                                        description: "Paste this code into your website's HTML",
                                        duration: 3000,
                                      })
                                    }}
                                  >
                                    <IconCopy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Step 2 */}
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                                2
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold mb-2">Add to Your Website</h4>
                                <p className="text-sm text-muted-foreground mb-4">
                                  Paste the code just before the closing &lt;/body&gt; tag in your HTML.
                                </p>
                                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                                  <div className="flex items-center gap-2 mb-2">
                                    <IconCode className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-800">HTML Structure</span>
                                  </div>
                                  <code className="text-sm text-green-700 block">
                                    {`<html>
  <head>...</head>
  <body>
    <!-- Your website content -->
    
    <!-- Chatelly Widget Code Here -->
    <script src="https://chatelly.com/widget.js"></script>
    <script>...</script>
  </body>
</html>`}
                                  </code>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Step 3 */}
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                                3
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold mb-2">Test Your Integration</h4>
                                <p className="text-sm text-muted-foreground mb-4">
                                  Visit your website to see the chat widget in action.
                                </p>
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                                  <div className="flex items-center gap-2 mb-2">
                                    <IconEye className="h-4 w-4 text-purple-600" />
                                    <span className="text-sm font-medium text-purple-800">What to Expect</span>
                                  </div>
                                  <ul className="text-sm text-purple-700 space-y-1">
                                    <li>• Chat widget appears in the bottom-right corner</li>
                                    <li>• Click the chat button to open the widget</li>
                                    <li>• Test sending a message to verify functionality</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Visual Preview */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Widget Preview</CardTitle>
                            <CardDescription>How the widget will appear on your website</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-lg border-2 border-dashed border-gray-300 relative min-h-64">
                              <div className="text-center text-gray-500 mb-4">
                                <IconGlobe className="h-12 w-12 mx-auto mb-2" />
                                <p className="text-sm">Your Website Content</p>
                              </div>

                              {/* Mock Chat Widget */}
                              <div className="absolute bottom-4 right-4">
                                <div className="bg-blue-600 text-white p-3 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-colors">
                                  <IconMessageCircle className="h-6 w-6" />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}