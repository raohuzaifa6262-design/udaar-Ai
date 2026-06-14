import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "@/lib/utils"

// ─── Input ────────────────────────────────────────────────────────────────────
// Brand: h-12 mobile touch-friendly, emerald ring on focus, text-base to prevent
// iOS auto-zoom, dark surface aware.
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        // Layout & shape
        "h-12 w-full min-w-0 rounded-xl border border-input bg-background px-4 py-2",
        // Typography — text-base prevents iOS zoom on focus
        "text-base text-foreground placeholder:text-muted-foreground",
        // Transitions
        "transition-colors duration-150 outline-none",
        // Focus: brand emerald ring
        "focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/25",
        // Dark mode
        "dark:bg-input/20 dark:border-input dark:placeholder:text-muted-foreground/60",
        // States
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted/50 disabled:opacity-50",
        // File input
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        // Validation
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        "dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
