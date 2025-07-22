import * as React from "react"

import { cn } from "@/lib/utils"

interface PopoverContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PopoverContext = React.createContext<PopoverContextValue | undefined>(undefined)

interface PopoverProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const Popover = ({ open, defaultOpen = false, onOpenChange, children }: PopoverProps) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  
  const isOpen = open !== undefined ? open : internalOpen
  
  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    if (open === undefined) {
      setInternalOpen(newOpen)
    }
    onOpenChange?.(newOpen)
  }, [open, onOpenChange])
  
  const contextValue = React.useMemo(() => ({
    open: isOpen,
    onOpenChange: handleOpenChange
  }), [isOpen, handleOpenChange])
  
  return (
    <PopoverContext.Provider value={contextValue}>
      {children}
    </PopoverContext.Provider>
  )
}

interface PopoverTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ className, children, onClick, ...props }, ref) => {
    const context = React.useContext(PopoverContext)
    if (!context) {
      throw new Error("PopoverTrigger must be used within Popover")
    }
    
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      context.onOpenChange(!context.open)
      onClick?.(event)
    }
    
    return (
      <button
        ref={ref}
        className={cn(className)}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    )
  }
)
PopoverTrigger.displayName = "PopoverTrigger"

interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end"
  side?: "top" | "right" | "bottom" | "left"
}

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, side = "bottom", children, ...props }, ref) => {
    const context = React.useContext(PopoverContext)
    const contentRef = React.useRef<HTMLDivElement>(null)
    
    if (!context) {
      throw new Error("PopoverContent must be used within Popover")
    }
    
    // Close popover when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
          context.onOpenChange(false)
        }
      }
      
      if (context.open) {
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
      }
    }, [context])
    
    // Close popover on Escape key
    React.useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          context.onOpenChange(false)
        }
      }
      
      if (context.open) {
        document.addEventListener("keydown", handleEscape)
        return () => document.removeEventListener("keydown", handleEscape)
      }
    }, [context])
    
    if (!context.open) {
      return null
    }
    
    return (
      <div
        ref={(node) => {
          contentRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        className={cn(
          "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          side === "bottom" && "data-[side=bottom]:slide-in-from-top-2",
          side === "top" && "data-[side=top]:slide-in-from-bottom-2",
          side === "right" && "data-[side=right]:slide-in-from-left-2",
          side === "left" && "data-[side=left]:slide-in-from-right-2",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverTrigger, PopoverContent } 