import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90 rounded-lg',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 rounded-lg',
        outline: 'border border-border bg-transparent shadow-sm hover:bg-secondary hover:text-foreground rounded-lg',
        secondary: 'bg-secondary text-foreground shadow-sm hover:bg-secondary/80 rounded-lg',
        ghost: 'hover:bg-secondary hover:text-foreground rounded-lg',
        link: 'text-primary underline-offset-4 hover:underline',
        hero: 'bg-primary text-primary-foreground rounded-full px-6 py-3 text-base font-medium hover:bg-primary/90 transition-colors',
        heroSecondary: 'liquid-glass text-foreground rounded-full px-6 py-3 text-base font-normal hover:bg-white/5 transition-colors',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
