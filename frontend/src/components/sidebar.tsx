"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  IconDashboard,
  IconGlobe,
  IconMessageCircle,
  IconUsers,
  IconChartBar,
  IconLanguage,
} from "@tabler/icons-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: IconDashboard,
  },
  {
    name: "Sites",
    href: "/sites",
    icon: IconGlobe,
  },
  {
    name: "Conversations",
    href: "/conversations",
    icon: IconMessageCircle,
  },
  {
    name: "Team",
    href: "/team",
    icon: IconUsers,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: IconChartBar,
  },
  {
    name: "AI Translation",
    href: "/ai-translation",
    icon: IconLanguage,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Chatelly</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}