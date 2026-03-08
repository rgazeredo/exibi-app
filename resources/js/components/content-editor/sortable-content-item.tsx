// ============================================================================
// CONTENT EDITOR - SORTABLE CONTENT ITEM
// ============================================================================

import {
    getScheduleSummary,
    type ScheduleData,
} from '@/components/schedule-editor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    Calendar,
    ChevronDown,
    ChevronRight,
    Clock,
    Cloud,
    Film,
    GripVertical,
    Image,
    LayoutList,
    Newspaper,
    Star,
    Ticket,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import type { ContentItem, PlaylistNestedItem } from './types';
import { formatDuration, getItemDuration, getItemName } from './utils';

// ============================================================================
// WIDGET HELPERS
// ============================================================================

function getWidgetIcon(widgetType: string) {
    switch (widgetType) {
        case 'weather':
            return (
                <Cloud className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            );
        case 'lottery':
            return (
                <Ticket className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            );
        case 'news':
            return (
                <Newspaper className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            );
        default:
            return <Film className="h-4 w-4 text-muted-foreground" />;
    }
}

function getWidgetTypeLabel(
    widgetType: string,
    t: (key: string) => string,
): string {
    const key = `widgets.types.${widgetType}`;
    const translated = t(key);
    return translated !== key ? translated : widgetType;
}

// ============================================================================
// NESTED ITEM DISPLAY (for accordion visualization)
// ============================================================================

interface NestedItemDisplayProps {
    item: PlaylistNestedItem;
    index: number;
    t: (key: string) => string;
}

function NestedItemDisplay({ item, index, t }: NestedItemDisplayProps) {
    const hasMedia = 'media' in item && item.media;
    const hasPlaylist = 'playlist' in item && item.playlist;
    const hasWidget = 'widget' in item && item.widget;

    const getName = () => {
        if (hasMedia) return item.media!.title;
        if (hasPlaylist) return item.playlist!.name;
        if (hasWidget) return item.widget!.name;
        return 'Unknown item';
    };

    const renderThumbnail = () => {
        if (hasMedia && item.media?.thumbnail_url) {
            return (
                <img
                    src={item.media.thumbnail_url}
                    alt=""
                    className="h-full w-full object-cover"
                />
            );
        }
        if (hasMedia && item.media?.type === 'video') {
            return <Film className="h-3 w-3 text-muted-foreground" />;
        }
        if (hasMedia && item.media?.type === 'image') {
            return <Image className="h-3 w-3 text-muted-foreground" />;
        }
        if (hasPlaylist) {
            return (
                <LayoutList className="h-3 w-3 text-blue-600 dark:text-blue-400" />
            );
        }
        if (hasWidget) {
            return (
                <Cloud className="h-3 w-3 text-cyan-600 dark:text-cyan-400" />
            );
        }
        return <Film className="h-3 w-3 text-muted-foreground" />;
    };

    // Get region name for campaign items
    const regionName =
        'region_name' in item ? (item.region_name as string) : null;

    return (
        <div className="flex items-center gap-2 rounded bg-muted/50 px-2 py-1.5">
            <span className="w-4 text-[10px] text-muted-foreground">
                {index + 1}
            </span>
            <div className="flex h-5 w-8 shrink-0 items-center justify-center overflow-hidden rounded bg-muted">
                {renderThumbnail()}
            </div>
            <span className="min-w-0 flex-1 truncate text-[11px]">
                {getName()}
            </span>
            {regionName && (
                <Badge
                    variant="outline"
                    className="ml-auto h-3.5 py-0 text-[9px]"
                >
                    {regionName}
                </Badge>
            )}
            {hasMedia && item.media?.type && (
                <Badge variant="outline" className="h-3.5 py-0 text-[9px]">
                    {item.media.type === 'video'
                        ? t('media.video')
                        : t('media.image')}
                </Badge>
            )}
            {hasMedia && (item.media?.duration_seconds || 0) > 0 && (
                <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDuration(item.media?.duration_seconds || 0)}
                </span>
            )}
            {hasPlaylist && (
                <Badge
                    variant="secondary"
                    className="h-3.5 bg-blue-100 py-0 text-[9px] text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                >
                    Playlist
                </Badge>
            )}
            {hasPlaylist && (item.playlist?.total_duration || 0) > 0 && (
                <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDuration(item.playlist?.total_duration || 0)}
                </span>
            )}
            {hasWidget && (item.widget?.duration_seconds || 0) > 0 && (
                <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDuration(item.widget?.duration_seconds || 0)}
                </span>
            )}
        </div>
    );
}

