'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  IconGlobe,
  IconMapPin,
  IconUsers,
  IconRefresh,
  IconZoomIn,
  IconZoomOut,
  IconMaximize,
  IconMinimize,
  IconRotate
} from "@tabler/icons-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Dynamic import for Globe component to avoid SSR issues
const Globe = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-lg flex items-center justify-center">
      <div className="text-white text-center">
        <IconGlobe className="h-12 w-12 mx-auto mb-2 animate-spin" />
        <p className="text-sm">Loading 3D Globe...</p>
      </div>
    </div>
  )
})

// Mock location data with enhanced properties
const locationData = [
  {
    id: 1,
    country: "United States",
    city: "New York",
    users: 45,
    percentage: 35,
    lat: 40.7128,
    lng: -74.0060,
    flag: "🇺🇸",
    timezone: "EST",
    lastActive: "2 min ago",
    color: '#ff6b6b',
    size: 0.8
  },
  {
    id: 2,
    country: "Turkey",
    city: "Istanbul",
    users: 32,
    percentage: 25,
    lat: 41.0082,
    lng: 28.9784,
    flag: "🇹🇷",
    timezone: "TRT",
    lastActive: "5 min ago",
    color: '#4ecdc4',
    size: 0.6
  },
  {
    id: 3,
    country: "United Kingdom",
    city: "London",
    users: 19,
    percentage: 15,
    lat: 51.5074,
    lng: -0.1278,
    flag: "🇬🇧",
    timezone: "GMT",
    lastActive: "1 min ago",
    color: '#45b7d1',
    size: 0.4
  },
  {
    id: 4,
    country: "Germany",
    city: "Berlin",
    users: 13,
    percentage: 10,
    lat: 52.5200,
    lng: 13.4050,
    flag: "🇩🇪",
    timezone: "CET",
    lastActive: "3 min ago",
    color: '#f9ca24',
    size: 0.3
  },
  {
    id: 5,
    country: "France",
    city: "Paris",
    users: 8,
    percentage: 6,
    lat: 48.8566,
    lng: 2.3522,
    flag: "🇫🇷",
    timezone: "CET",
    lastActive: "7 min ago",
    color: '#6c5ce7',
    size: 0.2
  },
  {
    id: 6,
    country: "Japan",
    city: "Tokyo",
    users: 5,
    percentage: 4,
    lat: 35.6762,
    lng: 139.6503,
    flag: "🇯🇵",
    timezone: "JST",
    lastActive: "12 min ago",
    color: '#fd79a8',
    size: 0.15
  }
]

// Connection arcs between locations
const connectionArcs = [
  { startLat: 40.7128, startLng: -74.0060, endLat: 51.5074, endLng: -0.1278, color: '#ff6b6b' },
  { startLat: 51.5074, startLng: -0.1278, endLat: 52.5200, endLng: 13.4050, color: '#4ecdc4' },
  { startLat: 52.5200, startLng: 13.4050, endLat: 41.0082, endLng: 28.9784, color: '#45b7d1' },
  { startLat: 41.0082, startLng: 28.9784, endLat: 35.6762, endLng: 139.6503, color: '#f9ca24' },
  { startLat: 48.8566, startLng: 2.3522, endLat: 40.7128, endLng: -74.0060, color: '#6c5ce7' }
]

interface InteractiveWorldMapProps {
  className?: string
}

