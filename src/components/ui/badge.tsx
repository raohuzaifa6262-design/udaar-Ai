import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// ─── Badge Variants ────────────────────────────────────────────────────────────
// Brand: pill shape, semantic gave/got/settled variants, no border by default.
const badgeVariants = cva(
  "group/badge inline-flex h-[22px] w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2.5 py-0.5 text-[11px] font-semibold tracking-wide whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        // Default: brand primary pill
        default:
          "bg-primary text-primary-foreground [a]:hover:bg-primary/80",

        // Secondary: subtle muted
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",

        // Destructive: red tint
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 [a]:hover:bg-destructive/20",

        // Gave: money lent (Udhaar) — soft red pill
        gave:
          "bg-gave text-gave [a]:hover:bg-gave/80",

        // Got: payment received — soft emerald pill
        got:
          "bg-got text-got [a]:hover:bg-got/80",

        // Settled: zero balance — neutral gray pill
        settled:
          "bg-muted text-muted-foreground [a]:hover:bg-muted/80",

        // Warning: overdue / pending — amber pill
        warning:
          "bg-warning/10 text-warning [a]:hover:bg-warning/20",

        // Outline: bordered, no fill
        outline:
          "border-border text-foreground [a]:hover:bg-muted",

        // Ghost: no background
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",

        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
