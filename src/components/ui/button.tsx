import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none font-black uppercase tracking-tighter transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 shrink-0 [&_svg]:shrink-0 outline-none border-4 border-black shadow-neo hover:-translate-y-1 active:translate-y-0 active:shadow-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-black hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90",
        outline:
          "bg-white text-black hover:bg-gray-100",
        secondary:
          "bg-secondary text-black hover:bg-secondary/90",
        ghost:
          "border-0 shadow-none hover:bg-black/5 hover:-translate-y-0",
        link: "border-0 shadow-none text-primary underline-offset-4 hover:underline hover:-translate-y-0 p-0 h-auto",
      },
      size: {
        default: "h-12 px-6 text-lg",
        xs: "h-8 px-2 text-xs border-2 shadow-neo-sm [&_svg:not([class*='size-'])]:size-3",
        sm: "h-10 px-4 text-sm border-2 shadow-neo-sm",
        lg: "h-16 px-8 text-xl",
        xl: "h-20 px-12 text-2xl",
        icon: "size-12",
        "icon-xs": "size-8 border-2 shadow-neo-sm [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-10 border-2 shadow-neo-sm",
        "icon-lg": "size-16",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
