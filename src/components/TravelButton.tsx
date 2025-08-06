import { forwardRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const travelButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        primary: "bg-gradient-primary text-primary-foreground shadow-travel hover:shadow-lg",
        secondary: "bg-travel-orange text-secondary-foreground hover:bg-travel-orange/90 shadow-card",
        outline: "border-2 border-primary bg-background hover:bg-primary/5 text-primary",
        ghost: "hover:bg-accent/10 text-foreground",
        map: "bg-gradient-map backdrop-blur-sm border border-primary/20 text-primary hover:bg-primary/10",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 rounded-lg px-3",
        lg: "h-14 rounded-xl px-8",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface TravelButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof travelButtonVariants> {}

const TravelButton = forwardRef<HTMLButtonElement, TravelButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(travelButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
TravelButton.displayName = "TravelButton"

export { TravelButton, travelButtonVariants }