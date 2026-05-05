import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '@/lib/utils'
export const TooltipProvider = TooltipPrimitive.Provider
export const Tooltip = TooltipPrimitive.Root
export const TooltipTrigger = TooltipPrimitive.Trigger
export function TooltipContent({ className, sideOffset = 6, ...props }) {
  return <TooltipPrimitive.Content sideOffset={sideOffset} className={cn('z-50 max-w-xs rounded-lg border border-[rgba(0,245,255,0.15)] bg-[#0A0F2C] px-3 py-2 text-xs text-gray-300 shadow-xl animate-in fade-in-0 zoom-in-95', className)} {...props} />
}