export function InteractiveWorldMap({ className }: InteractiveWorldMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<typeof locationData[0] | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [globeReady, setGlobeReady] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [popupLocation, setPopupLocation] = useState<typeof locationData[0] | null>(null)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })
  const globeEl = useRef<any>()
  const mapContainerRef = useRef<HTMLDivElement>(null)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 2000)
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  // Initialize globe settings
  useEffect(() => {
    if (globeEl.current && globeReady) {
      // Center the globe perfectly - lat: 0 for equator, lng: 0 for prime meridian
      globeEl.current.pointOfView({ lat: 0, lng: 0, altitude: 2.5 }, 0)

      // Auto-rotate settings
      globeEl.current.controls().autoRotate = true
      globeEl.current.controls().autoRotateSpeed = 0.3
      globeEl.current.controls().enableZoom = true
      globeEl.current.controls().enablePan = true
    }
  }, [globeReady])

  const handleLocationClick = useCallback((location: typeof locationData[0], event?: MouseEvent) => {
    setSelectedLocation(location)

    // Stop globe rotation when popup is shown
    if (globeEl.current) {
      const controls = globeEl.current.controls()
      controls.autoRotate = false

      // Point camera to location
      globeEl.current.pointOfView({ lat: location.lat, lng: location.lng, altitude: 2 }, 1000)
    }

    // Show popup at marker position
    if (event && mapContainerRef.current) {
      const rect = mapContainerRef.current.getBoundingClientRect()
      setPopupPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top - 10 // Offset slightly above the marker
      })
      setPopupLocation(location)
    }
  }, [])

  const closePopup = () => {
    setPopupLocation(null)
    // Restart globe rotation when popup is closed
    if (globeEl.current) {
      const controls = globeEl.current.controls()
      controls.autoRotate = true
    }
  }

  const handleRefresh = () => {
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 2000)
  }

  const handleZoomIn = () => {
    if (globeEl.current) {
      const pov = globeEl.current.pointOfView()
      globeEl.current.pointOfView({ ...pov, altitude: Math.max(pov.altitude - 0.5, 1) }, 500)
    }
  }

  const handleZoomOut = () => {
    if (globeEl.current) {
      const pov = globeEl.current.pointOfView()
      globeEl.current.pointOfView({ ...pov, altitude: Math.min(pov.altitude + 0.5, 4) }, 500)
    }
  }

  const handleRotateToggle = () => {
    if (globeEl.current) {
      const controls = globeEl.current.controls()
      controls.autoRotate = !controls.autoRotate
    }
  }

  const handleFullscreenToggle = () => {
    if (!isFullscreen) {
      // Enter fullscreen
      if (mapContainerRef.current?.requestFullscreen) {
        mapContainerRef.current.requestFullscreen()
      }
      setIsFullscreen(true)
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
      setIsFullscreen(false)
    }
  }

  const handleReset = () => {
    if (globeEl.current) {
      globeEl.current.pointOfView({ lat: 0, lng: 0, altitude: 2.5 }, 1000)
      setSelectedLocation(null)
    }
  }

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupLocation && mapContainerRef.current && !mapContainerRef.current.contains(event.target as Node)) {
        setPopupLocation(null)
      }
    }

    if (popupLocation) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [popupLocation])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Map Container */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconGlobe className="h-5 w-5 text-blue-600" />
            Interactive 3D World Map
          </CardTitle>
          <CardDescription>Real-time user locations with 3D visualization</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            ref={mapContainerRef}
            className={`relative rounded-lg overflow-hidden ${isFullscreen
              ? 'fixed inset-0 z-50 rounded-none bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900'
              : 'h-96 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900'
              }`}
          >
            <Globe
              ref={globeEl}
              // Cartoon-style Earth textures
              globeImageUrl="//unpkg.com/three-globe/example/img/earth-day.jpg"
              bumpImageUrl={null}
              backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"

              // HTML markers for perfect circular appearance
              htmlElementsData={locationData}
              htmlElement={(d: any) => {
                const el = document.createElement('div')
                const size = Math.max(d.size * 40, 25)
                el.innerHTML = `
                  <div style="
                    position: relative;
                    width: ${size}px;
                    height: ${size + 8}px;
                    cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    animation: bounce 2s ease-in-out infinite;
                    transform-style: preserve-3d;
                  " 
                  onmouseover="
                    this.style.transform='scale(1.3) translateZ(15px)'; 
                    this.style.zIndex='1000';
                  "
                  onmouseout="
                    this.style.transform='scale(1) translateZ(0px)'; 
                    this.style.zIndex='auto';
                  "
                  title="${d.flag} ${d.city}, ${d.country} - ${d.users} users"
                  >
                    <!-- Pin Base -->
                    <div style="
                      position: absolute;
                      bottom: 0;
                      left: 50%;
                      transform: translateX(-50%);
                      width: 4px;
                      height: 12px;
                      background: linear-gradient(180deg, ${d.color}, ${d.color}aa);
                      border-radius: 2px;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    "></div>
                    
                    <!-- Main Marker Circle -->
                    <div style="
                      position: absolute;
                      top: 0;
                      left: 50%;
                      transform: translateX(-50%);
                      width: ${size}px;
                      height: ${size}px;
                      background: linear-gradient(135deg, ${d.color}ff 0%, ${d.color}dd 50%, ${d.color}bb 100%);
                      border: 5px solid white;
                      border-radius: 50%;
                      box-shadow: 
                        0 8px 25px rgba(0,0,0,0.3),
                        0 0 0 3px ${d.color}66,
                        inset 0 3px 6px rgba(255,255,255,0.4),
                        inset 0 -2px 4px rgba(0,0,0,0.2);
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                      justify-content: center;
                      overflow: hidden;
                    ">
                      <!-- Flag -->
                      <div style="
                        font-size: ${Math.max(size * 0.25, 8)}px; 
                        margin-bottom: 2px;
                        filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
                      ">${d.flag}</div>
                      
                      <!-- User Count -->
                      <div style="
                        font-size: ${Math.max(size * 0.3, 10)}px; 
                        font-weight: 900;
                        color: white;
                        text-shadow: 0 2px 4px rgba(0,0,0,0.8);
                        line-height: 1;
                      ">${d.users}</div>
                      
                      <!-- City Name -->
                      <div style="
                        font-size: ${Math.max(size * 0.15, 6)}px; 
                        font-weight: 600;
                        color: rgba(255,255,255,0.9);
                        text-shadow: 0 1px 2px rgba(0,0,0,0.6);
                        margin-top: 1px;
                        text-align: center;
                        line-height: 1;
                      ">${d.city}</div>
                      
                      <!-- Shine Effect -->
                      <div style="
                        position: absolute;
                        top: -3px;
                        left: -3px;
                        right: -3px;
                        bottom: -3px;
                        background: conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.3) 60deg, transparent 120deg);
                        border-radius: 50%;
                        pointer-events: none;
                        animation: rotate 3s linear infinite;
                      "></div>
                      
                      <!-- Inner Glow -->
                      <div style="
                        position: absolute;
                        top: 15%;
                        left: 20%;
                        width: 30%;
                        height: 30%;
                        background: radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%);
                        border-radius: 50%;
                        pointer-events: none;
                      "></div>
                    </div>
                    
                    <!-- Pulse Ring -->
                    <div style="
                      position: absolute;
                      top: 50%;
                      left: 50%;
                      transform: translate(-50%, -50%);
                      width: ${size + 10}px;
                      height: ${size + 10}px;
                      border: 2px solid ${d.color}88;
                      border-radius: 50%;
                      animation: pulse 2s ease-out infinite;
                      pointer-events: none;
                    "></div>
                  </div>
                  
                  <style>
                    @keyframes bounce {
                      0%, 100% { 
                        transform: translateY(0px) scale(1);
                      }
                      50% { 
                        transform: translateY(-2px) scale(1.02);
                      }
                    }
                    @keyframes rotate {
                      from { transform: rotate(0deg); }
                      to { transform: rotate(360deg); }
                    }
                    @keyframes pulse {
                      0% { 
                        transform: translate(-50%, -50%) scale(1);
                        opacity: 1;
                      }
                      100% { 
                        transform: translate(-50%, -50%) scale(1.5);
                        opacity: 0;
                      }
                    }
                  </style>
                `
                el.style.pointerEvents = 'auto'
                el.onclick = (event) => handleLocationClick(d, event)
                return el
              }}
              htmlAltitude={0.01}


              // Enhanced cartoon-style arcs
              arcsData={connectionArcs}
              arcColor={(d: any) => d.color}
              arcDashLength={0.8}
              arcDashGap={0.4}
              arcDashInitialGap={() => Math.random() * 2}
              arcDashAnimateTime={3000}
              arcStroke={2.5}
              arcAltitude={0.4}
              arcAltitudeAutoScale={0.3}

              // Enhanced rings for cartoon effect
              ringsData={locationData}
              ringColor={(d: any) => d.color}
              ringMaxRadius={(d: any) => Math.max(d.size * 6, 2)}
              ringPropagationSpeed={2}
              ringRepeatPeriod={2500}
              ringAltitude={0.008}

              // Cartoon-style atmosphere
              atmosphereColor="rgba(59, 130, 246, 0.5)"
              atmosphereAltitude={0.25}

              // Animation
              animateIn={true}
              onGlobeReady={() => setGlobeReady(true)}

              // Controls
              enablePointerInteraction={true}

              // Dynamic sizing
              width={undefined}
              height={isFullscreen ? window.innerHeight : 384}
            />

            {/* Live Activity Indicator */}
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs border border-white/20 shadow-lg">
              <div className="relative w-4 h-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75"></div>
                </div>
              </div>
              <span className="font-medium">Live Activity</span>
            </div>

            {/* Stats Overlay */}
            <div className="absolute bottom-4 left-4 bg-gradient-to-r from-black/80 to-gray-900/80 backdrop-blur-md text-white px-4 py-3 rounded-xl text-xs border border-white/10 shadow-xl">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-green-400 font-bold text-lg">{locationData.reduce((sum, loc) => sum + loc.users, 0)}</div>
                  <div className="text-gray-300 text-xs">Total Users</div>
                </div>
                <div className="text-center border-x border-white/20 px-2">
                  <div className="text-blue-400 font-bold text-lg">{locationData.length}</div>
                  <div className="text-gray-300 text-xs">Locations</div>
                </div>
                <div className="text-center">
                  <div className="text-yellow-400 font-bold text-lg">{connectionArcs.length}</div>
                  <div className="text-gray-300 text-xs">Connections</div>
                </div>
              </div>
            </div>

            {/* Map Controls */}
            <div className="absolute bottom-4 right-4 bg-gradient-to-r from-black/80 to-gray-900/80 backdrop-blur-md text-white rounded-xl border border-white/10 shadow-xl">
              <div className="flex items-center gap-1 p-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleRefresh}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      title="Refresh Data"
                    >
                      <IconRefresh className={`h-4 w-4 ${isAnimating ? 'animate-spin' : ''}`} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Refresh Data</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleRotateToggle}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      title="Toggle Auto Rotate"
                    >
                      <IconRotate className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Toggle Auto Rotate</TooltipContent>
                </Tooltip>
                <div className="w-px h-6 bg-white/20 mx-1"></div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleZoomOut}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      title="Zoom Out"
                    >
                      <IconZoomOut className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Zoom Out</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleZoomIn}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      title="Zoom In"
                    >
                      <IconZoomIn className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Zoom In</TooltipContent>
                </Tooltip>
                <div className="w-px h-6 bg-white/20 mx-1"></div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleFullscreenToggle}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    >
                      {isFullscreen ? <IconMinimize className="h-4 w-4" /> : <IconMaximize className="h-4 w-4" />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Location Popup Card */}
            {popupLocation && (
              <div
                className="absolute z-50 pointer-events-none"
                style={{
                  left: popupPosition.x,
                  top: popupPosition.y,
                  transform: 'translate(-50%, -100%)'
                }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 min-w-64 pointer-events-auto animate-in fade-in-0 zoom-in-95 duration-200">
                  {/* Close button */}
                  <button
                    onClick={() => setPopupLocation(null)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    ×
                  </button>

                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: popupLocation.color }}
                    ></div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="text-lg">{popupLocation.flag}</span>
                        {popupLocation.city}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{popupLocation.country}</p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{popupLocation.users}</div>
                      <div className="text-xs text-blue-600/70 dark:text-blue-400/70">Active Users</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-green-600 dark:text-green-400">{popupLocation.percentage}%</div>
                      <div className="text-xs text-green-600/70 dark:text-green-400/70">Traffic Share</div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Timezone:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{popupLocation.timezone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Last Active:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{popupLocation.lastActive}</span>
                    </div>
                  </div>

                  {/* Activity Indicator */}
                  <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Live Activity</span>
                  </div>

                  {/* Arrow pointing to marker */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                    <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white dark:border-t-gray-800"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Floating particles effect */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${2 + Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Details */}
      {selectedLocation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconMapPin className="h-5 w-5 text-blue-600" />
              {selectedLocation.flag} {selectedLocation.city}, {selectedLocation.country}
            </CardTitle>
            <CardDescription>Location details and user activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{selectedLocation.users}</div>
                <div className="text-xs text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{selectedLocation.percentage}%</div>
                <div className="text-xs text-muted-foreground">Traffic Share</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium">{selectedLocation.timezone}</div>
                <div className="text-xs text-muted-foreground">Timezone</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium">{selectedLocation.lastActive}</div>
                <div className="text-xs text-muted-foreground">Last Active</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconUsers className="h-5 w-5 text-blue-600" />
            Active Locations
          </CardTitle>
          <CardDescription>Click on any location to focus on the globe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {locationData.map((location) => (
              <div
                key={location.id}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:bg-accent ${selectedLocation?.id === location.id
                  ? 'border-primary bg-accent'
                  : 'border-border hover:border-primary/50'
                  }`}
                onClick={() => handleLocationClick(location)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-background shadow-sm"
                    style={{ backgroundColor: location.color }}
                  ></div>
                  <div className="text-2xl">{location.flag}</div>
                  <div>
                    <div className="font-medium text-sm">{location.city}, {location.country}</div>
                    <div className="text-xs text-muted-foreground">
                      Last active: {location.lastActive} • {location.timezone}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-bold text-primary">{location.users}</div>
                    <div className="text-xs text-muted-foreground">users</div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {location.percentage}%
                  </Badge>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}