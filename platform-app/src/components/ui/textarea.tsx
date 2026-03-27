import * as React from "react"

import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const textareaVariants = cva(
  "flex field-sizing-content w-full rounded-lg border bg-white/5 border-white/10 text-white shadow-xs transition-[color,box-shadow] outline-none placeholder:text-white/30 focus-visible:border-brand-500 focus-visible:ring-1 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20",
  {
    variants: {
      inputSize: {
        default: "min-h-16 px-4 py-2 text-base md:text-sm",
        lg: "min-h-20 px-4 py-3 text-base",
        xl: "min-h-24 px-6 py-4 text-lg rounded-xl",
      },
    },
    defaultVariants: {
      inputSize: "default",
    },
  }
)

type TextareaProps = React.ComponentProps<"textarea"> &
  VariantProps<typeof textareaVariants>

function Textarea({ className, inputSize, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(textareaVariants({ inputSize }), className)}
      {...props}
    />
  )
}

export { Textarea, textareaVariants }
