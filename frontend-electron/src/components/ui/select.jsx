import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

const SelectContext = React.createContext({})

const Select = ({ children, value, onValueChange, disabled }) => {
  const [open, setOpen] = useState(false)
  const [internalValue, setInternalValue] = useState(value)
  const triggerRef = useRef(null)

  React.useEffect(() => {
    setInternalValue(value)
  }, [value])

  const handleValueChange = (newValue) => {
    setInternalValue(newValue)
    onValueChange?.(newValue)
    setOpen(false)
  }

  return (
    <SelectContext.Provider value={{ 
      value: internalValue, 
      onValueChange: handleValueChange, 
      open, 
      setOpen,
      disabled,
      triggerRef
    }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const { open, setOpen, disabled, triggerRef } = React.useContext(SelectContext)
  const buttonRef = useRef(null)

  const handleRef = (node) => {
    buttonRef.current = node
    triggerRef.current = node
    if (typeof ref === 'function') {
      ref(node)
    } else if (ref) {
      ref.current = node
    }
  }

  return (
    <button
      type="button"
      ref={handleRef}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={() => !disabled && setOpen(!open)}
      disabled={disabled}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ children, placeholder }) => {
  const { value } = React.useContext(SelectContext)
  return <span>{children || placeholder}</span>
}

const SelectContent = ({ className, children, ...props }) => {
  const { open, setOpen, triggerRef } = React.useContext(SelectContext)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })
  const contentRef = useRef(null)

  useEffect(() => {
    if (open && triggerRef.current) {
      const updatePosition = () => {
        const rect = triggerRef.current.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        const spaceBelow = viewportHeight - rect.bottom
        const contentHeight = contentRef.current?.offsetHeight || 200
        
        // Determinar si abrir hacia arriba o abajo
        const openUpward = spaceBelow < contentHeight && rect.top > contentHeight
        
        setPosition({
          top: openUpward ? rect.top - contentHeight - 4 : rect.bottom + 4,
          left: rect.left,
          width: rect.width
        })
      }
      
      updatePosition()
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [open, triggerRef])

  if (!open) return null

  return createPortal(
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={() => setOpen(false)}
      />
      <div
        ref={contentRef}
        className={cn(
          "fixed z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg",
          "dark:bg-[#1a1a1a] dark:border-[#2a2a2a]",
          className
        )}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          width: `${position.width}px`
        }}
        {...props}
      >
        <div className="p-1 max-h-[300px] overflow-y-auto">
          {children}
        </div>
      </div>
    </>,
    document.body
  )
}

const SelectItem = React.forwardRef(({ className, children, value, ...props }, ref) => {
  const { onValueChange, value: selectedValue } = React.useContext(SelectContext)
  const isSelected = selectedValue === value

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        isSelected && "bg-accent",
        className
      )}
      onClick={() => onValueChange(value)}
      {...props}
    >
      {children}
    </div>
  )
})
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }