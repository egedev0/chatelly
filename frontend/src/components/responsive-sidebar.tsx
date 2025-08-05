'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useMobile } from '@/hooks/use-mobile'
import { Menu, X } from 'lucide-react'
import { AppSidebar } from './app-sidebar'

interface ResponsiveSidebarProps {
  children: React.ReactNode
}

export const ResponsiveSidebar = ({ children }: ResponsiveSidebarProps) => {
  const { isMobile, isTablet } = useMobile()
  const [isOpen, setIsOpen] = useState(false)

  // Close sidebar when screen size changes
  useEffect(() => {
    if (!isMobile && !isTablet) {
      setIsOpen(false)
    }
  }, [isMobile, isTablet])

  if (isMobile || isTablet) {
    return (
      <div className="flex h-screen">
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Chatelly</h1>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-lg font-semibold">Menu</h2>
                  <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <AppSidebar variant="mobile" />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="flex-1 pt-16">
          {children}
        </div>
      </div>
    )
  }

  // Desktop layout
  return (
    <div className="flex h-screen">
      <AppSidebar variant="inset" />
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  )
} 