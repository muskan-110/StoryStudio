"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu'
// Removed settings popover imports
import { 
  Menu
} from 'lucide-react'
import { toast } from 'sonner'

interface ExamplePrompt {
  id: string
  title: string
  prompt: string
}

const examplePrompts: ExamplePrompt[] = [
  {
    id: 'fantasy-quest',
    title: 'Fantasy Quest',
    prompt: 'A young mage discovers an ancient artifact that could save or destroy their kingdom'
  },
  {
    id: 'space-adventure',
    title: 'Space Adventure', 
    prompt: 'The last human colony ship encounters a mysterious alien signal after decades in deep space'
  },
  {
    id: 'detective-mystery',
    title: 'Detective Mystery',
    prompt: 'A detective investigates a series of art thefts where each stolen piece tells part of a larger story'
  },
  {
    id: 'time-travel',
    title: 'Time Travel',
    prompt: 'A historian accidentally activates a time machine and must prevent their own paradox'
  },
  {
    id: 'post-apocalyptic',
    title: 'Post-Apocalyptic',
    prompt: 'Survivors in an underground bunker discover that the surface world has changed in unexpected ways'
  },
  {
    id: 'romantic-comedy',
    title: 'Romantic Comedy',
    prompt: 'Two rival food truck owners are forced to work together at the same festival'
  }
]

interface HeaderSettings {
  defaultStyle: string
  imageSize: string
  contentSafety: boolean
}

interface HeaderProps {
  title: string
  onNewStory?: () => void
  onExamplePrompt?: (prompt: string) => void
}

export default function Header({ title, onNewStory, onExamplePrompt }: HeaderProps) {
  const [settings, setSettings] = useState<HeaderSettings>({
    defaultStyle: 'cinematic',
    imageSize: 'medium',
    contentSafety: true
  })

  const handleExampleSelect = (prompt: ExamplePrompt) => {
    if (onExamplePrompt) onExamplePrompt(prompt.prompt)
    toast.success(`Added example: ${prompt.title}`)
  }

  const handleSettingToggle = (key: keyof HeaderSettings, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    if (typeof window !== 'undefined') {
      localStorage.setItem('storyStudioSettings', JSON.stringify(newSettings))
    }
    toast.success('Settings updated')
  }

  const handleNewStory = () => {
    if (onNewStory) onNewStory()
    toast.success('Ready for a new story')
  }

  const [isOnline] = useState(true)

  return (
    <header className="h-16 bg-card border-b border-border sticky top-0 z-50">
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Left: Logo and tagline */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground font-heading font-bold text-sm">S</span>
          </div>
          <div className="flex flex-col">
            <h1 className="font-heading font-bold text-lg text-foreground">StoryStudio</h1>
            <span className="text-xs text-muted-foreground hidden sm:block">AI-powered storytelling workspace</span>
          </div>
        </div>

        {/* Center: Project title */}
        <div className="hidden md:flex flex-1 justify-center max-w-md">
          <div className="text-sm text-muted-foreground">
            {title}
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center space-x-2">
          {/* Examples dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                Examples
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              {examplePrompts.map((example) => (
                <DropdownMenuItem 
                  key={example.id}
                  onClick={() => handleExampleSelect(example)}
                  className="flex flex-col items-start p-3 cursor-pointer"
                >
                  <div className="font-medium text-sm">{example.title}</div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {example.prompt}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile menu for examples */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="sm:hidden">
                <Menu className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              {examplePrompts.map((example) => (
                <DropdownMenuItem 
                  key={example.id}
                  onClick={() => handleExampleSelect(example)}
                  className="flex flex-col items-start p-3"
                >
                  <div className="font-medium text-sm">{example.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {example.prompt}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings removed */}

          {/* New Story button */}
          <Button 
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-medium"
            onClick={handleNewStory}
          >
            New Story
          </Button>

          {/* Profile menu removed */}
        </div>
      </div>
    </header>
  )
}