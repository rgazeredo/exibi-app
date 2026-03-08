// ============================================================================
// CONTENT EDITOR - CONTENT SOURCE PANEL (Left Panel)
// ============================================================================

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
    CheckCheck,
    ChevronDown,
    ChevronRight,
    Clock,
    Cloud,
    Film,
    GripVertical,
    Image,
    LayoutList,
    Loader2,
    Newspaper,
    Plus,
    Search,
    Ticket,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type {
    AvailableMedia,
    AvailablePlaylist,
    AvailableWidget,
    ContentSourcePanelProps,
    PlaylistNestedItem,
} from './types';
import { formatDuration } from './utils';

// ============================================================================
// WIDGET ICON HELPER
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

    const getDuration = (): number | null => {
        if (hasMedia) return item.media!.duration_seconds;
        if (hasPlaylist) return item.playlist!.total_duration || null;
        if (hasWidget) return item.widget!.duration_seconds;
        return null;
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
    const duration = getDuration();

    return (
        <div className="flex items-center gap-2 rounded bg-muted/50 px-2 py-1">
            <span className="w-4 text-[10px] text-muted-foreground">
                {index + 1}
            </span>
            <div className="flex h-4 w-6 shrink-0 items-center justify-center overflow-hidden rounded bg-muted">
                {renderThumbnail()}
            </div>
            <span className="min-w-0 flex-1 truncate text-[10px]">
                {getName()}
            </span>
            {hasMedia && item.media?.type && (
                <Badge variant="outline" className="h-3 py-0 text-[8px]">
                    {item.media.type === 'video' ? 'Video' : 'Image'}
                </Badge>
            )}
            {hasPlaylist && (
                <Badge
                    variant="outline"
                    className="h-3 border-blue-200 bg-blue-50 py-0 text-[8px] text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400"
                >
                    Playlist
                </Badge>
            )}
            {duration !== null && duration >= 0 && (
                <span className="shrink-0 text-[9px] text-muted-foreground">
                    {formatDuration(duration || 0)}
                </span>
            )}
            {regionName && (
                <Badge variant="outline" className="h-3 py-0 text-[8px]">
                    {regionName}
                </Badge>
            )}
        </div>
    );
}

interface DraggablePlaylistItemProps {
    item: AvailablePlaylist;
    isSelected: boolean;
    addedCount: number;
    onToggleSelection: () => void;
    onDoubleClick: () => void;
    t: (key: string) => string;
    enableDrag?: boolean;
    allSelectedIds?: string[];
}

