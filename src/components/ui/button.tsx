import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-ring) focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /* Gold CTA — primary action across all pages */
        default:
          "bg-[var(--color-cta)] text-[var(--color-on-cta)] shadow-md shadow-[var(--color-cta)]/25 hover:brightness-110 hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--color-cta)]/35 active:scale-[0.98]",
        accent:
          "bg-[var(--color-cta)] text-[var(--color-on-cta)] shadow-md shadow-[var(--color-cta)]/25 hover:brightness-110 hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--color-cta)]/35 active:scale-[0.98]",
        modern:
          "bg-[var(--color-cta)] text-[var(--color-on-cta)] shadow-md shadow-[var(--color-cta)]/25 hover:brightness-110 hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--color-cta)]/35 active:scale-[0.98]",
        /* Burgundy outline — secondary action */
        outline:
          "border border-[var(--color-button)] bg-transparent text-[var(--color-button)] hover:bg-[var(--color-button)]/10 dark:border-[var(--color-secondary)] dark:text-[var(--color-secondary)] dark:hover:bg-[var(--color-secondary)]/15",
        ghost:
          "hover:bg-[var(--color-muted)] text-[var(--color-foreground)]",
        link:
          "text-[var(--color-accent)] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-11 px-4 text-xs",
        lg: "h-13 px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    // For asChild (links), we don't show loading state
    // For regular buttons, we show loading state
    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          disabled={disabled || loading}
          {...props}
        >
          {children}
        </Comp>
      );
    }
    
    // Get context-aware loading text
    const getLoadingText = () => {
      const childString = React.Children.toArray(children).join(' ').toLowerCase();
      if (childString.includes('send')) return 'Sending...';
      if (childString.includes('submit')) return 'Submitting...';
      if (childString.includes('book')) return 'Booking...';
      if (childString.includes('apply')) return 'Applying...';
      if (childString.includes('save')) return 'Saving...';
      if (childString.includes('delete')) return 'Deleting...';
      if (childString.includes('continue')) return 'Processing...';
      return 'Loading...';
    };
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {getLoadingText()}
          </span>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
