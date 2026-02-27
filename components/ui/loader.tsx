import type React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
}

export function Loader({ size = "md", className, ...props }: LoaderProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-6 w-6",
  }

  return (
    <div className={cn("animate-spin", sizeClasses[size], className)} {...props}>
      <Loader2 className="h-full w-full" />
    </div>
  )
}

