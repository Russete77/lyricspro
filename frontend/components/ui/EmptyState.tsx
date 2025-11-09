import { HTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col items-center justify-center text-center p-8', className)}
        {...props}
      >
        {icon && (
          <div className="text-white/30 mb-4">
            {icon}
          </div>
        )}
        <h3 className="text-xl font-semibold text-white mb-2">
          {title}
        </h3>
        <p className="text-white/60 mb-6 max-w-md">
          {description}
        </p>
        {action && <div>{action}</div>}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';

export { EmptyState };
