'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Settings,
  Palette,
  MessageSquare,
  Globe,
  Shield,
  Bell,
  User,
  CreditCard,
  Save,
} from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // Widget Appearance
    widgetPosition: 'bottom-right',
    primaryColor: '#3b82f6',
    widgetTitle: 'Chat with us',
    welcomeMessage: 'Hello! How can we help you today?',
    showAvatar: true,
    showTypingIndicator: true,
    
    // Chat Settings
    autoReply: true,
    autoReplyMessage: 'Thanks for your message! We\'ll get back to you soon.',
    enableTranslation: true,
    defaultLanguage: 'en',
    moderationEnabled: true,
    
    // Notifications
    emailNotifications: true,
    pushNotifications: false,
    newChatNotification: true,
    
    // Profile
    name: 'John Doe',
    email: 'john@example.com',
    company: 'Example Corp',
    
    // Security
    twoFactorEnabled: false,
  })

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving settings:', settings)
  }

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Customize your Chatelly experience
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="widget" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="widget" className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span>Widget</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Chat</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Widget Settings */}
        <TabsContent value="widget" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Widget Appearance</CardTitle>
              <CardDescription>
                Customize how your chat widget looks on your website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="position">Widget Position</Label>
                  <Select
                    value={settings.widgetPosition}
                    onValueChange={(value) => updateSetting('widgetPosition', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="top-left">Top Left</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="color">Primary Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => updateSetting('primaryColor', e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) => updateSetting('primaryColor', e.target.value)}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Widget Title</Label>
                <Input
                  value={settings.widgetTitle}
                  onChange={(e) => updateSetting('widgetTitle', e.target.value)}
                  placeholder="Chat with us"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="welcome">Welcome Message</Label>
                <Textarea
                  value={settings.welcomeMessage}
                  onChange={(e) => updateSetting('welcomeMessage', e.target.value)}
                  placeholder="Hello! How can we help you today?"
                  rows={3}
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Avatar</Label>
                    <p className="text-sm text-muted-foreground">
                      Display user avatars in chat
                    </p>
                  </div>
                  <Switch
                    checked={settings.showAvatar}
                    onCheckedChange={(checked) => updateSetting('showAvatar', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Typing Indicator</Label>
                    <p className="text-sm text-muted-foreground">
                      Show when someone is typing
                    </p>
                  </div>
                  <Switch
                    checked={settings.showTypingIndicator}
                    onCheckedChange={(checked) => updateSetting('showTypingIndicator', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chat Settings */}
        <TabsContent value="chat" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chat Configuration</CardTitle>
              <CardDescription>
                Configure chat behavior and features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Reply</Label>
                    <p className="text-sm text-muted-foreground">
                      Send automatic replies to new messages
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoReply}
                    onCheckedChange={(checked) => updateSetting('autoReply', checked)}
                  />
                </div>
                
                {settings.autoReply && (
                  <div className="space-y-2">
                    <Label htmlFor="autoReplyMessage">Auto Reply Message</Label>
                    <Textarea
                      value={settings.autoReplyMessage}
                      onChange={(e) => updateSetting('autoReplyMessage', e.target.value)}
                      placeholder="Thanks for your message! We'll get back to you soon."
                      rows={3}
                    />
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Translation</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable automatic message translation
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableTranslation}
                    onCheckedChange={(checked) => updateSetting('enableTranslation', checked)}
                  />
                </div>
                
                {settings.enableTranslation && (
                  <div className="space-y-2">
                    <Label htmlFor="language">Default Language</Label>
                    <Select
                      value={settings.defaultLanguage}
                      onValueChange={(value) => updateSetting('defaultLanguage', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="tr">Turkish</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Content Moderation</Label>
                  <p className="text-sm text-muted-foreground">
                    Filter inappropriate content automatically
                  </p>
                </div>
                <Switch
                  checked={settings.moderationEnabled}
                  onCheckedChange={(checked) => updateSetting('moderationEnabled', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified about chat activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive browser push notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New Chat Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when new chats start
                    </p>
                  </div>
                  <Switch
                    checked={settings.newChatNotification}
                    onCheckedChange={(checked) => updateSetting('newChatNotification', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    value={settings.name}
                    onChange={(e) => updateSetting('name', e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    type="email"
                    value={settings.email}
                    onChange={(e) => updateSetting('email', e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  value={settings.company}
                  onChange={(e) => updateSetting('company', e.target.value)}
                  placeholder="Example Corp"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch
                    checked={settings.twoFactorEnabled}
                    onCheckedChange={(checked) => updateSetting('twoFactorEnabled', checked)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Change Password</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input type="password" placeholder="Enter current password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input type="password" placeholder="Enter new password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input type="password" placeholder="Confirm new password" />
                  </div>
                  <Button variant="outline">Update Password</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}