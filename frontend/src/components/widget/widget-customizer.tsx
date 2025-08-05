'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { widgetConfigService, WidgetSettings, WidgetTheme, WidgetPosition } from '@/lib/services/widget-config-service'
import { useToast } from '@/hooks/use-toast'
import { Copy, Eye, Palette, Settings, Globe, Clock, Shield } from 'lucide-react'

interface WidgetCustomizerProps {
  websiteId: number
  widgetKey: string
  initialSettings?: WidgetSettings
  onSettingsChange?: (settings: WidgetSettings) => void
}

export const WidgetCustomizer = ({ 
  websiteId, 
  widgetKey, 
  initialSettings,
  onSettingsChange 
}: WidgetCustomizerProps) => {
  const [settings, setSettings] = useState<WidgetSettings>(
    initialSettings || widgetConfigService.getDefaultSettings()
  )
  const [themes, setThemes] = useState<WidgetTheme[]>([])
  const [positions, setPositions] = useState<WidgetPosition[]>([])
  const [loading, setLoading] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadWidgetOptions()
  }, [])

  useEffect(() => {
    if (onSettingsChange) {
      onSettingsChange(settings)
    }
  }, [settings, onSettingsChange])

  const loadWidgetOptions = async () => {
    try {
      setLoading(true)
      const [themesData, positionsData] = await Promise.all([
        widgetConfigService.getAvailableThemes(),
        widgetConfigService.getAvailablePositions()
      ])
      setThemes(themesData)
      setPositions(positionsData)
    } catch (error) {
      console.error('Failed to load widget options:', error)
      toast({
        title: "Error",
        description: "Failed to load widget configuration options.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = (key: keyof WidgetSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSaveSettings = async () => {
    try {
      setLoading(true)
      
      // Validate settings
      const validation = await widgetConfigService.validateWidgetSettings(settings)
      if (!validation.valid) {
        toast({
          title: "Validation Error",
          description: validation.errors?.join(', ') || "Invalid widget settings",
          variant: "destructive",
        })
        return
      }

      // Update settings
      await widgetConfigService.updateWidgetSettings(websiteId, settings)
      
      toast({
        title: "Success",
        description: "Widget settings updated successfully!",
      })
    } catch (error) {
      console.error('Failed to save widget settings:', error)
      toast({
        title: "Error",
        description: "Failed to save widget settings.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopyEmbedCode = async () => {
    try {
      const embedCode = widgetConfigService.generateEmbedCode(widgetKey)
      await navigator.clipboard.writeText(embedCode)
      toast({
        title: "Copied!",
        description: "Embed code copied to clipboard.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy embed code.",
        variant: "destructive",
      })
    }
  }

  const handlePreviewWidget = async () => {
    try {
      setLoading(true)
      const preview = await widgetConfigService.previewWidget(settings)
      setPreviewMode(true)
      // In a real implementation, you would show the preview in a modal or iframe
      console.log('Widget preview:', preview)
    } catch (error) {
      console.error('Failed to generate preview:', error)
      toast({
        title: "Error",
        description: "Failed to generate widget preview.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Widget Customizer</h2>
          <p className="text-muted-foreground">
            Customize your chat widget appearance and behavior
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handlePreviewWidget} disabled={loading}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSaveSettings} disabled={loading}>
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="appearance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="appearance" className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span>Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="behavior" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Behavior</span>
          </TabsTrigger>
          <TabsTrigger value="localization" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>Localization</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme & Colors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={settings.theme} onValueChange={(value) => handleSettingChange('theme', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      {themes.map((theme) => (
                        <SelectItem key={theme.id} value={theme.id}>
                          {theme.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      value={settings.primary_color}
                      onChange={(e) => handleSettingChange('primary_color', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={settings.primary_color}
                      onChange={(e) => handleSettingChange('primary_color', e.target.value)}
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="position">Position</Label>
                <Select value={settings.position} onValueChange={(value) => handleSettingChange('position', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((position) => (
                      <SelectItem key={position.id} value={position.id}>
                        {position.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="custom_css">Custom CSS</Label>
                <Textarea
                  value={settings.custom_css}
                  onChange={(e) => handleSettingChange('custom_css', e.target.value)}
                  placeholder="Add custom CSS styles..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Messages & Behavior</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="welcome_message">Welcome Message</Label>
                <Textarea
                  value={settings.welcome_message}
                  onChange={(e) => handleSettingChange('welcome_message', e.target.value)}
                  placeholder="Hello! How can we help you today?"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="offline_message">Offline Message</Label>
                <Textarea
                  value={settings.offline_message}
                  onChange={(e) => handleSettingChange('offline_message', e.target.value)}
                  placeholder="We're currently offline. Please leave a message..."
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="moderation_enabled">Content Moderation</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically filter inappropriate content
                  </p>
                </div>
                <Switch
                  checked={settings.moderation_enabled}
                  onCheckedChange={(checked) => handleSettingChange('moderation_enabled', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="localization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Language & Translation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="language">Default Language</Label>
                <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="it">Italian</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                    <SelectItem value="ru">Russian</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                    <SelectItem value="ko">Korean</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="translation_enabled">Auto Translation</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically translate messages to visitor's language
                  </p>
                </div>
                <Switch
                  checked={settings.translation_enabled}
                  onCheckedChange={(checked) => handleSettingChange('translation_enabled', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security & Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="allowed_domains">Allowed Domains</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Add domains where the widget is allowed to run (one per line)
                </p>
                <Textarea
                  value={settings.allowed_domains.join('\n')}
                  onChange={(e) => handleSettingChange('allowed_domains', e.target.value.split('\n').filter(d => d.trim()))}
                  placeholder="example.com&#10;www.example.com"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Embed Code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Input
              value={widgetConfigService.generateEmbedCode(widgetKey)}
              readOnly
              className="font-mono text-sm"
            />
            <Button variant="outline" onClick={handleCopyEmbedCode}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Copy this code and paste it into your website's HTML before the closing &lt;/body&gt; tag.
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 