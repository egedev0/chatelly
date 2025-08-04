'use client'

import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SitesDataTable } from "@/components/sites-data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import { useState } from 'react'
import { Button } from "@/components/ui/button"
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

import data from "./data.json"

// Sites data for dashboard
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

export default function Page() {
  const router = useRouter()
  const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState(false)
  const [newSiteName, setNewSiteName] = useState('')
  const [newSiteDomain, setNewSiteDomain] = useState('')

  const handleAddSite = () => {
    setIsAddSiteModalOpen(true)
  }

  const handleSaveSite = () => {
    // Handle save site logic here
    console.log('Save site:', { name: newSiteName, domain: newSiteDomain })
    setIsAddSiteModalOpen(false)
    setNewSiteName('')
    setNewSiteDomain('')
  }
  return (
    <>
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
                <SectionCards />
                <div className="px-4 lg:px-6">
                  <ChartAreaInteractive />
                </div>
                <div>
                  <SitesDataTable data={sitesData} onAddSite={handleAddSite} />
                </div>
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
    </>
  )
}
