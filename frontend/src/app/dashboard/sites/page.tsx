"use client"

import { DataTable, sampleSiteData } from "@/components/data-table"
import AuthGuard from "@/components/auth-guard"

function SitesPageContent() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sites</h2>
          <p className="text-muted-foreground">
            Manage your sites and their configurations.
          </p>
        </div>
      </div>
      <DataTable data={sampleSiteData} />
    </div>
  )
}

export default function SitesPage() {
  return (
    <AuthGuard>
      <SitesPageContent />
    </AuthGuard>
  );
}