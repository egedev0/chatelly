'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { WidgetSettings } from '@/lib/services/widget-config-service'
import { Monitor, Smartphone, Tablet, X, Maximize2, Minimize2 } from 'lucide-react'

interface WidgetPreviewProps {
  settings: WidgetSettings
  widgetKey: string
  isOpen: boolean
  onClose: () => void
}

type DeviceType = 'desktop' | 'tablet' | 'mobile'

export const WidgetPreview = ({ settings, widgetKey, isOpen, onClose }: WidgetPreviewProps) => {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)

  const deviceConfigs = {
    desktop: { width: '100%', height: '600px', scale: 1 },
    tablet: { width: '768px', height: '600px', scale: 0.8 },
    mobile: { width: '375px', height: '600px', scale: 0.6 }
  }

  const currentConfig = deviceConfigs[deviceType]

  useEffect(() => {
    if (isOpen) {
      setIframeKey(prev => prev + 1)
    }
  }, [isOpen, settings])

  const generatePreviewUrl = () => {
    const params = new URLSearchParams({
      theme: settings.theme,
      primary_color: settings.primary_color,
      position: settings.position,
      welcome_message: settings.welcome_message,
      offline_message: settings.offline_message,
      language: settings.language,
      translation_enabled: settings.translation_enabled.toString(),
      moderation_enabled: settings.moderation_enabled.toString(),
      custom_css: settings.custom_css,
      preview: 'true'
    })

    return `http://localhost:8080/widget/preview/${widgetKey}?${params.toString()}`
  }

  const handleDeviceChange = (device: DeviceType) => {
    setDeviceType(device)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isFullscreen ? 'max-w-none w-screen h-screen' : 'max-w-4xl'}`}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Widget Preview</DialogTitle>
              <p className="text-sm text-muted-foreground">
                See how your widget will appear on different devices
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Device Selector */}
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant={deviceType === 'desktop' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleDeviceChange('desktop')}
            >
              <Monitor className="h-4 w-4 mr-2" />
              Desktop
            </Button>
            <Button
              variant={deviceType === 'tablet' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleDeviceChange('tablet')}
            >
              <Tablet className="h-4 w-4 mr-2" />
              Tablet
            </Button>
            <Button
              variant={deviceType === 'mobile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleDeviceChange('mobile')}
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Mobile
            </Button>
          </div>

          {/* Preview Frame */}
          <div className="flex justify-center">
            <div
              className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white"
              style={{
                width: currentConfig.width,
                height: currentConfig.height,
                transform: `scale(${currentConfig.scale})`,
                transformOrigin: 'top center'
              }}
            >
              <div className="bg-gray-100 px-4 py-2 border-b flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-xs text-gray-600">
                  {deviceType === 'desktop' && 'Desktop Preview'}
                  {deviceType === 'tablet' && 'Tablet Preview'}
                  {deviceType === 'mobile' && 'Mobile Preview'}
                </div>
              </div>
              
              <iframe
                key={iframeKey}
                src={generatePreviewUrl()}
                className="w-full h-full border-0"
                title="Widget Preview"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>

          {/* Settings Summary */}
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Theme:</span>
                  <Badge variant="outline" className="ml-2">{settings.theme}</Badge>
                </div>
                <div>
                  <span className="font-medium">Position:</span>
                  <Badge variant="outline" className="ml-2">{settings.position}</Badge>
                </div>
                <div>
                  <span className="font-medium">Language:</span>
                  <Badge variant="outline" className="ml-2">{settings.language}</Badge>
                </div>
                <div>
                  <span className="font-medium">Translation:</span>
                  <Badge variant={settings.translation_enabled ? 'default' : 'secondary'} className="ml-2">
                    {settings.translation_enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
} 