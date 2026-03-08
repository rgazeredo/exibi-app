// ============================================================================
// CONTENT EDITOR - CONTENT ITEMS PANEL (Right Panel)
// ============================================================================

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
    closestCenter,
    DndContext,
    type DragEndEvent,
    DragOverlay,
    type DragStartEvent,
    KeyboardSensor,
    PointerSensor,
    useDroppable,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
    Check,
    Film,
    HelpCircle,
    LayoutList,
    Loader2,
    Save,
} from 'lucide-react';
import { useState } from 'react';
import { SortableContentItem } from './sortable-content-item';
import type {
    ContentItem,
    ContentItemsPanelProps,
    PlaybackMode,
} from './types';

// ============================================================================
// DROPPABLE ZONE (for empty before/after sections)
// ============================================================================

interface DroppableZoneProps {
    id: string;
    children: React.ReactNode;
}

function DroppableZone({ id, children }: DroppableZoneProps) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                'rounded-lg border-2 border-dashed py-3 text-center transition-colors',
                isOver
                    ? 'border-primary bg-primary/10'
                    : 'border-muted-foreground/20',
            )}
        >
            {children}
        </div>
    );
}

// ============================================================================
// MAIN PANEL COMPONENT
// ============================================================================

export function ContentItemsPanel({
    items,
    title,
    onRemove,
    onOpenDuration,
    onOpenSchedule,
    showPlaybackMode = false,
    playbackMode = 'sequential',
    onPlaybackModeChange,
    onPlaybackModeHelpClick,
    saving = false,
    saved = false,
    hasChanges = false,
    onSave,
    isDropTarget = false,
    showGroupPlacement = false,
    groupContents = [],
    groupName,
    onReorder,
    t,
}: ContentItemsPanelProps & { onReorder?: (items: ContentItem[]) => void }) {
    const { setNodeRef, isOver } = useDroppable({
        id: 'content-drop-zone',
    });

    const showDropIndicator = isDropTarget || isOver;

    // ========================================================================
    // GROUP PLACEMENT MODE
    // ========================================================================

    if (showGroupPlacement && groupContents.length > 0) {
        return (
            <GroupPlacementPanel
                items={items}
                title={title}
                groupContents={groupContents}
                groupName={groupName}
                onRemove={onRemove}
                onOpenDuration={onOpenDuration}
                onOpenSchedule={onOpenSchedule}
                onReorder={onReorder}
                saving={saving}
                saved={saved}
                hasChanges={hasChanges}
                onSave={onSave}
                t={t}
            />
        );
    }

    // ========================================================================
    // SIMPLE MODE (no group placement)
    // ========================================================================

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex h-[53px] shrink-0 items-center justify-between border-b px-3">
                <div className="flex items-center gap-3">
                    <h3 className="text-sm font-medium">{title}</h3>
                </div>
                <div className="flex items-center gap-2">
                    {/* Save status */}
                    {(saving || saved) && (
                        <div className="flex items-center gap-1.5 text-xs">
                            {saving ? (
                                <>
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    <span className="text-muted-foreground">
                                        {t('playlists.saving')}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Check className="h-3 w-3 text-green-500" />
                                    <span className="text-green-500">
                                        {t('playlists.saved')}
                                    </span>
                                </>
                            )}
                        </div>
                    )}

                    {/* Playback Mode Toggle (only for playlists) */}
                    {showPlaybackMode && onPlaybackModeChange && (
                        <>
                            <Select
                                value={playbackMode}
                                onValueChange={(v) =>
                                    onPlaybackModeChange(v as PlaybackMode)
                                }
                            >
                                <SelectTrigger className="h-8 w-40 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sequential">
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-0.5">
                                                <div className="h-2 w-2 rounded-sm bg-blue-500"></div>
                                                <div className="h-2 w-2 rounded-sm bg-blue-500"></div>
                                                <div className="h-2 w-2 rounded-sm bg-green-500"></div>
                                            </div>
                                            {t('playlists.sequential')}
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="interleaved">
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-0.5">
                                                <div className="h-2 w-2 rounded-sm bg-blue-500"></div>
                                                <div className="h-2 w-2 rounded-sm bg-green-500"></div>
                                                <div className="h-2 w-2 rounded-sm bg-blue-500"></div>
                                            </div>
                                            {t('playlists.interleaved')}
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="auto">
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-0.5">
                                                <div className="h-2 w-2 rounded-sm bg-blue-500"></div>
                                                <div className="h-2 w-2 rounded-sm bg-blue-500"></div>
                                                <div className="h-2 w-2 rounded-sm bg-green-500"></div>
                                                <div className="h-2 w-2 rounded-sm bg-blue-500"></div>
                                            </div>
                                            {t('playlists.proportional')}
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="random">
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-0.5">
                                                <div className="h-2 w-2 rounded-sm bg-green-500"></div>
                                                <div className="h-2 w-2 rounded-sm bg-blue-500"></div>
                                                <div className="h-2 w-2 rounded-sm bg-purple-500"></div>
                                            </div>
                                            {t('playlists.random')}
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {onPlaybackModeHelpClick && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    onClick={onPlaybackModeHelpClick}
                                >
                                    <HelpCircle className="h-4 w-4" />
                                </Button>
                            )}
                        </>
                    )}

                    <Button
                        size="sm"
                        onClick={onSave}
                        disabled={saving || !hasChanges}
                    >
                        {saving && (
                            <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                        )}
                        <Save className="mr-1.5 h-3 w-3" />
                        {t('common.save')}
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div
                ref={setNodeRef}
                className={cn(
                    'flex-1 overflow-hidden transition-colors',
                    showDropIndicator && 'bg-primary/5',
                )}
            >
                <ScrollArea className="h-full">
                    <div className="space-y-1.5 p-2">
                        {items.length === 0 ? (
                            <div
                                className={cn(
                                    'rounded-lg border-2 border-dashed py-8 text-center text-muted-foreground transition-colors',
                                    showDropIndicator &&
                                        'border-primary bg-primary/10 text-primary',
                                )}
                            >
                                <Film className="mx-auto mb-2 h-8 w-8" />
                                <p className="text-sm">
                                    {showDropIndicator
                                        ? t('playlists.dropHere') ||
                                          'Drop here to add'
                                        : t('playlists.noItemsYet')}
                                </p>
                                <p className="mt-1 text-xs">
                                    {showDropIndicator
                                        ? ''
                                        : t('playlists.selectItemsToAdd')}
                                </p>
                            </div>
                        ) : (
                            <>
                                <SortableContext
                                    items={items.map((item) => item.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {items.map((item, index) => (
                                        <SortableContentItem
                                            key={item.id}
                                            item={item}
                                            index={index}
                                            onRemove={() => onRemove(index)}
                                            onOpenDuration={
                                                onOpenDuration
                                                    ? () =>
                                                          onOpenDuration(index)
                                                    : undefined
                                            }
                                            onOpenSchedule={() =>
                                                onOpenSchedule(index)
                                            }
                                            t={t}
                                            showDurationEditor={
                                                !!onOpenDuration
                                            }
                                        />
                                    ))}
                                </SortableContext>
                                {/* Drop indicator at the end of the list */}
                                {showDropIndicator && (
                                    <div className="rounded-lg border-2 border-dashed border-primary bg-primary/10 py-4 text-center text-sm text-primary">
                                        {t('playlists.dropHere') ||
                                            'Drop here to add'}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}

// ============================================================================
// GROUP PLACEMENT PANEL (Internal component for group placement mode)
// ============================================================================

interface GroupPlacementPanelProps {
    items: ContentItem[];
    title: string;
    groupContents: ContentItem[];
    groupName?: string;
    onRemove: (index: number) => void;
    onOpenDuration?: (index: number) => void;
    onOpenSchedule: (index: number) => void;
    onReorder?: (items: ContentItem[]) => void;
    saving?: boolean;
    saved?: boolean;
    hasChanges?: boolean;
    onSave: () => void;
    t: (key: string) => string;
}

function GroupPlacementPanel({
    items,
    title,
    groupContents,
    groupName,
    onRemove,
    onOpenDuration,
    onOpenSchedule,
    onReorder,
    saving = false,
    saved = false,
    hasChanges = false,
    onSave,
    t,
}: GroupPlacementPanelProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const [draggingFrom, setDraggingFrom] = useState<'before' | 'after' | null>(
        null,
    );
    const [activeItem, setActiveItem] = useState<ContentItem | null>(null);

    // Split items into before and after group
    const itemsBefore = items.filter(
        (item) => item.placement === 'before_group',
    );
    const itemsAfter = items.filter(
        (item) => item.placement !== 'before_group',
    );

    // Create unique IDs for sortable items
    const getItemId = (item: ContentItem) => item.id;

    const handleDragStart = (event: DragStartEvent) => {
        const activeId = event.active.id as string;
        const itemId = activeId.replace(/^(before|after)-/, '');

        const draggedItem = items.find((item) => getItemId(item) === itemId);
        setActiveItem(draggedItem || null);

        if (activeId.startsWith('before-')) {
            setDraggingFrom('before');
        } else if (activeId.startsWith('after-')) {
            setDraggingFrom('after');
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setDraggingFrom(null);
        setActiveItem(null);
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        if (overId === 'group-block') return;

        const activeItemId = activeId.replace(/^(before|after)-/, '');
        const activeIndex = items.findIndex(
            (item) => getItemId(item) === activeItemId,
        );
        if (activeIndex === -1) return;

        // Handle drop on empty zones
        if (overId === 'drop-zone-before' || overId === 'drop-zone-after') {
            const newPlacement =
                overId === 'drop-zone-before' ? 'before_group' : 'after_group';
            const newItems = [...items];
            newItems[activeIndex] = {
                ...newItems[activeIndex],
                placement: newPlacement,
            };
            onReorder?.(newItems);
            return;
        }

        const overIsBefore = overId.startsWith('before-');
        const overItemId = overId.replace(/^(before|after)-/, '');
        const newPlacement = overIsBefore ? 'before_group' : 'after_group';
        const currentPlacement = items[activeIndex].placement || 'after_group';
        const overIndex = items.findIndex(
            (item) => getItemId(item) === overItemId,
        );
        if (overIndex === -1) return;

        if (currentPlacement !== newPlacement) {
            const newItems = [...items];
            const [movedItem] = newItems.splice(activeIndex, 1);
            movedItem.placement = newPlacement;
            const insertIndex = activeIndex < overIndex ? overIndex : overIndex;
            newItems.splice(insertIndex, 0, movedItem);
            onReorder?.(newItems);
        } else {
            if (overIndex !== activeIndex) {
                onReorder?.(arrayMove(items, activeIndex, overIndex));
            }
        }
    };

    const totalItems = items.length + groupContents.length;

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex h-[53px] shrink-0 items-center justify-between border-b px-3">
                <h3 className="text-sm font-medium">
                    {title} ({totalItems})
                </h3>
                <div className="flex items-center gap-2">
                    {(saving || saved) && (
                        <div className="flex items-center gap-1.5 text-xs">
                            {saving ? (
                                <>
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    <span className="text-muted-foreground">
                                        {t('playlists.saving')}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Check className="h-3 w-3 text-green-500" />
                                    <span className="text-green-500">
                                        {t('playlists.saved')}
                                    </span>
                                </>
                            )}
                        </div>
                    )}
                    <Button
                        size="sm"
                        onClick={onSave}
                        disabled={saving || !hasChanges}
                    >
                        {saving && (
                            <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                        )}
                        <Save className="mr-1.5 h-3 w-3" />
                        {t('common.save')}
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                    <div className="space-y-1.5 p-2">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                        >
                            {/* BEFORE GROUP SECTION */}
                            <div className="mb-2">
                                <div className="mb-1.5 flex items-center gap-2">
                                    <div className="h-px flex-1 bg-border" />
                                    <span className="text-[10px] font-medium text-muted-foreground">
                                        {t('players.beforeGroup') ||
                                            'Antes do grupo'}
                                    </span>
                                    <div className="h-px flex-1 bg-border" />
                                </div>

                                {draggingFrom === 'after' && (
                                    <div className="mb-1.5">
                                        <DroppableZone id="drop-zone-before">
                                            <p className="text-[10px] text-muted-foreground">
                                                ↑{' '}
                                                {t('players.dropBeforeGroup') ||
                                                    'Solte aqui para mover antes do grupo'}
                                            </p>
                                        </DroppableZone>
                                    </div>
                                )}

                                {itemsBefore.length > 0 ? (
                                    <SortableContext
                                        items={itemsBefore.map(
                                            (item) =>
                                                `before-${getItemId(item)}`,
                                        )}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="space-y-1.5">
                                            {itemsBefore.map((item, idx) => {
                                                const originalIndex =
                                                    items.findIndex(
                                                        (i) =>
                                                            getItemId(i) ===
                                                            getItemId(item),
                                                    );
                                                return (
                                                    <SortableContentItem
                                                        key={`before-${getItemId(item)}`}
                                                        item={{
                                                            ...item,
                                                            id: `before-${getItemId(item)}`,
                                                        }}
                                                        index={idx}
                                                        onRemove={() =>
                                                            onRemove(
                                                                originalIndex,
                                                            )
                                                        }
                                                        onOpenDuration={
                                                            onOpenDuration
                                                                ? () =>
                                                                      onOpenDuration(
                                                                          originalIndex,
                                                                      )
                                                                : undefined
                                                        }
                                                        onOpenSchedule={() =>
                                                            onOpenSchedule(
                                                                originalIndex,
                                                            )
                                                        }
                                                        t={t}
                                                        showDurationEditor={
                                                            !!onOpenDuration
                                                        }
                                                    />
                                                );
                                            })}
                                        </div>
                                    </SortableContext>
                                ) : !draggingFrom ? (
                                    <div className="rounded-lg border border-dashed border-muted-foreground/20 py-2 text-center">
                                        <p className="text-[10px] text-muted-foreground">
                                            {t(
                                                'players.noContentBeforeGroup',
                                            ) ||
                                                'Nenhum conteúdo antes do grupo'}
                                        </p>
                                    </div>
                                ) : null}
                            </div>

                            {/* AFTER GROUP SECTION */}
                            <div className="mt-2">
                                <div className="mb-1.5 flex items-center gap-2">
                                    <div className="h-px flex-1 bg-border" />
                                    <span className="text-[10px] font-medium text-muted-foreground">
                                        {t('players.afterGroup') ||
                                            'Depois do grupo'}
                                    </span>
                                    <div className="h-px flex-1 bg-border" />
                                </div>

                                {draggingFrom === 'before' && (
                                    <div className="mb-1.5">
                                        <DroppableZone id="drop-zone-after">
                                            <p className="text-[10px] text-muted-foreground">
                                                ↓{' '}
                                                {t('players.dropAfterGroup') ||
                                                    'Solte aqui para mover depois do grupo'}
                                            </p>
                                        </DroppableZone>
                                    </div>
                                )}

                                {itemsAfter.length > 0 ? (
                                    <SortableContext
                                        items={itemsAfter.map(
                                            (item) =>
                                                `after-${getItemId(item)}`,
                                        )}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="space-y-1.5">
                                            {itemsAfter.map((item, idx) => {
                                                const originalIndex =
                                                    items.findIndex(
                                                        (i) =>
                                                            getItemId(i) ===
                                                            getItemId(item),
                                                    );
                                                const displayIndex =
                                                    itemsBefore.length +
                                                    groupContents.length +
                                                    idx;
                                                return (
                                                    <SortableContentItem
                                                        key={`after-${getItemId(item)}`}
                                                        item={{
                                                            ...item,
                                                            id: `after-${getItemId(item)}`,
                                                        }}
                                                        index={displayIndex}
                                                        onRemove={() =>
                                                            onRemove(
                                                                originalIndex,
                                                            )
                                                        }
                                                        onOpenDuration={
                                                            onOpenDuration
                                                                ? () =>
                                                                      onOpenDuration(
                                                                          originalIndex,
                                                                      )
                                                                : undefined
                                                        }
                                                        onOpenSchedule={() =>
                                                            onOpenSchedule(
                                                                originalIndex,
                                                            )
                                                        }
                                                        t={t}
                                                        showDurationEditor={
                                                            !!onOpenDuration
                                                        }
                                                    />
                                                );
                                            })}
                                        </div>
                                    </SortableContext>
                                ) : !draggingFrom ? (
                                    <div className="rounded-lg border border-dashed border-muted-foreground/20 py-2 text-center">
                                        <p className="text-[10px] text-muted-foreground">
                                            {t('players.noContentAfterGroup') ||
                                                'Nenhum conteúdo depois do grupo'}
                                        </p>
                                    </div>
                                ) : null}
                            </div>

                            {/* Drag Overlay */}
                            <DragOverlay>
                                {activeItem ? (
                                    <div className="rounded-lg border bg-card p-2 opacity-90 shadow-lg">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                                                ↕
                                            </div>
                                            <div className="flex h-8 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-muted">
                                                {activeItem.media
                                                    ?.thumbnail_url ? (
                                                    <img
                                                        src={
                                                            activeItem.media
                                                                .thumbnail_url
                                                        }
                                                        alt=""
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : activeItem.content_type ===
                                                  'playlist' ? (
                                                    <LayoutList className="h-4 w-4 text-blue-600" />
                                                ) : (
                                                    <Film className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </div>
                                            <p className="truncate text-xs font-medium">
                                                {activeItem.playlist?.name ||
                                                    activeItem.media?.title ||
                                                    activeItem.widget?.name ||
                                                    'Item'}
                                            </p>
                                        </div>
                                    </div>
                                ) : null}
                            </DragOverlay>
                        </DndContext>
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
