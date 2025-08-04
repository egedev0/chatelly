'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  IconFlame, 
  IconSnowflake, 
  IconActivity,
  IconEye,
  IconRefresh
} from "@tabler/icons-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Mock heatmap data
const heatmapData = [
  { id: 1, region: "North America", intensity: 85, color: "bg-red-500", users: 67, trend: "hot" },
  { id: 2, region: "Europe", intensity: 72, color: "bg-orange-500", users: 54, trend: "warm" },
  { id: 3, region: "Asia Pacific", intensity: 45, color: "bg-yellow-500", users: 23, trend: "moderate" },
  { id: 4, region: "South America", intensity: 28, color: "bg-green-500", users: 12, trend: "cool" },
  { id: 5, region: "Africa", intensity: 15, color: "bg-blue-500", users: 8, trend: "cold" },
  { id: 6, region: "Middle East", intensity: 38, color: "bg-purple-500", users: 18, trend: "moderate" }
]

interface LocationHeatmapProps {
  className?: string
}

export function LocationHeatmap({ className }: LocationHeatmapProps) {
  const [selectedRegion, setSelectedRegion] = useState<typeof heatmapData[0] | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 2000)
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'hot':
        return <IconFlame className="h-4 w-4 text-red-500" />
      case 'cold':
        return <IconSnowflake className="h-4 w-4 text-blue-500" />
      default:
        return <IconActivity className="h-4 w-4 text-yellow-500" />
    }
  }

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'hot':
        return 'Very Active'
      case 'warm':
        return 'Active'
      case 'moderate':
        return 'Moderate'
      case 'cool':
        return 'Low Activity'
      case 'cold':
        return 'Very Low'
      default:
        return 'Unknown'
    }
  }

  const handleRefresh = () => {
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 2000)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <IconFlame className="h-5 w-5 text-red-500" />
              Activity Heatmap
            </CardTitle>
            <CardDescription>Regional user activity intensity</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  <IconRefresh className={`h-4 w-4 ${isAnimating ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh Heatmap</TooltipContent>
            </Tooltip>
            <Badge variant="outline" className="text-xs">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1"></div>
              Live
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Heatmap Visualization */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {heatmapData.map((region) => (
              <Card
                key={region.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedRegion?.id === region.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedRegion(region)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-sm">{region.region}</h3>
                    {getTrendIcon(region.trend)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-foreground">{region.users}</div>
                    <div className="text-xs text-muted-foreground">Active Users</div>
                    
                    {/* Intensity Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Activity Level</span>
                        <span className="font-medium">{region.intensity}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-1000 ${
                            region.intensity >= 80 ? 'bg-red-500' :
                            region.intensity >= 60 ? 'bg-orange-500' :
                            region.intensity >= 40 ? 'bg-yellow-500' :
                            region.intensity >= 20 ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${region.intensity}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Very Active (80-100%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span>Active (60-79%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Moderate (40-59%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Low (20-39%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Very Low (0-19%)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Region Details */}
      {selectedRegion && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconEye className="h-5 w-5 text-primary" />
              {selectedRegion.region} - Detailed View
            </CardTitle>
            <CardDescription>Regional activity breakdown and insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{selectedRegion.users}</div>
                <div className="text-xs text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{selectedRegion.intensity}%</div>
                <div className="text-xs text-muted-foreground">Activity Level</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  {getTrendIcon(selectedRegion.trend)}
                  <span className="text-sm font-medium">{getTrendLabel(selectedRegion.trend)}</span>
                </div>
                <div className="text-xs text-muted-foreground">Trend Status</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-primary">#{heatmapData.findIndex(r => r.id === selectedRegion.id) + 1}</div>
                <div className="text-xs text-muted-foreground">Global Rank</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}