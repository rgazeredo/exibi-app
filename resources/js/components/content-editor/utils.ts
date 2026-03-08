// ============================================================================
// CONTENT EDITOR - UTILS
// ============================================================================

import type { ContentItem, ContentType } from './types';

/**
 * Format seconds to HH:MM:SS or MM:SS
 */
export function formatDuration(seconds: number): string {
    if (!seconds || seconds <= 0) return '00:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Convert seconds to time string (HH:MM:SS)
 */
export function secondsToTimeString(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Convert time string (HH:MM:SS) to seconds
 */
export function timeStringToSeconds(timeString: string): number {
    const parts = timeString.split(':').map(Number);
    if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    }
    return parts[0] || 0;
}

/**
 * Format time input to HH:MM:SS
 */
export function formatTimeInput(value: string): string {
    const digits = value.replace(/\D/g, '');
    const limited = digits.slice(0, 6);

    if (limited.length <= 2) {
        return limited;
    }
    if (limited.length <= 4) {
        return `${limited.slice(0, 2)}:${limited.slice(2)}`;
    }
    return `${limited.slice(0, 2)}:${limited.slice(2, 4)}:${limited.slice(4)}`;
}

/**
 * Get the display name for a content item
 */
export function getItemName(item: ContentItem): string {
    switch (item.content_type) {
        case 'playlist':
            return item.playlist?.name || '';
        case 'media':
            return item.media?.title || '';
        case 'widget':
            return item.widget?.name || '';
        default:
            return '';
    }
}

/**
 * Get the original duration of a content item (in seconds)
 */
export function getItemDuration(item: ContentItem): number {
    switch (item.content_type) {
        case 'playlist':
            return item.playlist?.total_duration || 0;
        case 'media':
            return (
                item.media?.duration_seconds ||
                (item.media?.type === 'image' ? 10 : 0)
            );
        case 'widget':
            return item.widget?.duration_seconds || 0;
        default:
            return 0;
    }
}

/**
 * Get the effective duration (override or original)
 */
export function getEffectiveDuration(item: ContentItem): number {
    if (item.duration_override) {
        return item.duration_override;
    }
    return getItemDuration(item);
}

/**
 * Calculate total duration of all items
 */
export function calculateTotalDuration(items: ContentItem[]): number {
    return items.reduce((total, item) => total + getEffectiveDuration(item), 0);
}

/**
 * Find schedule conflicts between items with priority scheduling
 */
export function findScheduleConflicts(items: ContentItem[]): Array<{
    itemA: { index: number; name: string };
    itemB: { index: number; name: string };
}> {
    const conflicts: Array<{
        itemA: { index: number; name: string };
        itemB: { index: number; name: string };
    }> = [];

    const priorityItems = items
        .map((item, index) => ({ item, index }))
        .filter(
            ({ item }) =>
                (item.schedule_mode === 'priority_once' ||
                    item.schedule_mode === 'priority_loop') &&
                item.schedule_type === 'date_range' &&
                item.starts_at &&
                item.ends_at,
        );

    for (let i = 0; i < priorityItems.length; i++) {
        for (let j = i + 1; j < priorityItems.length; j++) {
            const a = priorityItems[i];
            const b = priorityItems[j];

            const aStart = new Date(a.item.starts_at!);
            const aEnd = new Date(a.item.ends_at!);
            const bStart = new Date(b.item.starts_at!);
            const bEnd = new Date(b.item.ends_at!);

            // Check for overlap
            if (aStart < bEnd && aEnd > bStart) {
                conflicts.push({
                    itemA: { index: a.index, name: getItemName(a.item) },
                    itemB: { index: b.index, name: getItemName(b.item) },
                });
            }
        }
    }

    return conflicts;
}

/**
 * Create a new content item from source
 */
export function createContentItem(
    type: ContentType,
    sourceId: string,
    sourceData: any,
    position: number,
): ContentItem {
    const baseItem: ContentItem = {
        id: `temp-${Date.now()}-${position}-${Math.random()}`,
        content_type: type,
        content_id: sourceId,
        position,
        is_active: true,
        duration_override: null,
        schedule_type: 'always',
        schedule_mode: undefined,
        priority_order: null,
        starts_at: null,
        ends_at: null,
        day_schedules: null,
    };

    switch (type) {
        case 'playlist':
            return {
                ...baseItem,
                playlist: {
                    id: sourceData.id,
                    name: sourceData.name,
                    media_count: sourceData.media_count,
                    total_duration: sourceData.total_duration,
                    items: sourceData.items || null,
                },
            };
        case 'media':
            return {
                ...baseItem,
                media: {
                    id: sourceData.id,
                    title: sourceData.title,
                    type: sourceData.type,
                    thumbnail_url: sourceData.thumbnail_url,
                    duration_seconds: sourceData.duration_seconds,
                },
            };
        case 'widget':
            return {
                ...baseItem,
                widget: {
                    id: sourceData.id,
                    name: sourceData.name,
                    widget_type: sourceData.widget_type,
                    status: 'ready',
                    duration_seconds: sourceData.duration_seconds,
                    thumbnail_url: sourceData.thumbnail_url,
                },
            };
        default:
            return baseItem;
    }
}
