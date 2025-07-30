"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface Tab {
  id: string
  label: string
  content: React.ReactNode
}

interface AnimatedTabsProps {
  tabs: Tab[]
  defaultTab?: string
  className?: string
  tabClassName?: string
  contentClassName?: string
}

export function AnimatedTabs({
  tabs,
  defaultTab,
  className,
  tabClassName,
  contentClassName,
}: AnimatedTabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultTab || tabs[0]?.id)

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content

  return (
    <div className={cn("w-full", className)}>
      {/* Tab Headers */}
      <div className="flex space-x-1 rounded-xl bg-muted p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition focus-visible:outline-2",
              tabClassName
            )}
            style={{
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {activeTab === tab.id && (
              <motion.span
                layoutId="bubble"
                className="absolute inset-0 z-10 bg-background shadow-sm"
                style={{ borderRadius: 6 }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-20">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={cn("mt-4", contentClassName)}>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTabContent}
        </motion.div>
      </div>
    </div>
  )
}

export type { Tab, AnimatedTabsProps }