function DraggablePlaylistItem({
    item,
    isSelected,
    addedCount,
    onToggleSelection,
    onDoubleClick,
    t,
    enableDrag = false,
    allSelectedIds = [],
}: DraggablePlaylistItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const selectedIds =
        isSelected && allSelectedIds.length > 1 ? allSelectedIds : [item.id];

    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({
            id: `playlist-source-${item.id}`,
            data: {
                type: 'media-source',
                itemType: 'playlist',
                item: item,
                selectedIds,
                selectedCount: selectedIds.length,
            },
            disabled: !enableDrag,
        });

    const style: React.CSSProperties = enableDrag
        ? {
              transform: CSS.Translate.toString(transform),
              opacity: isDragging ? 0 : 1,
              zIndex: isDragging ? 1000 : undefined,
          }
        : {};

    const hasItems = item.items && item.items.length > 0;

    const handleExpandClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    return (
        <div
            ref={enableDrag ? setNodeRef : undefined}
            style={style}
            className={cn(
                'rounded-lg border transition-all',
                isSelected && 'border-primary ring-2 ring-primary',
            )}
        >
            <div
                className={cn(
                    'flex items-center gap-2 p-2 hover:bg-muted/50',
                    enableDrag
                        ? 'cursor-grab active:cursor-grabbing'
                        : 'cursor-pointer',
                )}
                onClick={onToggleSelection}
                onDoubleClick={onDoubleClick}
                {...(enableDrag ? { ...attributes, ...listeners } : {})}
            >
                <Checkbox
                    checked={isSelected}
                    className="shrink-0"
                    onClick={(e) => e.stopPropagation()}
                    onCheckedChange={onToggleSelection}
                />

                {/* Expand/Collapse button */}
                {hasItems && (
                    <button
                        type="button"
                        onClick={handleExpandClick}
                        className="shrink-0 rounded p-0.5 hover:bg-muted"
                    >
                        {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                    </button>
                )}

                <div className="flex h-8 w-12 shrink-0 items-center justify-center rounded bg-blue-100 dark:bg-blue-900/30">
                    <LayoutList className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{item.name}</p>
                    <div className="flex items-center gap-1">
                        {hasItems && (
                            <Badge
                                variant="outline"
                                className="h-4 py-0 text-[10px]"
                            >
                                {item.items!.length}{' '}
                                {item.items!.length === 1
                                    ? t('common.item') || 'item'
                                    : t('common.items') || 'items'}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Duration aligned right */}
                <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDuration(item.total_duration)}
                </div>

                {addedCount > 0 && (
                    <Badge
                        variant="secondary"
                        className="shrink-0 bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        title={`${addedCount}x ${t('playlists.inPlaylist')}`}
                    >
                        {addedCount}x
                    </Badge>
                )}

                {enableDrag && (
                    <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                )}
            </div>

            {/* Expanded nested items section */}
            {isExpanded && hasItems && (
                <div className="border-t bg-muted/20 px-2 py-2">
                    <div className="max-h-32 space-y-1 overflow-y-auto">
                        {item.items!.slice(0, 10).map((nestedItem, idx) => (
                            <NestedItemDisplay
                                key={nestedItem.id}
                                item={nestedItem}
                                index={idx}
                                t={t}
                            />
                        ))}
                        {item.items!.length > 10 && (
                            <p className="py-1 text-center text-[10px] text-muted-foreground">
                                +{item.items!.length - 10}{' '}
                                {t('common.more') || 'more'}...
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

interface DraggableWidgetItemProps {
    item: AvailableWidget;
    isSelected: boolean;
    addedCount: number;
    onToggleSelection: () => void;
    onDoubleClick: () => void;
    t: (key: string) => string;
    enableDrag?: boolean;
    allSelectedIds?: string[];
}

function DraggableWidgetItem({
    item,
    isSelected,
    addedCount,
    onToggleSelection,
    onDoubleClick,
    t,
    enableDrag = false,
    allSelectedIds = [],
}: DraggableWidgetItemProps) {
    const selectedIds =
        isSelected && allSelectedIds.length > 1 ? allSelectedIds : [item.id];

    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({
            id: `widget-source-${item.id}`,
            data: {
                type: 'media-source',
                itemType: 'widget',
                item: item,
                selectedIds,
                selectedCount: selectedIds.length,
            },
            disabled: !enableDrag,
        });

    const style: React.CSSProperties = enableDrag
        ? {
              transform: CSS.Translate.toString(transform),
              opacity: isDragging ? 0 : 1,
              zIndex: isDragging ? 1000 : undefined,
          }
        : {};

    return (
        <div
            ref={enableDrag ? setNodeRef : undefined}
            style={style}
            className={cn(
                'group relative flex items-center gap-2 rounded-lg border p-2 transition-all',
                isSelected && 'border-primary ring-2 ring-primary',
                enableDrag
                    ? 'cursor-grab active:cursor-grabbing'
                    : 'cursor-pointer',
            )}
            onClick={onToggleSelection}
            onDoubleClick={onDoubleClick}
            {...(enableDrag ? { ...attributes, ...listeners } : {})}
        >
            <Checkbox
                checked={isSelected}
                className="shrink-0"
                onClick={(e) => e.stopPropagation()}
                onCheckedChange={onToggleSelection}
            />

            <div className="flex h-8 w-12 shrink-0 items-center justify-center rounded bg-gradient-to-br from-cyan-100 to-purple-100 dark:from-cyan-900/30 dark:to-purple-900/30">
                {item.thumbnail_url ? (
                    <img
                        src={item.thumbnail_url}
                        alt={item.name}
                        className="h-full w-full rounded object-cover"
                    />
                ) : (
                    getWidgetIcon(item.widget_type)
                )}
            </div>

            <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{item.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{item.widget_type_label || item.widget_type}</span>
                    <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(item.duration_seconds)}
                    </span>
                </div>
            </div>

            {addedCount > 0 && (
                <Badge
                    variant="secondary"
                    className="shrink-0 bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    title={`${addedCount}x ${t('playlists.inPlaylist')}`}
                >
                    {addedCount}x {t('playlists.inPlaylist')}
                </Badge>
            )}

            {enableDrag && (
                <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/50" />
            )}
        </div>
    );
}

interface DraggableMediaItemProps {
    item: AvailableMedia;
    isSelected: boolean;
    addedCount: number;
    onToggleSelection: () => void;
    onDoubleClick: () => void;
    t: (key: string) => string;
    enableDrag?: boolean;
    allSelectedIds?: string[];
}

function DraggableMediaItem({
    item,
    isSelected,
    addedCount,
    onToggleSelection,
    onDoubleClick,
    t,
    enableDrag = false,
    allSelectedIds = [],
}: DraggableMediaItemProps) {
    const selectedIds =
        isSelected && allSelectedIds.length > 1 ? allSelectedIds : [item.id];

    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({
            id: `media-source-${item.id}`,
            data: {
                type: 'media-source',
                itemType: 'media',
                item,
                selectedIds,
                selectedCount: selectedIds.length,
            },
            disabled: !enableDrag,
        });

    const style: React.CSSProperties = enableDrag
        ? {
              transform: CSS.Translate.toString(transform),
              opacity: isDragging ? 0 : 1,
              zIndex: isDragging ? 1000 : undefined,
          }
        : {};

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'group relative flex cursor-pointer items-center gap-2 rounded-lg border p-2 transition-all',
                isDragging && 'opacity-50',
                isSelected
                    ? 'border-primary ring-2 ring-primary'
                    : 'border-transparent hover:bg-muted/50',
            )}
            onClick={onToggleSelection}
            onDoubleClick={onDoubleClick}
            {...(enableDrag ? { ...attributes, ...listeners } : {})}
        >
            <Checkbox
                checked={isSelected}
                className="shrink-0"
                onClick={(e) => e.stopPropagation()}
                onCheckedChange={onToggleSelection}
            />

            <div className="flex h-8 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-muted">
                {item.thumbnail_url ? (
                    <img
                        src={item.thumbnail_url}
                        alt={item.title}
                        className="h-full w-full object-cover"
                    />
                ) : item.type === 'video' ? (
                    <Film className="h-4 w-4 text-muted-foreground" />
                ) : (
                    <Image className="h-4 w-4 text-muted-foreground" />
                )}
            </div>

            <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{item.title}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="py-0 text-[10px]">
                        {item.type === 'video'
                            ? t('playlists.typeVideo')
                            : t('playlists.typeImage')}
                    </Badge>
                    {item.formatted_duration && (
                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.formatted_duration}
                        </span>
                    )}
                </div>
            </div>

            {addedCount > 0 && (
                <Badge
                    variant="secondary"
                    className="shrink-0 bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    title={`${addedCount}x ${t('playlists.inPlaylist')}`}
                >
                    {addedCount}x {t('playlists.inPlaylist')}
                </Badge>
            )}

            {enableDrag && (
                <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/50" />
            )}
        </div>
    );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ContentSourcePanel({
    activeTab,
    onTabChange: _onTabChange,
    tabs,
    selectedIds,
    onSelectionChange,
    itemAddedCounts,
    onAddItems,
    playlists,
    widgets,
    media: initialMedia,
    mediaRefreshKey,
    clearSelectionKey,
    enableDrag = false,
    canContainSubplaylists: _canContainSubplaylists = true,
    onUploadClick,
    t,
}: ContentSourcePanelProps) {
    const [search, setSearch] = useState('');
    const [mediaTypeFilter, setMediaTypeFilter] = useState<string>('all');
    const [mediaTagFilter, setMediaTagFilter] = useState<string>('all');
    const [mediaList, setMediaList] = useState<AvailableMedia[]>(
        initialMedia || [],
    );
    const [mediaLoading, setMediaLoading] = useState(false);

    // Fetch media when tab changes to media or on refresh
    useEffect(() => {
        const fetchMedia = async () => {
            if (!tabs.media) return;

            setMediaLoading(true);
            try {
                const params = new URLSearchParams({ per_page: '50' });
                if (search) {
                    params.append('search', search);
                }
                if (mediaTypeFilter !== 'all') {
                    params.append('type', mediaTypeFilter);
                }
                if (mediaTagFilter === 'untagged') {
                    params.append('untagged', '1');
                } else if (mediaTagFilter !== 'all') {
                    params.append('tag', mediaTagFilter);
                }

                const response = await fetch(`/api/media/search?${params}`, {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });
                const result = await response.json();
                const mediaData = result.data?.data || result.data || result;
                setMediaList(mediaData);
            } catch (error) {
                console.error('Failed to fetch media:', error);
            } finally {
                setMediaLoading(false);
            }
        };

        fetchMedia();
    }, [tabs.media, mediaRefreshKey, mediaTypeFilter, mediaTagFilter, search]);

    // Filter media by search
    const filteredMedia = useMemo(() => {
        if (!tabs.media) return [];
        if (!search) return mediaList;
        const lower = search.toLowerCase();
        return mediaList.filter((m) => m.title.toLowerCase().includes(lower));
    }, [mediaList, search, tabs.media]);

    // Sort media: not yet added first
    const sortedMedia = useMemo(() => {
        return [...filteredMedia].sort((a, b) => {
            const aCount = itemAddedCounts.get(a.id) || 0;
            const bCount = itemAddedCounts.get(b.id) || 0;
            return aCount - bCount;
        });
    }, [filteredMedia, itemAddedCounts]);

    // Filter items by search
    const filteredPlaylists = useMemo(() => {
        if (!tabs.playlists || !playlists) return [];
        if (!search) return playlists;
        const lower = search.toLowerCase();
        return playlists.filter((p) => p.name.toLowerCase().includes(lower));
    }, [playlists, search, tabs.playlists]);

    const filteredWidgets = useMemo(() => {
        if (!tabs.widgets || !widgets) return [];
        if (!search) return widgets;
        const lower = search.toLowerCase();
        return widgets.filter(
            (w) =>
                w.name.toLowerCase().includes(lower) ||
                w.widget_type.toLowerCase().includes(lower),
        );
    }, [widgets, search, tabs.widgets]);

    // Sort items: not yet added first
    const sortedPlaylists = useMemo(() => {
        return [...filteredPlaylists].sort((a, b) => {
            const aCount = itemAddedCounts.get(a.id) || 0;
            const bCount = itemAddedCounts.get(b.id) || 0;
            return aCount - bCount;
        });
    }, [filteredPlaylists, itemAddedCounts]);

    const sortedWidgets = useMemo(() => {
        return [...filteredWidgets].sort((a, b) => {
            const aCount = itemAddedCounts.get(a.id) || 0;
            const bCount = itemAddedCounts.get(b.id) || 0;
            return aCount - bCount;
        });
    }, [filteredWidgets, itemAddedCounts]);

    // // For media tab, use MediaBrowser
    // if (activeTab === 'media' && tabs.media) {
    //     return (
    //         <MediaBrowser
    //             itemAddedCounts={itemAddedCounts}
    //             onAddItems={(ids) => onAddItems(ids, 'media')}
    //             refreshKey={mediaRefreshKey}
    //             t={t}
    //             addedLabel={t('playlists.inPlaylist')}
    //             showUploadButton={!!onUploadClick}
    //             onUploadClick={onUploadClick}
    //             enableDrag={enableDrag}
    //             clearSelectionKey={clearSelectionKey}
    //         />
    //     );
    // }

    // For other tabs, use inline rendering
    const toggleSelection = (id: string) => {
        const newSelection = new Set(selectedIds);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        onSelectionChange(newSelection);
    };

    const selectAll = () => {
        let allIds: string[] = [];
        if (activeTab === 'media') {
            allIds = sortedMedia.map((m) => m.id);
        } else if (activeTab === 'playlist') {
            allIds = filteredPlaylists.map((p) => p.id);
        } else if (activeTab === 'widget') {
            allIds = filteredWidgets.map((w) => w.id);
        }
        onSelectionChange(new Set(allIds));
    };

    const clearSelection = () => {
        onSelectionChange(new Set());
    };

    const handleAddSelected = () => {
        onAddItems(Array.from(selectedIds), activeTab);
        clearSelection();
    };

    const handleDoubleClick = (id: string) => {
        onAddItems([id], activeTab);
    };

    const hasItems =
        activeTab === 'playlist'
            ? sortedPlaylists.length > 0
            : activeTab === 'widget'
              ? sortedWidgets.length > 0
              : sortedMedia.length > 0;

    const getEmptyMessage = () => {
        if (activeTab === 'playlist')
            return t('playlists.noPlaylistsAvailable');
        if (activeTab === 'widget') return t('playlists.noWidgetsAvailable');
        return t('playlists.noMediaAvailable') || 'No media found';
    };

    const showSearch =
        activeTab === 'playlist' ||
        activeTab === 'widget' ||
        activeTab === 'media';

    return (
        <div className="flex h-full flex-col overflow-hidden">
            {/* Search and filters */}
            {showSearch && (
                <div className="flex shrink-0 items-center gap-2 border-b px-3 py-2">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder={t('common.search')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 pl-8"
                        />
                    </div>
                    {activeTab === 'media' && (
                        <>
                            <select
                                value={mediaTypeFilter}
                                onChange={(e) =>
                                    setMediaTypeFilter(e.target.value)
                                }
                                className="h-8 rounded-md border bg-background px-2 text-sm"
                            >
                                <option value="all">
                                    {t('media.allTypes')}
                                </option>
                                <option value="video">
                                    {t('media.videos')}
                                </option>
                                <option value="image">
                                    {t('media.images')}
                                </option>
                            </select>
                            <select
                                value={mediaTagFilter}
                                onChange={(e) =>
                                    setMediaTagFilter(e.target.value)
                                }
                                className="h-8 rounded-md border bg-background px-2 text-sm"
                            >
                                <option value="all">
                                    {t('media.allTags')}
                                </option>
                                <option value="untagged">
                                    {t('media.untagged')}
                                </option>
                            </select>
                        </>
                    )}
                </div>
            )}

            {/* Selection controls */}
            {hasItems && (
                <div className="flex shrink-0 items-center justify-end gap-2 border-b bg-muted/30 px-3 py-1.5">
                    <Button variant="ghost" size="sm" onClick={selectAll}>
                        <CheckCheck className="mr-1 h-4 w-4" />
                        {t('common.selectAll')}
                    </Button>

                    {selectedIds.size > 0 && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearSelection}
                            >
                                <X className="mr-1 h-4 w-4" />
                                {t('common.clearSelection') || 'Clear'}
                            </Button>

                            <Button size="sm" onClick={handleAddSelected}>
                                <Plus className="mr-1 h-4 w-4" />
                                {t('common.add')} ({selectedIds.size})
                            </Button>
                        </>
                    )}
                </div>
            )}

            {/* Content */}
            <ScrollArea className="min-h-0 flex-1">
                <div className="p-3">
                    {!hasItems ? (
                        <div className="py-12 text-center text-muted-foreground">
                            {activeTab === 'playlist' && (
                                <LayoutList className="mx-auto mb-3 h-12 w-12" />
                            )}
                            {activeTab === 'widget' && (
                                <Cloud className="mx-auto mb-3 h-12 w-12" />
                            )}
                            {activeTab === 'media' && mediaLoading && (
                                <Loader2 className="mx-auto mb-3 h-12 w-12 animate-spin" />
                            )}
                            {activeTab === 'media' && !mediaLoading && (
                                <Film className="mx-auto mb-3 h-12 w-12" />
                            )}
                            <p>{getEmptyMessage()}</p>
                        </div>
                    ) : activeTab === 'playlist' ? (
                        <div className="space-y-2">
                            {sortedPlaylists.map((item) => (
                                <DraggablePlaylistItem
                                    key={item.id}
                                    item={item}
                                    isSelected={selectedIds.has(item.id)}
                                    addedCount={
                                        itemAddedCounts.get(item.id) || 0
                                    }
                                    onToggleSelection={() =>
                                        toggleSelection(item.id)
                                    }
                                    onDoubleClick={() =>
                                        handleDoubleClick(item.id)
                                    }
                                    t={t}
                                    enableDrag={enableDrag}
                                    allSelectedIds={Array.from(selectedIds)}
                                />
                            ))}
                        </div>
                    ) : activeTab === 'media' ? (
                        <div className="space-y-2">
                            {sortedMedia.map((item) => (
                                <DraggableMediaItem
                                    key={item.id}
                                    item={item}
                                    isSelected={selectedIds.has(item.id)}
                                    addedCount={
                                        itemAddedCounts.get(item.id) || 0
                                    }
                                    onToggleSelection={() =>
                                        toggleSelection(item.id)
                                    }
                                    onDoubleClick={() =>
                                        handleDoubleClick(item.id)
                                    }
                                    t={t}
                                    enableDrag={enableDrag}
                                    allSelectedIds={Array.from(selectedIds)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {sortedWidgets.map((item) => (
                                <DraggableWidgetItem
                                    key={item.id}
                                    item={item}
                                    isSelected={selectedIds.has(item.id)}
                                    addedCount={
                                        itemAddedCounts.get(item.id) || 0
                                    }
                                    onToggleSelection={() =>
                                        toggleSelection(item.id)
                                    }
                                    onDoubleClick={() =>
                                        handleDoubleClick(item.id)
                                    }
                                    t={t}
                                    enableDrag={enableDrag}
                                    allSelectedIds={Array.from(selectedIds)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
