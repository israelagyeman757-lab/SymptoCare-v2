import * as React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, Info, CircleCheck, CircleAlert } from 'lucide-react';

type AlertVariant = 'default' | 'destructive' | 'emergency' | 'success' | 'warning';

const variantStyles: Record<AlertVariant, { box: string; icon: React.ComponentType<{ className?: string }> }> = {
  default: { box: 'border-border bg-card text-foreground', icon: Info },
  destructive: { box: 'border-destructive/50 bg-destructive/10 text-foreground', icon: CircleAlert },
  emergency: { box: 'border-emergency bg-emergency/10 text-foreground', icon: AlertTriangle },
  success: { box: 'border-success/50 bg-success/10 text-foreground', icon: CircleCheck },
  warning: { box: 'border-warning/50 bg-warning/10 text-foreground', icon: AlertTriangle },
};

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  role?: 'alert' | 'status';
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', title, children, role, ...props }, ref) => {
    const { box, icon: Icon } = variantStyles[variant];
    return (
      <div
        ref={ref}
        role={role ?? (variant === 'emergency' || variant === 'destructive' ? 'alert' : 'status')}
        className={cn('flex w-full gap-3 rounded-lg border p-4 text-sm', box, className)}
        {...props}
      >
        <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div className="space-y-1">
          {title && <div className="font-bold leading-tight">{title}</div>}
          <div className="leading-relaxed">{children}</div>
        </div>
      </div>
    );
  }
);
Alert.displayName = 'Alert';

export { Alert };
