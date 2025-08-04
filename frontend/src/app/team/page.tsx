"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IconUsers, IconUserPlus, IconShield, IconMail } from "@tabler/icons-react"

export default function TeamPage() {
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
              <div className="px-4 lg:px-6">
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
                    <p className="text-muted-foreground">
                      Manage team members and their access to your chat widgets.
                    </p>
                  </div>
                  <Button disabled>
                    <IconUserPlus className="h-4 w-4 mr-2" />
                    Invite Member
                  </Button>
                </div>

                {/* Team Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                      <IconUsers className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">5</div>
                      <p className="text-xs text-muted-foreground">
                        2 admins, 3 agents
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                      <IconShield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">3</div>
                      <p className="text-xs text-muted-foreground">
                        Currently online
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
                      <IconMail className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">2</div>
                      <p className="text-xs text-muted-foreground">
                        Awaiting response
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Current Team Members */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Current Team Members</CardTitle>
                    <CardDescription>Manage your team members and their roles</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Sample team members */}
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">AD</span>
                          </div>
                          <div>
                            <div className="font-medium">Administrator</div>
                            <div className="text-sm text-muted-foreground">admin@chatelly.com</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge>Admin</Badge>
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            Online
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-green-600">JS</span>
                          </div>
                          <div>
                            <div className="font-medium">John Smith</div>
                            <div className="text-sm text-muted-foreground">john@company.com</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Agent</Badge>
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            Online
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-purple-600">SD</span>
                          </div>
                          <div>
                            <div className="font-medium">Sarah Davis</div>
                            <div className="text-sm text-muted-foreground">sarah@company.com</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Agent</Badge>
                          <Badge variant="outline" className="text-gray-600 border-gray-200">
                            Offline
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Coming Soon Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Team Management</CardTitle>
                    <CardDescription>Full team management features and permissions</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <IconUsers className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      Advanced team management features including role-based permissions, 
                      team analytics, and collaboration tools are currently under development.
                    </p>
                    <Button className="mt-4" disabled>
                      Manage Team
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}