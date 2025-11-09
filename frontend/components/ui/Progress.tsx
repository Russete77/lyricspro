import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  max?: number;
  showPercentage?: boolean;
  gradient?: boolean;
  indeterminate?: boolean;
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, showPercentage, gradient, indeterminate, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        <div className="flex items-center justify-between mb-1">
          {showPercentage && (
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 overflow-hidden">
          {indeterminate ? (
            <div className="h-full w-1/3 bg-brand-primary rounded-full animate-progress-indeterminate" />
          ) : (
            <div
              className={cn(
                'h-full rounded-full transition-all duration-300',
                gradient ? 'bg-gradient-secondary' : 'bg-brand-primary'
              )}
              style={{ width: `${percentage}%` }}
            />
          )}
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress };
