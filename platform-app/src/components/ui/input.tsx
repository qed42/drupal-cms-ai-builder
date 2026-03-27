import * as React from "react"

import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "w-full min-w-0 rounded-lg border bg-white/5 border-white/10 text-white shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-white/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-brand-500 focus-visible:ring-1 focus-visible:ring-brand-500 aria-invalid:border-destructive aria-invalid:ring-destructive/20",
  {
    variants: {
      inputSize: {
        default: "h-9 px-4 py-1 text-base md:text-sm",
        lg: "h-12 px-4 py-2 text-base",
        xl: "h-14 px-6 py-3 text-lg rounded-xl",
      },
    },
    defaultVariants: {
      inputSize: "default",
    },
  }
)

type InputProps = React.ComponentProps<"input"> &
  VariantProps<typeof inputVariants>

function Input({ className, type, inputSize, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ inputSize }), className)}
      {...props}
    />
  )
}

export { Input, inputVariants }
