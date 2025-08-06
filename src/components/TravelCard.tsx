import { forwardRef } from "react"
import { cn } from "@/lib/utils"

const TravelCard = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow-card hover:shadow-travel transition-shadow duration-300",
      className
    )}
    {...props}
  />
))
TravelCard.displayName = "TravelCard"

const TravelCardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
TravelCardHeader.displayName = "TravelCardHeader"

const TravelCardTitle = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
TravelCardTitle.displayName = "TravelCardTitle"

const TravelCardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
TravelCardDescription.displayName = "TravelCardDescription"

const TravelCardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
TravelCardContent.displayName = "TravelCardContent"

const TravelCardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
TravelCardFooter.displayName = "TravelCardFooter"

export { 
  TravelCard, 
  TravelCardHeader, 
  TravelCardFooter, 
  TravelCardTitle, 
  TravelCardDescription, 
  TravelCardContent 
}