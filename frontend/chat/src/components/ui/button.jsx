import { forwardRef } from "react";
import { cn } from "../../lib/utils";

const Button = forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50";
    
    const variants = {
      default: "bg-primary-600 text-white shadow hover:bg-primary-700",
      destructive: "bg-red-500 text-white shadow-sm hover:bg-red-600",
      outline: "border border-input bg-transparent shadow-sm hover:bg-primary-100 hover:text-primary-600",
      secondary: "bg-secondary-200 text-secondary-900 shadow-sm hover:bg-secondary-300",
      ghost: "hover:bg-primary-100 hover:text-primary-600",
      link: "text-primary-600 underline-offset-4 hover:underline",
    };

    const sizes = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-10 rounded-md px-8",
      icon: "h-9 w-9",
    };

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant || "default"],
          sizes[size || "default"],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button }; 