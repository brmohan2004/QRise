"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

function TooltipProvider({ delay, ...props }: TooltipPrimitive.Provider.Props & { delay?: number }) {
  return <TooltipPrimitive.Provider delay={delay} {...props} />
}

function Tooltip({ ...props }: TooltipPrimitive.Root.Props) {
  return (
    <TooltipPrimitive.Root data-slot="tooltip" {...props} />
  )
}

function TooltipTrigger({ asChild, ...props }: TooltipPrimitive.Trigger.Props & { asChild?: boolean }) {
  const Comp = (asChild ? Slot : TooltipPrimitive.Trigger) as any
  return <Comp data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  sideOffset = 4,
  side = "top",
  ...props
}: TooltipPrimitive.Popup.Props & { sideOffset?: number; side?: "top" | "right" | "bottom" | "left" }) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner sideOffset={sideOffset} side={side}>
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            className
          )}
          {...props}
        />
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
