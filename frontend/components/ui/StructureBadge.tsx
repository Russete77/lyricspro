import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type StructureType = 'verso' | 'refrao' | 'ponte' | 'intro';

const structureColors: Record<StructureType, string> = {
  verso: 'bg-music-verso/10 text-music-verso border border-music-verso/20',
  refrao: 'bg-music-refrao/10 text-music-refrao border border-music-refrao/20',
  ponte: 'bg-music-ponte/10 text-music-ponte border border-music-ponte/20',
  intro: 'bg-music-intro/10 text-music-intro border border-music-intro/20',
};

export interface StructureBadgeProps extends HTMLAttributes<HTMLDivElement> {
  type: StructureType;
}

const StructureBadge = forwardRef<HTMLDivElement, StructureBadgeProps>(
  ({ className, type, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold uppercase tracking-wide',
          structureColors[type],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

StructureBadge.displayName = 'StructureBadge';

export { StructureBadge };
