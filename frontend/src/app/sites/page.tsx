'use client'

import { useState } from 'react'
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { SitesDataTable } from "@/components/sites-data-table"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
    Plus,
    Globe,
    MessageSquare,
    BarChart3,
    Settings,
    ExternalLink,
    Users,
    Clock,
    TrendingUp,
    Eye,
    Trash2,
} from 'lucide-react'
import Link from 'next/link'

// Sites data for SitesDataTable
const sitesData = [
    {
        id: 1,
        name: "Chatelly Store",
        domain: "chatelly.com",
        status: "active",
        users: "50/100",
    },
    {
        id: 2,
        name: "Demo Site",
        domain: "demo.com",
        status: "active",
        users: "75/150",
    },
    {
        id: 3,
        name: "Test Portal",
        domain: "test.com",
        status: "inactive",
        users: "25/50",
    }
]

export default function SitesPage() {
    const [sites] = useState(sitesData)
    const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState(false)
    const [newSiteName, setNewSiteName] = useState('')
    const [newSiteDomain, setNewSiteDomain] = useState('')
    const [newSiteMaxUsers, setNewSiteMaxUsers] = useState('100')

    const handleAddSite = () => {
        setIsAddSiteModalOpen(true)
    }

    const handleSaveSite = () => {
        // Handle save site logic here
        console.log('Save site:', { name: newSiteName, domain: newSiteDomain, maxUsers: newSiteMaxUsers })
        setIsAddSiteModalOpen(false)
        setNewSiteName('')
        setNewSiteDomain('')
        setNewSiteMaxUsers('100')
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
                            <div className="flex flex-col gap-6 py-6">
                                {/* Stats Overview */}
                                <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                                    <Card className="@container/card">
                                        <CardHeader>
                                            <CardDescription>Total Sites</CardDescription>
                                            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                                {sites.length}
                                            </CardTitle>
                                        </CardHeader>
                                        <div className="flex-col items-start gap-1.5 text-sm px-6">
                                            <div className="line-clamp-1 flex gap-2 font-medium">
                                                <Globe className="size-4" />
                                                Sites managed
                                            </div>
                                            <div className="text-muted-foreground">
                                                Active websites with chat widgets
                                            </div>
                                        </div>
                                    </Card>

                                    <Card className="@container/card">
                                        <CardHeader>
                                            <CardDescription>Total Visitors</CardDescription>
                                            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                                2,296
                                            </CardTitle>
                                        </CardHeader>
                                        <div className="flex-col items-start gap-1.5 text-sm px-6">
                                            <div className="line-clamp-1 flex gap-2 font-medium">
                                                <Users className="size-4" />
                                                Visitors this month
                                            </div>
                                            <div className="text-muted-foreground">
                                                Growing visitor engagement
                                            </div>
                                        </div>
                                    </Card>

                                    <Card className="@container/card">
                                        <CardHeader>
                                            <CardDescription>Total Chats</CardDescription>
                                            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                                135
                                            </CardTitle>
                                        </CardHeader>
                                        <div className="flex-col items-start gap-1.5 text-sm px-6">
                                            <div className="line-clamp-1 flex gap-2 font-medium">
                                                <MessageSquare className="size-4" />
                                                Chats this week
                                            </div>
                                            <div className="text-muted-foreground">
                                                Increased chat activity
                                            </div>
                                        </div>
                                    </Card>

                                    <Card className="@container/card">
                                        <CardHeader>
                                            <CardDescription>Avg. Conversion</CardDescription>
                                            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                                12.2%
                                            </CardTitle>
                                        </CardHeader>
                                        <div className="flex-col items-start gap-1.5 text-sm px-6">
                                            <div className="line-clamp-1 flex gap-2 font-medium">
                                                <TrendingUp className="size-4" />
                                                Conversion rate
                                            </div>
                                            <div className="text-muted-foreground">
                                                Improved conversion performance
                                            </div>
                                        </div>
                                    </Card>
                                </div>

                                {/* Sites DataTable */}
                                <div>
                                    <SitesDataTable data={sites} onAddSite={handleAddSite} />
                                </div>

                                {/* Empty State (if no sites) */}
                                {sites.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-12 px-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                            <Globe className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No sites yet</h3>
                                        <p className="text-gray-600 text-center mb-6 max-w-md">
                                            Get started by adding your first website and start engaging with your visitors.
                                        </p>
                                        <Button asChild>
                                            <Link href="/sites/new">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Your First Site
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>

            {/* Add Site Modal */}
            <Dialog open={isAddSiteModalOpen} onOpenChange={setIsAddSiteModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add New Site</DialogTitle>
                        <DialogDescription>
                            Add a new website to start using chat widgets.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="site-name" className="text-right">
                                Site Name
                            </Label>
                            <Input
                                id="site-name"
                                value={newSiteName}
                                onChange={(e) => setNewSiteName(e.target.value)}
                                className="col-span-3"
                                placeholder="My Website"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="site-domain" className="text-right">
                                Domain
                            </Label>
                            <Input
                                id="site-domain"
                                value={newSiteDomain}
                                onChange={(e) => setNewSiteDomain(e.target.value)}
                                className="col-span-3"
                                placeholder="example.com"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="max-users" className="text-right">
                                Max Users
                            </Label>
                            <Select value={newSiteMaxUsers} onValueChange={setNewSiteMaxUsers}>
                                <SelectTrigger className="col-span-3" id="max-users">
                                    <SelectValue placeholder="Select max users" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="50">50 Users</SelectItem>
                                    <SelectItem value="100">100 Users</SelectItem>
                                    <SelectItem value="250">250 Users</SelectItem>
                                    <SelectItem value="500">500 Users</SelectItem>
                                    <SelectItem value="1000">1000 Users</SelectItem>
                                    <SelectItem value="unlimited">Unlimited</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddSiteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveSite}>
                            Add Site
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </TooltipProvider>
    )
}