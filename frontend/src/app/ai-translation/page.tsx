'use client'

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  IconBrandOpenai,
  IconLanguage,
  IconShield,
  IconTrash,
  IconPlus,
  IconAlertTriangle,
  IconGlobe
} from "@tabler/icons-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "sonner"
import { useState, useMemo } from "react"

// Available languages for translation
const availableLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'ms', name: 'Malay', flag: '🇲🇾' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'tl', name: 'Filipino', flag: '🇵🇭' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
  { code: 'am', name: 'Amharic', flag: '🇪🇹' },
  { code: 'he', name: 'Hebrew', flag: '🇮🇱' },
  { code: 'fa', name: 'Persian', flag: '🇮🇷' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
  { code: 'da', name: 'Danish', flag: '🇩🇰' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'cs', name: 'Czech', flag: '🇨🇿' },
  { code: 'sk', name: 'Slovak', flag: '🇸🇰' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
  { code: 'bg', name: 'Bulgarian', flag: '🇧🇬' },
  { code: 'hr', name: 'Croatian', flag: '🇭🇷' },
  { code: 'sr', name: 'Serbian', flag: '🇷🇸' },
  { code: 'sl', name: 'Slovenian', flag: '🇸🇮' },
  { code: 'lv', name: 'Latvian', flag: '🇱🇻' },
  { code: 'lt', name: 'Lithuanian', flag: '🇱🇹' },
  { code: 'et', name: 'Estonian', flag: '🇪🇪' },
  { code: 'mt', name: 'Maltese', flag: '🇲🇹' },
  { code: 'ga', name: 'Irish', flag: '🇮🇪' },
  { code: 'cy', name: 'Welsh', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  { code: 'is', name: 'Icelandic', flag: '🇮🇸' },
  { code: 'mk', name: 'Macedonian', flag: '🇲🇰' },
  { code: 'sq', name: 'Albanian', flag: '🇦🇱' },
  { code: 'bs', name: 'Bosnian', flag: '🇧🇦' },
  { code: 'me', name: 'Montenegrin', flag: '🇲🇪' },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
  { code: 'be', name: 'Belarusian', flag: '🇧🇾' },
  { code: 'kk', name: 'Kazakh', flag: '🇰🇿' },
  { code: 'ky', name: 'Kyrgyz', flag: '🇰🇬' },
  { code: 'uz', name: 'Uzbek', flag: '🇺🇿' },
  { code: 'tg', name: 'Tajik', flag: '🇹🇯' },
  { code: 'mn', name: 'Mongolian', flag: '🇲🇳' },
  { code: 'ka', name: 'Georgian', flag: '🇬🇪' },
  { code: 'hy', name: 'Armenian', flag: '🇦🇲' },
  { code: 'az', name: 'Azerbaijani', flag: '🇦🇿' }
]

export default function AITranslationPage() {
  const [aiModerationEnabled, setAiModerationEnabled] = useState(true)
  const [aiTranslationEnabled, setAiTranslationEnabled] = useState(false)
  const [bannedWords, setBannedWords] = useState(['spam', 'inappropriate', 'offensive'])
  const [newBannedWord, setNewBannedWord] = useState('')
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en', 'tr'])
  const [autoDetectLanguage, setAutoDetectLanguage] = useState(true)
  const [moderationSensitivity, setModerationSensitivity] = useState('medium')
  const [languageSearch, setLanguageSearch] = useState('')

  // Filter languages based on search
  const filteredLanguages = useMemo(() => {
    return availableLanguages.filter(language =>
      language.name.toLowerCase().includes(languageSearch.toLowerCase()) ||
      language.code.toLowerCase().includes(languageSearch.toLowerCase())
    )
  }, [languageSearch])

  const handleAddBannedWord = () => {
    if (newBannedWord.trim() && !bannedWords.includes(newBannedWord.trim().toLowerCase())) {
      setBannedWords([...bannedWords, newBannedWord.trim().toLowerCase()])
      setNewBannedWord('')
      toast.success('Banned word added successfully')
    }
  }

  const handleRemoveBannedWord = (word: string) => {
    setBannedWords(bannedWords.filter(w => w !== word))
    toast.success('Banned word removed successfully')
  }

  const handleLanguageToggle = (languageCode: string) => {
    setSelectedLanguages(prev => 
      prev.includes(languageCode)
        ? prev.filter(code => code !== languageCode)
        : [...prev, languageCode]
    )
  }

  const handleSaveSettings = () => {
    toast.success('Settings saved successfully', {
      description: 'AI moderation and translation settings have been updated.',
    })
  }

  return (
    <TooltipProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

                {/* Header */}
                <div className="px-4 lg:px-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                      <IconBrandOpenai className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold">AI Moderation & Translation</h1>
                      <p className="text-muted-foreground">Configure AI-powered content moderation and real-time translation</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Main Content */}
                <div className="px-4 lg:px-6 space-y-6">
                  
                  {/* AI Moderation Section */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <IconShield className="h-5 w-5 text-orange-600" />
                          <CardTitle>AI Content Moderation</CardTitle>
                        </div>
                        <Switch
                          checked={aiModerationEnabled}
                          onCheckedChange={setAiModerationEnabled}
                        />
                      </div>
                      <CardDescription>
                        Automatically detect and filter inappropriate content using AI
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      
                      {/* Moderation Settings */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="sensitivity">Moderation Sensitivity</Label>
                          <Select value={moderationSensitivity} onValueChange={setModerationSensitivity}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select sensitivity level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low - Only severe violations</SelectItem>
                              <SelectItem value="medium">Medium - Balanced approach</SelectItem>
                              <SelectItem value="high">High - Strict filtering</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <IconAlertTriangle className="h-4 w-4 text-orange-600" />
                            <span className="text-sm font-medium">Moderation Features</span>
                          </div>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Automatic detection of spam and inappropriate content</li>
                            <li>• Real-time content filtering before message delivery</li>
                            <li>• Customizable sensitivity levels</li>
                            <li>• Integration with banned words list</li>
                          </ul>
                        </div>
                      </div>

                      {/* Banned Words Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-medium">Banned Words</Label>
                          <Badge variant="secondary">{bannedWords.length} words</Badge>
                        </div>
                        
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add a banned word..."
                            value={newBannedWord}
                            onChange={(e) => setNewBannedWord(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddBannedWord()}
                          />
                          <Button onClick={handleAddBannedWord} disabled={!newBannedWord.trim()}>
                            <IconPlus className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {bannedWords.map((word) => (
                            <Badge key={word} variant="destructive" className="flex items-center gap-1">
                              {word}
                              <button
                                onClick={() => handleRemoveBannedWord(word)}
                                className="ml-1 hover:bg-red-700 rounded-full p-0.5"
                              >
                                <IconTrash className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>

                        {bannedWords.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No banned words configured. Add words that should be filtered from chat messages.
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Translation Section */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <IconLanguage className="h-5 w-5 text-blue-600" />
                          <CardTitle>AI Translation</CardTitle>
                        </div>
                        <Switch
                          checked={aiTranslationEnabled}
                          onCheckedChange={setAiTranslationEnabled}
                        />
                      </div>
                      <CardDescription>
                        Enable real-time translation for chat messages across different languages
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      
                      {/* Translation Settings */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="auto-detect"
                            checked={autoDetectLanguage}
                            onCheckedChange={setAutoDetectLanguage}
                          />
                          <Label htmlFor="auto-detect">Auto-detect message language</Label>
                        </div>


                      </div>

                      {/* Language Selection */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-medium">Supported Languages</Label>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{selectedLanguages.length} of {availableLanguages.length} selected</Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedLanguages(availableLanguages.map(lang => lang.code))}
                              disabled={selectedLanguages.length === availableLanguages.length}
                            >
                              Select All
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedLanguages([])}
                              disabled={selectedLanguages.length === 0}
                            >
                              Clear All
                            </Button>
                          </div>
                        </div>
                        
                        {/* Language Search */}
                        <div className="space-y-2">
                          <Label htmlFor="language-search" className="text-sm font-medium">Search Languages</Label>
                          <Input
                            id="language-search"
                            placeholder="Search languages..."
                            value={languageSearch}
                            onChange={(e) => setLanguageSearch(e.target.value)}
                            className="w-full"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                          {filteredLanguages.map((language) => (
                            <div
                              key={language.code}
                              className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                                selectedLanguages.includes(language.code)
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 dark:border-blue-400'
                                  : 'border-muted hover:bg-muted/50'
                              }`}
                              onClick={() => handleLanguageToggle(language.code)}
                            >
                              <Checkbox
                                checked={selectedLanguages.includes(language.code)}
                                onChange={() => handleLanguageToggle(language.code)}
                              />
                              <span className="text-lg">{language.flag}</span>
                              <Label className={`cursor-pointer text-sm ${
                                selectedLanguages.includes(language.code)
                                  ? 'text-blue-700 dark:text-blue-300'
                                  : ''
                              }`}>
                                {language.name}
                              </Label>
                            </div>
                          ))}
                        </div>

                        {filteredLanguages.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No languages found matching "{languageSearch}".
                          </p>
                        )}

                        {selectedLanguages.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Select at least one language to enable translation features.
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Status Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Current Configuration</CardTitle>
                      <CardDescription>Overview of your AI moderation and translation settings</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="font-medium flex items-center gap-2">
                            <IconShield className="h-4 w-4" />
                            AI Moderation
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Status:</span>
                              <Badge variant={aiModerationEnabled ? "default" : "secondary"}>
                                {aiModerationEnabled ? "Enabled" : "Disabled"}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Sensitivity:</span>
                              <span className="capitalize">{moderationSensitivity}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Banned Words:</span>
                              <span>{bannedWords.length} configured</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-medium flex items-center gap-2">
                            <IconLanguage className="h-4 w-4" />
                            AI Translation
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Status:</span>
                              <Badge variant={aiTranslationEnabled ? "default" : "secondary"}>
                                {aiTranslationEnabled ? "Enabled" : "Disabled"}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Auto-detect:</span>
                              <span>{autoDetectLanguage ? "Yes" : "No"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Languages:</span>
                              <span>{selectedLanguages.length} selected</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <Button onClick={handleSaveSettings} className="px-8">
                      <IconBrandOpenai className="h-4 w-4 mr-2" />
                      Save Configuration
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}