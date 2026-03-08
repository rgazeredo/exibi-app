// ============================================================================
// CONTENT EDITOR - MAIN COMPONENT
// ============================================================================

import { type ScheduleData } from '@/components/schedule-editor';
import { ScheduleModal } from '@/components/schedule-modal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadMediaDialog } from '@/components/upload-media-dialog';
import {
    closestCenter,
    DndContext,
    type DragEndEvent,
    DragOverlay,
    type DragStartEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { AlertTriangle, Cloud, Film, Image, LayoutList } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ContentItemsPanel } from './content-items-panel';
import { ContentSourcePanel } from './content-source-panel';
import { DurationModal } from './duration-modal';
import type {
    AvailablePlaylist,
    AvailableWidget,
    ContentEditorProps,
    ContentItem,
    ContentType,
    PlaybackMode,
    TabsConfig,
} from './types';
import {
    createContentItem,
    findScheduleConflicts,
    getItemDuration,
    getItemName,
} from './utils';

// ============================================================================
// WIDGET ICON HELPER
// ============================================================================

function getWidgetIcon(widgetType: string) {
    switch (widgetType) {
        case 'weather':
            return (
                <Cloud className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            );
        default:
            return <Film className="h-4 w-4 text-muted-foreground" />;
    }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ContentEditor({
    items: initialItems,
    groupContents = [],
    groupName,
    playlists = [],
    widgets = [],
    tabs = { media: true, playlists: true, widgets: true },
    rightPanelTitle,
    showPlaybackMode = false,
    playbackMode: initialPlaybackMode = 'sequential',
    onPlaybackModeChange,
    showDurationEditor = true,
    showGroupPlacement = false,
    canContainSubplaylists = true,
    onItemsChange,
    onSave,
    saving = false,
    saved = false,
    hasChanges = false,
    onUploadComplete,
    t,
}: ContentEditorProps) {
    // Items state (controlled by parent via onItemsChange)
    const [items, setItems] = useState<ContentItem[]>(initialItems);
    const [playbackMode, setPlaybackMode] = useState(initialPlaybackMode);

    // Modal states
    const [scheduleModalIndex, setScheduleModalIndex] = useState<number | null>(
        null,
    );
    const [durationModalIndex, setDurationModalIndex] = useState<number | null>(
        null,
    );
    const [playbackModeHelpOpen, setPlaybackModeHelpOpen] = useState(false);

    // Tab and selection state
    const [activeTab, setActiveTab] = useState<ContentType>(() => {
        if (tabs.media) return 'media';
        if (tabs.playlists) return 'playlist';
        if (tabs.widgets) return 'widget';
        return 'media';
    });
    const [selectedSourceItems, setSelectedSourceItems] = useState<Set<string>>(
        new Set(),
    );

    // Upload dialog state
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [mediaRefreshKey, setMediaRefreshKey] = useState(0);
    const [clearSelectionKey, setClearSelectionKey] = useState(0);

    // Drag and drop state
    const [isDraggingFromSource, setIsDraggingFromSource] = useState(false);
    const [activeDragData, setActiveDragData] = useState<{
        type: string;
        itemType: string;
        item: any;
        selectedIds: string[];
        selectedCount: number;
    } | null>(null);
    const dragDataRef = useRef<typeof activeDragData>(null);

    // DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    // Sync with parent state
    useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

    useEffect(() => {
        setPlaybackMode(initialPlaybackMode);
    }, [initialPlaybackMode]);

    // Detect schedule conflicts
    const scheduleConflicts = useMemo(
        () => findScheduleConflicts(items),
        [items],
    );

    // Count how many times each item is in the list
    const itemAddedCounts = useMemo(() => {
        const counts = new Map<string, number>();
        items.forEach((item) => {
            counts.set(item.content_id, (counts.get(item.content_id) || 0) + 1);
        });
        return counts;
    }, [items]);

    // Clear selection when changing tabs
    useEffect(() => {
        setSelectedSourceItems(new Set());
    }, [activeTab]);

    // Block body scroll when modal is open
    useEffect(() => {
        if (scheduleModalIndex !== null) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [scheduleModalIndex]);

    // Listen for media processing complete events via WebSocket
    useEffect(() => {
        if (!window.Echo) return;

        const channel = window.Echo.channel('admin.media');

        channel.listen(
            '.processing.complete',
            (mediaData: {
                id: string;
                title: string;
                type: string;
                thumbnail_url: string | null;
                duration_seconds: number | null;
            }) => {
                // Update any media items in the current items list
                setItems((prev) => {
                    const hasMatch = prev.some(
                        (item) =>
                            item.content_type === 'media' &&
                            item.content_id === mediaData.id,
                    );
                    if (!hasMatch) return prev;

                    const updated = prev.map((item) =>
                        item.content_type === 'media' &&
                        item.content_id === mediaData.id
                            ? {
                                  ...item,
                                  media: item.media
                                      ? {
                                            ...item.media,
                                            thumbnail_url:
                                                mediaData.thumbnail_url,
                                            duration_seconds:
                                                mediaData.duration_seconds,
                                        }
                                      : undefined,
                              }
                            : item,
                    );

                    // Also notify parent about the change
                    onItemsChange(updated);
                    return updated;
                });

                // Refresh the media list in the source panel
                setMediaRefreshKey((prev) => prev + 1);
            },
        );

        return () => {
            channel.stopListening('.processing.complete');
            window.Echo?.leave('admin.media');
        };
    }, [onItemsChange]);

    // Handle items change
    const handleItemsChange = useCallback(
        (newItems: ContentItem[]) => {
            setItems(newItems);
            onItemsChange(newItems);
        },
        [onItemsChange],
    );

    // Add items handlers
    const addPlaylistItems = useCallback(
        (playlistIds: string[]) => {
            const newItems: ContentItem[] = playlistIds
                .map((id) => playlists.find((p) => p.id === id))
                .filter(
                    (playlist): playlist is AvailablePlaylist =>
                        playlist !== undefined,
                )
                .map((playlist, idx) =>
                    createContentItem(
                        'playlist',
                        playlist.id,
                        playlist,
                        items.length + idx,
                    ),
                );

            handleItemsChange([...items, ...newItems]);
        },
        [playlists, items, handleItemsChange],
    );

    const addWidgetItems = useCallback(
        (widgetIds: string[]) => {
            const newItems: ContentItem[] = widgetIds
                .map((id) => widgets.find((w) => w.id === id))
                .filter(
                    (widget): widget is AvailableWidget => widget !== undefined,
                )
                .map((widget, idx) =>
                    createContentItem(
                        'widget',
                        widget.id,
                        widget,
                        items.length + idx,
                    ),
                );

            handleItemsChange([...items, ...newItems]);
        },
        [widgets, items, handleItemsChange],
    );

    const addMediaItems = useCallback(
        async (mediaIds: string[]) => {
            try {
                const response = await fetch(
                    `/api/media/search?ids=${mediaIds.join(',')}&per_page=100`,
                    {
                        headers: {
                            Accept: 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                        credentials: 'same-origin',
                    },
                );
                const data = await response.json();

                let mediaList: any[] = [];
                if (Array.isArray(data.data)) {
                    mediaList = data.data;
                } else if (data.data && Array.isArray(data.data.data)) {
                    mediaList = data.data.data;
                } else if (Array.isArray(data)) {
                    mediaList = data;
                }

                const newItems: ContentItem[] = mediaList.map((media, idx) =>
                    createContentItem(
                        'media',
                        media.id,
                        media,
                        items.length + idx,
                    ),
                );

                handleItemsChange([...items, ...newItems]);
            } catch (error) {
                console.error('Failed to fetch media details:', error);
            }
        },
        [items, handleItemsChange],
    );

    const handleAddItems = useCallback(
        (ids: string[], type: ContentType) => {
            if (type === 'media') {
                addMediaItems(ids);
            } else if (type === 'playlist') {
                addPlaylistItems(ids);
            } else if (type === 'widget') {
                addWidgetItems(ids);
            }
        },
        [addMediaItems, addPlaylistItems, addWidgetItems],
    );

    const removeItem = useCallback(
        (index: number) => {
            handleItemsChange(items.filter((_, i) => i !== index));
        },
        [items, handleItemsChange],
    );

    const updateDurationOverride = useCallback(
        (index: number, value: number | null) => {
            const newItems = [...items];
            newItems[index] = {
                ...newItems[index],
                duration_override: value,
            };
            handleItemsChange(newItems);
        },
        [items, handleItemsChange],
    );

    const updateSchedule = useCallback(
        (index: number, schedule: ScheduleData) => {
            const newItems = [...items];
            newItems[index] = {
                ...newItems[index],
                schedule_type: schedule.schedule_type,
                schedule_mode: schedule.schedule_mode,
                priority_order: schedule.priority_order,
                starts_at: schedule.starts_at,
                ends_at: schedule.ends_at,
                day_schedules: schedule.day_schedules,
            };
            handleItemsChange(newItems);
        },
        [items, handleItemsChange],
    );

    const handlePlaybackModeChange = useCallback(
        (mode: typeof playbackMode) => {
            setPlaybackMode(mode);
            onPlaybackModeChange?.(mode);
        },
        [onPlaybackModeChange],
    );

    const handleUploadComplete = useCallback(() => {
        setMediaRefreshKey((prev) => prev + 1);
        onUploadComplete?.();
    }, [onUploadComplete]);

    const handleReorder = useCallback(
        (newItems: ContentItem[]) => {
            handleItemsChange(newItems);
        },
        [handleItemsChange],
    );

    // Drag and drop handlers
    const handleDragStart = useCallback((event: DragStartEvent) => {
        const { active } = event;
        const data = active.data.current as
            | {
                  type?: string;
                  itemType?: string;
                  item?: any;
                  selectedIds?: string[];
                  selectedCount?: number;
              }
            | undefined;

        if (data?.type === 'media-source' && data.itemType && data.item) {
            setIsDraggingFromSource(true);

            const selectedIds = data.selectedIds || [data.item.id];
            const selectedCount = data.selectedCount || 1;

            const dragData = {
                type: data.type,
                itemType: data.itemType,
                item: data.item,
                selectedIds,
                selectedCount,
            };

            setActiveDragData(dragData);
            dragDataRef.current = dragData;
        }
    }, []);

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            const activeData = active.data.current;
            const dragData = dragDataRef.current;

            setIsDraggingFromSource(false);
            setActiveDragData(null);
            dragDataRef.current = null;

            // Handle drop from source panel
            if (activeData?.type === 'media-source' && over && dragData) {
                const itemType = dragData.itemType as ContentType;
                const selectedIds = dragData.selectedIds;

                handleAddItems(selectedIds, itemType);

                setSelectedSourceItems(new Set());
                setClearSelectionKey((prev) => prev + 1);
                return;
            }

            // Handle reordering within items
            if (over && active.id !== over.id) {
                const oldIndex = items.findIndex(
                    (item) => item.id === active.id,
                );
                const newIndex = items.findIndex((item) => item.id === over.id);

                if (oldIndex !== -1 && newIndex !== -1) {
                    handleReorder(arrayMove(items, oldIndex, newIndex));
                }
            }
        },
        [handleAddItems, handleReorder, items],
    );

    const handleDragCancel = useCallback(() => {
        setIsDraggingFromSource(false);
        setActiveDragData(null);
        dragDataRef.current = null;
    }, []);

    // Determine which tabs to show
    const tabsConfig: TabsConfig = {
        playlists: tabs.playlists ?? true,
        media: tabs.media ?? true,
        widgets: tabs.widgets ?? true,
    };

    const title = rightPanelTitle || t('playlists.playlistItems');

    return (
        <div className="flex min-h-0 w-full flex-1 flex-col rounded-lg border bg-card">
            {/* Schedule Conflicts Warning */}
            {scheduleConflicts.length > 0 && (
                <Alert variant="destructive" className="mx-4 mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{t('playlists.scheduleConflict')}</AlertTitle>
                    <AlertDescription>
                        <ul className="mt-2 list-inside list-disc space-y-1">
                            {scheduleConflicts.map((conflict, idx) => (
                                <li key={idx}>
                                    <strong>
                                        #{conflict.itemA.index + 1}{' '}
                                        {conflict.itemA.name}
                                    </strong>{' '}
                                    {t('playlists.conflictsWith')}{' '}
                                    <strong>
                                        #{conflict.itemB.index + 1}{' '}
                                        {conflict.itemB.name}
                                    </strong>
                                </li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}

            {/* 2-Panel Layout with DndContext */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                <div className="flex min-h-0 flex-1 overflow-hidden">
                    {/* Left Panel - Content Sources (50%) */}
                    <div className="flex w-[50%] shrink-0 flex-col overflow-hidden border-r">
                        {/* Header with Tabs */}
                        <div className="flex h-[53px] shrink-0 items-center justify-between border-b px-3">
                            <Tabs
                                value={activeTab}
                                onValueChange={(v) =>
                                    setActiveTab(v as ContentType)
                                }
                            >
                                <TabsList className="h-9">
                                    {tabsConfig.media && (
                                        <TabsTrigger
                                            value="media"
                                            className="gap-2 px-3 text-sm"
                                        >
                                            <Film className="h-4 w-4" />
                                            {t('playlists.mediaTab')}
                                        </TabsTrigger>
                                    )}
                                    {tabsConfig.playlists &&
                                        canContainSubplaylists && (
                                            <TabsTrigger
                                                value="playlist"
                                                className="gap-2 px-3 text-sm"
                                            >
                                                <LayoutList className="h-4 w-4" />
                                                {t('playlists.playlistsTab')}
                                            </TabsTrigger>
                                        )}
                                    {tabsConfig.widgets && (
                                        <TabsTrigger
                                            value="widget"
                                            className="gap-2 px-3 text-sm"
                                        >
                                            <Cloud className="h-4 w-4" />
                                            {t('playlists.widgetsTab')}
                                        </TabsTrigger>
                                    )}
                                </TabsList>
                            </Tabs>
                        </div>

                        {/* Content Source Panel */}
                        <div className="relative flex flex-1 overflow-hidden">
                            <div className="flex-1 overflow-hidden">
                                <ContentSourcePanel
                                    activeTab={activeTab}
                                    onTabChange={setActiveTab}
                                    tabs={tabsConfig}
                                    selectedIds={selectedSourceItems}
                                    onSelectionChange={setSelectedSourceItems}
                                    itemAddedCounts={itemAddedCounts}
                                    onAddItems={handleAddItems}
                                    playlists={playlists}
                                    widgets={widgets}
                                    media={[]}
                                    mediaRefreshKey={mediaRefreshKey}
                                    clearSelectionKey={clearSelectionKey}
                                    enableDrag={true}
                                    canContainSubplaylists={
                                        canContainSubplaylists
                                    }
                                    onUploadClick={
                                        tabsConfig.media
                                            ? () => setUploadDialogOpen(true)
                                            : undefined
                                    }
                                    t={t}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Content Items (50%) */}
                    <div className="w-[50%] shrink-0 overflow-hidden">
                        <ContentItemsPanel
                            items={items}
                            title={title}
                            onRemove={removeItem}
                            onOpenDuration={
                                showDurationEditor
                                    ? setDurationModalIndex
                                    : undefined
                            }
                            onOpenSchedule={setScheduleModalIndex}
                            showPlaybackMode={showPlaybackMode}
                            playbackMode={playbackMode}
                            onPlaybackModeChange={handlePlaybackModeChange}
                            onPlaybackModeHelpClick={() =>
                                setPlaybackModeHelpOpen(true)
                            }
                            saving={saving}
                            saved={saved}
                            hasChanges={hasChanges}
                            onSave={onSave}
                            isDropTarget={isDraggingFromSource}
                            showGroupPlacement={showGroupPlacement}
                            groupContents={groupContents}
                            groupName={groupName}
                            onReorder={handleReorder}
                            t={t}
                        />
                    </div>
                </div>

                {/* Drag Overlay */}
                <DragOverlay>
                    {activeDragData && (
                        <div className="relative rounded-lg border bg-card p-2 opacity-90 shadow-lg">
                            <div className="flex items-center gap-2">
                                {activeDragData.itemType === 'media' && (
                                    <>
                                        <div className="flex h-8 w-12 shrink-0 items-center justify-center rounded bg-muted">
                                            {activeDragData.item
                                                .thumbnail_url ? (
                                                <img
                                                    src={
                                                        activeDragData.item
                                                            .thumbnail_url
                                                    }
                                                    alt={
                                                        activeDragData.item
                                                            .title
                                                    }
                                                    className="h-full w-full rounded object-cover"
                                                />
                                            ) : activeDragData.item.type ===
                                              'video' ? (
                                                <Film className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <Image className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </div>
                                        <span className="max-w-[200px] truncate text-sm font-medium">
                                            {activeDragData.selectedCount > 1
                                                ? `${activeDragData.selectedCount} ${t('common.items')}`
                                                : activeDragData.item.title}
                                        </span>
                                    </>
                                )}
                                {activeDragData.itemType === 'playlist' && (
                                    <>
                                        <div className="flex h-8 w-12 shrink-0 items-center justify-center rounded bg-blue-100 dark:bg-blue-900/30">
                                            <LayoutList className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <span className="max-w-[200px] truncate text-sm font-medium">
                                            {activeDragData.selectedCount > 1
                                                ? `${activeDragData.selectedCount} playlists`
                                                : activeDragData.item.name}
                                        </span>
                                    </>
                                )}
                                {activeDragData.itemType === 'widget' && (
                                    <>
                                        <div className="flex h-8 w-12 shrink-0 items-center justify-center rounded bg-gradient-to-br from-cyan-100 to-purple-100 dark:from-cyan-900/30 dark:to-purple-900/30">
                                            {getWidgetIcon(
                                                activeDragData.item.widget_type,
                                            )}
                                        </div>
                                        <span className="max-w-[200px] truncate text-sm font-medium">
                                            {activeDragData.selectedCount > 1
                                                ? `${activeDragData.selectedCount} widgets`
                                                : activeDragData.item.name}
                                        </span>
                                    </>
                                )}
                            </div>
                            {activeDragData.selectedCount > 1 && (
                                <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                    {activeDragData.selectedCount}
                                </div>
                            )}
                        </div>
                    )}
                </DragOverlay>
            </DndContext>

            {/* Schedule Modal */}
            {scheduleModalIndex !== null && items[scheduleModalIndex] && (
                <ScheduleModal
                    open={true}
                    onClose={() => setScheduleModalIndex(null)}
                    onSave={(schedule) => {
                        updateSchedule(scheduleModalIndex, schedule);
                        setScheduleModalIndex(null);
                    }}
                    initialData={{
                        schedule_type:
                            items[scheduleModalIndex].schedule_type || 'always',
                        schedule_mode:
                            items[scheduleModalIndex].schedule_mode || 'always',
                        priority_order:
                            items[scheduleModalIndex].priority_order,
                        starts_at: items[scheduleModalIndex].starts_at,
                        ends_at: items[scheduleModalIndex].ends_at,
                        day_schedules: items[scheduleModalIndex].day_schedules,
                    }}
                    itemName={getItemName(items[scheduleModalIndex])}
                    itemType={items[scheduleModalIndex].content_type}
                    itemSubtype={
                        items[scheduleModalIndex].media?.type ||
                        items[scheduleModalIndex].widget?.widget_type
                    }
                    currentIndex={scheduleModalIndex}
                    otherItems={items.map((item, idx) => ({
                        index: idx,
                        name: getItemName(item),
                        schedule: {
                            schedule_type: item.schedule_type || 'always',
                            schedule_mode: item.schedule_mode || 'always',
                            priority_order: item.priority_order,
                            starts_at: item.starts_at,
                            ends_at: item.ends_at,
                            day_schedules: item.day_schedules,
                        },
                    }))}
                    t={t}
                />
            )}

            {/* Duration Modal */}
            {durationModalIndex !== null && items[durationModalIndex] && (
                <DurationModal
                    open={true}
                    onClose={() => setDurationModalIndex(null)}
                    onSave={(duration) => {
                        updateDurationOverride(durationModalIndex, duration);
                        setDurationModalIndex(null);
                    }}
                    currentDuration={
                        items[durationModalIndex].duration_override
                    }
                    originalDuration={getItemDuration(
                        items[durationModalIndex],
                    )}
                    itemName={getItemName(items[durationModalIndex])}
                    t={t}
                />
            )}

            {/* Upload Media Dialog */}
            {tabsConfig.media && (
                <UploadMediaDialog
                    open={uploadDialogOpen}
                    onOpenChange={setUploadDialogOpen}
                    folderId={null}
                    folderName={null}
                    onUploadComplete={handleUploadComplete}
                />
            )}
        </div>
    );
}

export type {
    AvailablePlaylist,
    AvailableWidget,
    ContentEditorProps,
    ContentItem,
    ContentType,
    PlaybackMode,
    TabsConfig,
};
