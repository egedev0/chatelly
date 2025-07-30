'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Globe,
  MessageSquare,
  Settings,
  Copy,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Code,
} from 'lucide-react'

const websites = [
  {
    id: 1,
    name: 'Main Website',
    domain: 'example.com',
    description: 'Company main website with product information',
    widgetKey: 'widget_abc123',
    chats: 12,
    visitors: 234,
    status: 'active',
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    name: 'Online Store',
    domain: 'mystore.com',
    description: 'E-commerce platform for online sales',
    widgetKey: 'widget_def456',
    chats: 8,
    visitors: 156,
    status: 'active',
    createdAt: '2024-01-20',
  },
  {
    id: 3,
    name: 'Blog',
    domain: 'blog.example.com',
    description: 'Company blog and news updates',
    widgetKey: 'widget_ghi789',
    chats: 4,
    visitors: 89,
    status: 'inactive',
    createdAt: '2024-02-01',
  },
]

export default function WebsitesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false)
  const [selectedWebsite, setSelectedWebsite] = useState<any>(null)

  const handleCopyWidgetKey = (widgetKey: string) => {
    navigator.clipboard.writeText(widgetKey)
    // TODO: Add toast notification
  }

  const handleCopyCode = (widgetKey: string) => {
    const code = `<script src="https://api.chatelly.com/widget/${widgetKey}.js"></script>`
    navigator.clipboard.writeText(code)
    // TODO: Add toast notification
  }

  const showWidgetCode = (website: any) => {
    setSelectedWebsite(website)
    setIsCodeDialogOpen(true)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Websites</h1>
          <p className="text-muted-foreground">
            Manage your websites and chat widgets
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Website
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Website</DialogTitle>
              <DialogDescription>
                Add a new website to start using Chatelly chat widget.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  placeholder="My Website"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="domain" className="text-right">
                  Domain
                </Label>
                <Input
                  id="domain"
                  placeholder="example.com"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of your website"
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Add Website</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Websites Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {websites.map((website) => (
          <Card key={website.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">{website.name}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => showWidgetCode(website)}>
                      <Code className="mr-2 h-4 w-4" />
                      Get Widget Code
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View Analytics
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription>{website.domain}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{website.description}</p>
              
              <div className="flex items-center justify-between">
                <Badge variant={website.status === 'active' ? 'default' : 'secondary'}>
                  {website.status}
                </Badge>
                <div className="text-sm text-muted-foreground">
                  Created {website.createdAt}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center">
                  <div className="text-2xl font-bold">{website.chats}</div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center">
                    <MessageSquare className="mr-1 h-3 w-3" />
                    Chats
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{website.visitors}</div>
                  <div className="text-xs text-muted-foreground">Visitors</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">Widget Key</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={website.widgetKey}
                    readOnly
                    className="text-xs font-mono"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyWidgetKey(website.widgetKey)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Widget Code Dialog */}
      <Dialog open={isCodeDialogOpen} onOpenChange={setIsCodeDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Widget Installation Code</DialogTitle>
            <DialogDescription>
              Copy and paste this code into your website's HTML to add the Chatelly widget.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Installation Code</Label>
              <div className="mt-2 relative">
                <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
                  <code>{`<script src="https://api.chatelly.com/widget/${selectedWebsite?.widgetKey}.js"></script>`}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={() => selectedWebsite && handleCopyCode(selectedWebsite.widgetKey)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Instructions</Label>
              <div className="mt-2 text-sm text-muted-foreground space-y-2">
                <p>1. Copy the code above</p>
                <p>2. Paste it before the closing &lt;/body&gt; tag in your website</p>
                <p>3. The chat widget will appear automatically on your website</p>
                <p>4. Customize the widget appearance in the Settings page</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsCodeDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}