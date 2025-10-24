'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'

interface SafeSelectProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  children: React.ReactNode
  className?: string
}

interface SafeSelectItemProps {
  value: string
  children: React.ReactNode
}

export function SafeSelect({ value, onValueChange, placeholder, children, className }: SafeSelectProps) {
  const [isClient, setIsClient] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLabel, setSelectedLabel] = useState(placeholder || 'Pilih...')
  const selectRef = useRef<HTMLDivElement>(null)
  const [items, setItems] = useState<Array<{value: string, label: string}>>([])

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Extract items from children whenever they change
  useEffect(() => {
    const extractItems = (children: any): Array<{value: string, label: string}> => {
      const result: Array<{value: string, label: string}> = []
      
      const traverse = (node: any) => {
        if (Array.isArray(node)) {
          node.forEach(traverse)
        } else if (node && typeof node === 'object' && node.props) {
          if (node.type && (node.type.name === 'SafeSelectItem' || node.type.displayName === 'SafeSelectItem')) {
            result.push({
              value: node.props.value,
              label: node.props.children
            })
          } else if (node.props.children) {
            traverse(node.props.children)
          }
        }
      }
      
      traverse(children)
      return result
    }

    const extractedItems = extractItems(children)
    console.log('Extracted items:', extractedItems) // Debug log
    setItems(extractedItems)

    // Update selected label
    if (value) {
      const selectedItem = extractedItems.find(item => item.value === value)
      if (selectedItem) {
        setSelectedLabel(selectedItem.label)
      }
    } else {
      setSelectedLabel(placeholder || 'Pilih...')
    }
  }, [children, value, placeholder])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleItemClick = (itemValue: string, itemLabel: string) => {
    onValueChange(itemValue)
    setSelectedLabel(itemLabel)
    setIsOpen(false)
  }

  if (!isClient) {
    // Render a simple input placeholder during SSR
    return (
      <div className={`w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md ${className}`}>
        <span className="text-muted-foreground">{placeholder || 'Pilih...'}</span>
      </div>
    )
  }

  return (
    <div ref={selectRef} className={`relative ${className}`} data-safe-select>
      <Button
        type="button"
        variant="outline"
        className="w-full h-10 justify-between text-left font-normal"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? '' : 'text-muted-foreground'}>
          {selectedLabel}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="p-1">
            {items.map((item, index) => (
              <div
                key={item.value || index}
                className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                onClick={() => handleItemClick(item.value, item.label)}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function SafeSelectItem({ value, children }: SafeSelectItemProps) {
  // This component is used for type safety and structure
  // The actual rendering is handled by SafeSelect
  return <>{children}</>
}