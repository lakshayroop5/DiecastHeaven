import * as React from "react"
import { cn } from "@/lib/utils"

const badgeVariants = {
  default: "border-transparent bg-hotwheels-red text-white hover:bg-hotwheels-red/80",
  secondary: "border-transparent bg-hotwheels-gray text-hotwheels-white hover:bg-hotwheels-black",
  destructive: "border-transparent bg-red-500 text-white hover:bg-red-500/80",
  outline: "text-hotwheels-yellow border-hotwheels-yellow",
} as const

type BadgeVariant = keyof typeof badgeVariants

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
