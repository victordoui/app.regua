import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-8 w-[56px] shrink-0 cursor-pointer items-center rounded-full relative",
      "transition-all duration-200 [transition-timing-function:cubic-bezier(0.27,0.2,0.25,1.51)]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=unchecked]:bg-[rgb(131,131,131)]",
      "data-[state=checked]:bg-green-500",
      className
    )}
    {...props}
    ref={ref}
  >
    {/* Effect line */}
    <span
      className={cn(
        "absolute w-[12px] h-[4px] bg-white rounded-[1px]",
        "transition-all duration-200 ease-in-out",
        "data-[state=unchecked]:left-[10px]",
        "data-[state=checked]:left-[calc(100%-20px)]"
      )}
      data-state={props.checked !== undefined ? (props.checked ? "checked" : "unchecked") : undefined}
    />

    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none absolute h-[24px] w-[24px] rounded-full bg-white z-[1]",
        "flex items-center justify-center",
        "transition-all duration-200 [transition-timing-function:cubic-bezier(0.27,0.2,0.25,1.51)]",
        "data-[state=unchecked]:left-[4px] data-[state=unchecked]:shadow-[1px_1px_2px_rgba(146,146,146,0.45)]",
        "data-[state=checked]:left-[calc(100%-28px)] data-[state=checked]:shadow-[-1px_1px_2px_rgba(163,163,163,0.45)]"
      )}
    >
      {/* Checkmark icon */}
      <svg
        className={cn(
          "absolute w-[14px] h-auto text-green-500",
          "transition-all duration-200 [transition-timing-function:cubic-bezier(0.27,0.2,0.25,1.51)]",
          "scale-0 [[data-state=checked]_&]:scale-100"
        )}
        viewBox="0 0 12 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="1.5 6 4.5 9 10.5 1" />
      </svg>
      {/* Cross icon */}
      <svg
        className={cn(
          "absolute w-[8px] h-auto text-[rgb(131,131,131)]",
          "transition-all duration-200 [transition-timing-function:cubic-bezier(0.27,0.2,0.25,1.51)]",
          "scale-100 [[data-state=checked]_&]:scale-0"
        )}
        viewBox="0 0 10 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="1" y1="1" x2="9" y2="9" />
        <line x1="9" y1="1" x2="1" y2="9" />
      </svg>
    </SwitchPrimitives.Thumb>
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
