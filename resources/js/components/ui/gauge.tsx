import { cn } from '@/lib/utils';

interface GaugeProps {
    value: number;
    max?: number;
    size?: 'sm' | 'md' | 'lg';
    colorClass?: string;
    label?: string;
    sublabel?: string;
    showValue?: boolean;
    unit?: string;
    icon?: React.ReactNode;
    className?: string;
}

export function Gauge({
    value,
    max = 100,
    size = 'md',
    colorClass = 'text-primary',
    label,
    sublabel,
    showValue = true,
    unit = '%',
    icon,
    className,
}: GaugeProps) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    // Dimensions based on size
    const dimensions = {
        sm: { size: 80, strokeWidth: 8, fontSize: 18, unitSize: 12 },
        md: { size: 100, strokeWidth: 10, fontSize: 22, unitSize: 14 },
        lg: { size: 120, strokeWidth: 12, fontSize: 26, unitSize: 16 },
    };

    const { size: svgSize, strokeWidth, fontSize, unitSize } = dimensions[size];

    // Circle calculations
    const radius = (svgSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className={cn('flex flex-col items-center gap-2', className)}>
            <div className="relative">
                <svg
                    width={svgSize}
                    height={svgSize}
                    className="transform -rotate-90"
                >
                    {/* Background circle */}
                    <circle
                        cx={svgSize / 2}
                        cy={svgSize / 2}
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        className="text-muted/20"
                    />
                    {/* Progress circle */}
                    <circle
                        cx={svgSize / 2}
                        cy={svgSize / 2}
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className={cn('transition-all duration-500 ease-out', colorClass)}
                    />
                </svg>
                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {icon && <div className="mb-0.5 text-muted-foreground">{icon}</div>}
                    {showValue && (
                        <div className="flex items-baseline">
                            <span className="font-bold text-foreground" style={{ fontSize }}>
                                {Math.round(value)}
                            </span>
                            <span className="text-muted-foreground font-medium" style={{ fontSize: unitSize }}>
                                {unit}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            {/* Labels */}
            {(label || sublabel) && (
                <div className="flex flex-col items-center">
                    {label && (
                        <span className="text-sm font-medium text-foreground">{label}</span>
                    )}
                    {sublabel && (
                        <span className="text-xs text-muted-foreground">{sublabel}</span>
                    )}
                </div>
            )}
        </div>
    );
}

// Compact stat card for alternative display
interface StatCardProps {
    value: number | string;
    label: string;
    sublabel?: string;
    icon: React.ReactNode;
    colorClass?: string;
    percentage?: number;
    className?: string;
}

// Map text colors to background colors for Tailwind JIT
const colorToBg: Record<string, string> = {
    'text-primary': 'bg-primary',
    'text-muted': 'bg-muted',
    'text-red-500': 'bg-red-500',
    'text-amber-500': 'bg-amber-500',
    'text-green-500': 'bg-green-500',
    'text-blue-500': 'bg-blue-500',
    'text-purple-500': 'bg-purple-500',
    'text-orange-500': 'bg-orange-500',
};

const colorToBgLight: Record<string, string> = {
    'text-primary': 'bg-primary/10',
    'text-muted': 'bg-muted/10',
    'text-red-500': 'bg-red-500/10',
    'text-amber-500': 'bg-amber-500/10',
    'text-green-500': 'bg-green-500/10',
    'text-blue-500': 'bg-blue-500/10',
    'text-purple-500': 'bg-purple-500/10',
    'text-orange-500': 'bg-orange-500/10',
};

export function StatCard({
    value,
    label,
    sublabel,
    icon,
    colorClass = 'text-primary',
    percentage,
    className,
}: StatCardProps) {
    const bgClass = colorToBg[colorClass] || 'bg-primary';
    const bgLightClass = colorToBgLight[colorClass] || 'bg-primary/10';

    return (
        <div className={cn(
            'relative overflow-hidden rounded-xl border bg-card p-4 transition-all hover:shadow-md',
            className
        )}>
            {/* Background gradient based on percentage */}
            {percentage !== undefined && (
                <div
                    className={cn('absolute inset-0 opacity-10', bgClass)}
                    style={{
                        clipPath: `inset(${100 - percentage}% 0 0 0)`,
                    }}
                />
            )}
            <div className="relative flex items-center gap-3">
                <div className={cn('rounded-lg p-2', bgLightClass)}>
                    <div className={colorClass}>{icon}</div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-foreground">{value}</span>
                        {sublabel && (
                            <span className="text-xs text-muted-foreground truncate">{sublabel}</span>
                        )}
                    </div>
                    <span className="text-xs text-muted-foreground">{label}</span>
                </div>
            </div>
            {/* Progress bar at bottom */}
            {percentage !== undefined && (
                <div className="mt-3 h-1.5 w-full rounded-full bg-muted/30 overflow-hidden">
                    <div
                        className={cn('h-full rounded-full transition-all duration-500', bgClass)}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            )}
        </div>
    );
}
