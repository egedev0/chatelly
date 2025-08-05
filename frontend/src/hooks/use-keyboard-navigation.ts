import { useEffect, useCallback } from 'react'

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  description: string
  action: () => void
}

export function useKeyboardNavigation(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const pressedKey = event.key.toLowerCase()
    const isCtrl = event.ctrlKey
    const isShift = event.shiftKey
    const isAlt = event.altKey
    const isMeta = event.metaKey

    for (const shortcut of shortcuts) {
      const keyMatch = shortcut.key.toLowerCase() === pressedKey
      const ctrlMatch = shortcut.ctrl === undefined || shortcut.ctrl === isCtrl
      const shiftMatch = shortcut.shift === undefined || shortcut.shift === isShift
      const altMatch = shortcut.alt === undefined || shortcut.alt === isAlt
      const metaMatch = shortcut.meta === undefined || shortcut.meta === isMeta

      if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
        event.preventDefault()
        shortcut.action()
        break
      }
    }
  }, [shortcuts])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return {
    shortcuts: shortcuts.map(shortcut => ({
      ...shortcut,
      keyCombo: [
        shortcut.ctrl && 'Ctrl',
        shortcut.shift && 'Shift',
        shortcut.alt && 'Alt',
        shortcut.meta && 'Cmd',
        shortcut.key.toUpperCase()
      ].filter(Boolean).join('+')
    }))
  }
}

// Common keyboard shortcuts
export const commonShortcuts: KeyboardShortcut[] = [
  {
    key: 'k',
    ctrl: true,
    description: 'Search',
    action: () => {
      // Open search modal
      console.log('Open search')
    }
  },
  {
    key: 'n',
    ctrl: true,
    description: 'New website',
    action: () => {
      // Open new website modal
      console.log('New website')
    }
  },
  {
    key: 's',
    ctrl: true,
    description: 'Save',
    action: () => {
      // Save current form
      console.log('Save')
    }
  },
  {
    key: 'Escape',
    description: 'Close modal',
    action: () => {
      // Close current modal
      console.log('Close modal')
    }
  },
  {
    key: '?',
    description: 'Show shortcuts',
    action: () => {
      // Show keyboard shortcuts help
      console.log('Show shortcuts')
    }
  }
] 