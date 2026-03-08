import { cn } from '@/lib/utils';
import type { Layout, LayoutRegion } from '@/types';

interface LayoutPreviewProps {
    layout: Layout;
    selectedRegionId?: string | null;
    regionContent?: Record<string, React.ReactNode>;
    onRegionClick?: (region: LayoutRegion) => void;
    className?: string;
    aspectRatio?: '16:9' | '4:3' | '9:16';
}

export function LayoutPreview({
    layout,
    selectedRegionId,
    regionContent,
    onRegionClick,
    className,
    aspectRatio = '16:9',
}: LayoutPreviewProps) {
    const aspectRatioClass = {
        '16:9': 'aspect-video',
        '4:3': 'aspect-[4/3]',
        '9:16': 'aspect-[9/16]',
    }[aspectRatio];

    return (
        <div
            className={cn(
                'relative w-full overflow-hidden rounded-lg border bg-muted/30',
                aspectRatioClass,
                className,
            )}
        >
            {layout.regions.map((region) => {
                const isSelected = selectedRegionId === region.id;
                const hasContent = regionContent?.[region.id];

                return (
                    <div
                        key={region.id}
                        onClick={() => onRegionClick?.(region)}
                        className={cn(
                            'absolute flex items-center justify-center border-2 transition-all',
                            'bg-primary/10 hover:bg-primary/20',
                            isSelected ? 'border-primary ring-2 ring-primary/50' : 'border-border',
                            onRegionClick && 'cursor-pointer',
                            hasContent && 'bg-primary/20',
                        )}
                        style={{
                            left: `${region.x_percent}%`,
                            top: `${region.y_percent}%`,
                            width: `${region.width_percent}%`,
                            height: `${region.height_percent}%`,
                        }}
                    >
                        {regionContent?.[region.id] ?? (
                            <div className="flex flex-col items-center gap-1 text-center">
                                <span className="text-xs font-medium text-muted-foreground">
                                    {formatRegionName(region.name)}
                                </span>
                                <span className="text-[10px] text-muted-foreground/70">
                                    {Math.round(region.width_percent)}% x {Math.round(region.height_percent)}%
                                </span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function formatRegionName(name: string): string {
    return name
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface LayoutPreviewCompactProps {
    layout: Layout;
    className?: string;
}

export function LayoutPreviewCompact({ layout, className }: LayoutPreviewCompactProps) {
    return (
        <div
            className={cn(
                'relative aspect-video w-full overflow-hidden rounded border bg-muted/30',
                className,
            )}
        >
            {layout.regions.map((region) => (
                <div
                    key={region.id}
                    className="absolute border border-border bg-muted/50"
                    style={{
                        left: `${region.x_percent}%`,
                        top: `${region.y_percent}%`,
                        width: `${region.width_percent}%`,
                        height: `${region.height_percent}%`,
                    }}
                />
            ))}
        </div>
    );
}
