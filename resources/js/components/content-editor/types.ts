// ============================================================================
// CONTENT EDITOR - TYPES
// ============================================================================

// Import schedule types from existing components
import {
    type ScheduleData,
    type ScheduleMode,
    type ScheduleSlot,
    type ScheduleType,
} from '@/components/schedule-editor';

// Re-export for convenience
export type { ScheduleData, ScheduleMode, ScheduleSlot, ScheduleType };

// Content types
export type PlaybackMode = 'sequential' | 'interleaved' | 'auto' | 'random';
export type ContentType = 'playlist' | 'media' | 'widget';

// ============================================================================
// CONTENT ITEM (unified structure)
// ============================================================================

export interface ContentItem {
    id: string;
    content_type: ContentType;
    content_id: string;
    position: number;
    is_active: boolean;
    duration_override: number | null;

    // Schedule fields
    schedule_type: ScheduleType;
    schedule_mode?: ScheduleMode;
    priority_order?: number | null;
    starts_at: string | null;
    ends_at: string | null;
    day_schedules: ScheduleSlot[] | null;

    // Group placement (for players with groups)
    placement?: 'before_group' | 'after_group';
    from_group?: boolean;

    // Item details (polymorphic based on content_type)
    playlist?: PlaylistDetails | null;
    media?: MediaDetails | null;
    widget?: WidgetDetails | null;
}

export interface PlaylistDetails {
    id: string;
    name: string;
    media_count?: number;
    total_duration?: number;
    items?: PlaylistNestedItem[] | null;
}

export interface MediaDetails {
    id: string;
    title: string;
    type: 'video' | 'image';
    thumbnail_url: string | null;
    duration_seconds: number | null;
}

export interface WidgetDetails {
    id: string;
    name: string;
    widget_type: string;
    status?: string;
    duration_seconds: number | null;
    thumbnail_url?: string | null;
}

// ============================================================================
// NESTED ITEMS (for accordion visualization)
// ============================================================================

export interface PlaylistNestedItem {
    id: string;
    item_type: 'media' | 'playlist' | 'widget';
    item_id: string;
    position: number;
    media?: MediaDetails | null;
    playlist?: PlaylistDetails | null;
    widget?: WidgetDetails | null;
}

// ============================================================================
// AVAILABLE SOURCES
// ============================================================================

export interface AvailablePlaylist {
    id: string;
    name: string;
    media_count: number;
    total_duration: number;
    items?: PlaylistNestedItem[] | null;
}

export interface AvailableWidget {
    id: string;
    name: string;
    widget_type: string;
    widget_type_label?: string;
    duration_seconds: number;
    thumbnail_url?: string | null;
}

export interface AvailableMedia {
    id: string;
    title: string;
    type: 'video' | 'image';
    thumbnail_url: string | null;
    duration_seconds: number | null;
    formatted_duration: string | null;
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface TabsConfig {
    playlists?: boolean;
    media?: boolean;
    widgets?: boolean;
}

export interface ContentEditorProps {
    // Data
    items: ContentItem[];
    groupContents?: ContentItem[];
    groupName?: string;

    // Available sources
    playlists?: AvailablePlaylist[];
    widgets?: AvailableWidget[];
    media?: AvailableMedia[];

    // UI Configuration
    tabs?: TabsConfig;
    rightPanelTitle?: string;

    // Playback mode (for playlists)
    showPlaybackMode?: boolean;
    playbackMode?: PlaybackMode;
    onPlaybackModeChange?: (mode: PlaybackMode) => void;

    // Optional features
    showDurationEditor?: boolean;
    showGroupPlacement?: boolean;
    canContainSubplaylists?: boolean;

    // State & callbacks
    onItemsChange: (items: ContentItem[]) => void;
    onSave: () => void;
    saving?: boolean;
    saved?: boolean;
    hasChanges?: boolean;

    // Upload
    onUploadComplete?: () => void;

    // Translation
    t: (key: string, params?: Record<string, string | number>) => string;
}

// ============================================================================
// INTERNAL PANEL PROPS
// ============================================================================

export interface ContentSourcePanelProps {
    activeTab: ContentType;
    onTabChange: (tab: ContentType) => void;
    tabs: TabsConfig;

    // Selection
    selectedIds: Set<string>;
    onSelectionChange: (ids: Set<string>) => void;
    itemAddedCounts: Map<string, number>;

    // Add handlers
    onAddItems: (ids: string[], type: ContentType) => void;

    // Sources
    playlists: AvailablePlaylist[];
    widgets: AvailableWidget[];
    media: AvailableMedia[];

    // Media refresh
    mediaRefreshKey?: number;
    clearSelectionKey?: number;

    // Features
    enableDrag?: boolean;
    canContainSubplaylists?: boolean;

    // Upload
    onUploadClick?: () => void;

    // Translation
    t: (key: string) => string;
}

export interface ContentItemsPanelProps {
    items: ContentItem[];
    title: string;

    // Actions
    onRemove: (index: number) => void;
    onOpenDuration?: (index: number) => void;
    onOpenSchedule: (index: number) => void;

    // Playback mode
    showPlaybackMode?: boolean;
    playbackMode?: PlaybackMode;
    onPlaybackModeChange?: (mode: PlaybackMode) => void;
    onPlaybackModeHelpClick?: () => void;

    // Save
    saving?: boolean;
    saved?: boolean;
    hasChanges?: boolean;
    onSave: () => void;

    // Drag state
    isDropTarget?: boolean;

    // Group placement
    showGroupPlacement?: boolean;
    groupContents?: ContentItem[];
    groupName?: string;

    // Translation
    t: (key: string) => string;
}