// ============================================================================
// COMPONENT
// ============================================================================
// COMPONENT
// ============================================================================

interface SortableContentItemProps {
    item: ContentItem;
    index: number;
    onRemove: () => void;
    onOpenDuration?: () => void;
    onOpenSchedule: () => void;
    t: (key: string) => string;
    showDurationEditor?: boolean;
}

export function SortableContentItem({
    item,
    index,
    onRemove,
    onOpenDuration,
    onOpenSchedule,
    t,
    showDurationEditor = true,
}: SortableContentItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const isPlaylist = item.content_type === 'playlist';
    const isMedia = item.content_type === 'media';
    const isWidget = item.content_type === 'widget';
    const hasSchedule = item.schedule_type !== 'always';
    const isPriority =
        item.schedule_mode === 'priority_once' ||
        item.schedule_mode === 'priority_loop';

    // Get nested items for playlists
    const nestedItems = isPlaylist ? item.playlist?.items : null;
    const isExpandable = isPlaylist && nestedItems && nestedItems.length > 0;

    const scheduleData: ScheduleData = {
        schedule_type: item.schedule_type || 'always',
        schedule_mode: item.schedule_mode || 'always',
        priority_order: item.priority_order,
        starts_at: item.starts_at,
        ends_at: item.ends_at,
        day_schedules: item.day_schedules,
    };

    const scheduleSummary = getScheduleSummary(scheduleData, t);
    const itemName = getItemName(item);

    // Get duration display
    const getDurationDisplay = () => {
        if (item.duration_override) {
            return formatDuration(item.duration_override);
        }
        const originalDuration = getItemDuration(item);
        if (originalDuration) {
            return `${formatDuration(originalDuration)} (${t('playlists.auto')})`;
        }
        // Images default to 10 seconds if no duration specified
        if (isMedia && item.media?.type === 'image') {
            return `${formatDuration(10)} (${t('playlists.auto')})`;
        }
        return t('playlists.auto');
    };

    // Get thumbnail
    const renderThumbnail = () => {
        if (isPlaylist) {
            return (
                <LayoutList className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            );
        }
        if (isMedia && item.media) {
            if (item.media.thumbnail_url) {
                return (
                    <img
                        src={item.media.thumbnail_url}
                        alt={item.media.title}
                        className="h-full w-full object-cover"
                    />
                );
            }
            return item.media.type === 'video' ? (
                <Film className="h-4 w-4 text-muted-foreground" />
            ) : (
                <Image className="h-4 w-4 text-muted-foreground" />
            );
        }
        if (isWidget && item.widget) {
            if (item.widget.thumbnail_url) {
                return (
                    <img
                        src={item.widget.thumbnail_url}
                        alt={item.widget.name}
                        className="h-full w-full object-cover"
                    />
                );
            }
            return getWidgetIcon(item.widget.widget_type);
        }
        return <Film className="h-4 w-4 text-muted-foreground" />;
    };

    // Playlists don't have editable duration (calculated from content)
    const canEditDuration = !isPlaylist;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'rounded-lg border bg-card text-sm',
                isDragging && 'border-dashed border-primary opacity-40',
                isPlaylist &&
                    'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20',
            )}
        >
            <div className="flex items-center gap-2 p-2">
                <button
                    type="button"
                    className="shrink-0 cursor-grab touch-none rounded p-0.5 hover:bg-muted active:cursor-grabbing"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                </button>

                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {index + 1}
                </div>

                {/* Expand/Collapse button for campaigns and playlists */}
                {isExpandable && (
                    <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="shrink-0 rounded p-0.5 hover:bg-muted"
                    >
                        {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                    </button>
                )}

                {/* Thumbnail */}
                <div className="flex h-8 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-muted">
                    {renderThumbnail()}
                </div>

                {/* Title and Type */}
                <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{itemName}</p>
                    <div className="flex items-center gap-1">
                        {isMedia && item.media && (
                            <>
                                <Badge
                                    variant="outline"
                                    className="h-4 py-0 text-[10px]"
                                >
                                    {item.media.type === 'video'
                                        ? t('media.video')
                                        : t('media.image')}
                                </Badge>
                                {item.media.duration_seconds !== null &&
                                    item.media.duration_seconds >= 0 && (
                                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            {formatDuration(
                                                item.media.duration_seconds ||
                                                    0,
                                            )}
                                        </span>
                                    )}
                            </>
                        )}
                        {isWidget && item.widget && (
                            <Badge
                                variant="secondary"
                                className="h-4 bg-gradient-to-r from-cyan-100 to-purple-100 py-0 text-[10px] text-cyan-700 dark:from-cyan-900/50 dark:to-purple-900/50 dark:text-cyan-300"
                            >
                                {getWidgetTypeLabel(item.widget.widget_type, t)}
                            </Badge>
                        )}
                        {/* Item count badge for expandable items */}
                        {isExpandable && nestedItems && (
                            <Badge
                                variant="outline"
                                className="h-4 py-0 text-[10px]"
                            >
                                {nestedItems.length}{' '}
                                {nestedItems.length === 1
                                    ? t('common.item') || 'item'
                                    : t('common.items') || 'items'}
                            </Badge>
                        )}
                        {hasSchedule && (
                            <Badge
                                variant={isPriority ? 'default' : 'secondary'}
                                className={cn(
                                    'h-4 py-0 text-[10px]',
                                    isPriority &&
                                        'bg-amber-500 hover:bg-amber-600',
                                )}
                            >
                                {isPriority ? (
                                    <Star className="h-2 w-2" />
                                ) : (
                                    <Calendar className="h-2 w-2" />
                                )}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Duration display */}
                {showDurationEditor && (
                    <div className="flex shrink-0 items-center gap-1">
                        <span
                            className={cn(
                                'text-xs',
                                item.duration_override
                                    ? 'text-foreground'
                                    : 'text-muted-foreground',
                            )}
                        >
                            {getDurationDisplay()}
                        </span>
                        {canEditDuration && onOpenDuration && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 shrink-0"
                                onClick={onOpenDuration}
                                title={t('playlists.duration')}
                            >
                                <Clock
                                    className={cn(
                                        'h-3 w-3',
                                        item.duration_override &&
                                            'text-primary',
                                    )}
                                />
                            </Button>
                        )}
                    </div>
                )}

                {/* Actions */}
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={onOpenSchedule}
                    title={t('playlists.scheduling')}
                >
                    <Calendar
                        className={cn('h-3 w-3', hasSchedule && 'text-primary')}
                    />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={onRemove}
                >
                    <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
            </div>

            {/* Expanded nested items section */}
            {isExpanded && nestedItems && nestedItems.length > 0 && (
                <div className="border-t px-2 py-2">
                    <div className="max-h-48 space-y-1 overflow-y-auto">
                        {nestedItems.slice(0, 15).map((nestedItem, idx) => (
                            <NestedItemDisplay
                                key={nestedItem.id}
                                item={nestedItem}
                                index={idx}
                                t={t}
                            />
                        ))}
                        {nestedItems.length > 15 && (
                            <p className="py-1 text-center text-[10px] text-muted-foreground">
                                +{nestedItems.length - 15}{' '}
                                {t('common.more') || 'more'}...
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Schedule Summary */}
            {scheduleSummary && (
                <button
                    type="button"
                    onClick={onOpenSchedule}
                    className="w-full border-t bg-muted/30 px-2 py-1 text-left transition-colors hover:bg-muted/50"
                >
                    <p className="flex items-center gap-1 truncate text-[10px] text-muted-foreground">
                        <Calendar className="h-2.5 w-2.5 shrink-0" />
                        {scheduleSummary}
                    </p>
                </button>
            )}
        </div>
    );
}
