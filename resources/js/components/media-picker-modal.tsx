import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UploadDropzone } from '@/components/upload-dropzone';
import { createPreview, generateFileId, UploadFileList, type UploadFileItem } from '@/components/upload-file-list';
import { getCsrfToken, isCsrfError } from '@/hooks/use-csrf';
import { useT } from '@/hooks/use-translations';
import { cn } from '@/lib/utils';
import { CheckCircle2, Film, Image, Loader2, Plus, Search, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface MediaItem {
    id: string;
    title: string;
    type: 'video' | 'image';
    thumbnail_url: string | null;
    duration_seconds: number | null;
    formatted_duration: string | null;
}

interface TagItem {
    id: string;
    name: string;
    slug: string;
    color: string | null;
}

interface MediaPickerModalProps {
    open: boolean;
    onClose: () => void;
    onAddMedia: (media: MediaItem) => void;
    excludeIds?: string[];
}

export function MediaPickerModal({ open, onClose, onAddMedia, excludeIds = [] }: MediaPickerModalProps) {
    const { t } = useT();
    const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');

    // Library state
    const [mediaList, setMediaList] = useState<MediaItem[]>([]);
    const [mediaLoading, setMediaLoading] = useState(false);
    const [mediaSearch, setMediaSearch] = useState('');
    const [mediaType, setMediaType] = useState<string>('all');
    const [selectedTag, setSelectedTag] = useState<string>('all');
    const [tags, setTags] = useState<TagItem[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Upload state
    const [uploadFiles, setUploadFiles] = useState<UploadFileItem[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [recentlyUploaded, setRecentlyUploaded] = useState<string[]>([]);
    const [isAddingToPlaylist, setIsAddingToPlaylist] = useState(false);

    // Fetch tags for filter
    const fetchTags = useCallback(async () => {
        try {
            const response = await fetch('/api/tags', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            const data = await response.json();
            setTags(data);
        } catch (error) {
            console.error('Failed to fetch tags:', error);
        }
    }, []);

    // Fetch media from API
    const fetchMedia = useCallback(async (url: string, page: number, append = false) => {
        setMediaLoading(true);
        try {
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            const result = await response.json();
            const paginatedData = result.data;

            if (append) {
                setMediaList(prev => [...prev, ...paginatedData.data]);
            } else {
                setMediaList(paginatedData.data);
            }
            setCurrentPage(page);
            setHasMore(paginatedData.current_page < paginatedData.last_page);
        } catch (error) {
            console.error('Failed to fetch media:', error);
        } finally {
            setMediaLoading(false);
        }
    }, []);

    // Build search URL
    const buildSearchUrl = useCallback((page = 1) => {
        const params = new URLSearchParams();
        if (mediaSearch) params.set('search', mediaSearch);
        if (mediaType && mediaType !== 'all') params.set('type', mediaType);
        if (selectedTag && selectedTag !== 'all') params.set('tag', selectedTag);
        params.set('page', page.toString());
        params.set('per_page', '20');
        return `/api/media/search?${params.toString()}`;
    }, [mediaSearch, mediaType, selectedTag]);

    // Fetch tags when modal opens
    useEffect(() => {
        if (open && tags.length === 0) {
            fetchTags();
        }
    }, [open, tags.length, fetchTags]);

    // Reset and fetch when filters change
    useEffect(() => {
        if (!open || activeTab !== 'library') return;

        // Debounce search
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            setMediaList([]);
            setCurrentPage(1);
            setHasMore(true);
            fetchMedia(buildSearchUrl(1), 1);
        }, 300);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [mediaSearch, mediaType, selectedTag, open, activeTab, fetchMedia, buildSearchUrl]);

    // Load initial data when modal opens
    useEffect(() => {
        if (open && mediaList.length === 0 && activeTab === 'library') {
            fetchMedia(buildSearchUrl(1), 1);
        }
    }, [open, activeTab]);

    // Filter out already added media
    const availableMedia = mediaList.filter((media) => !excludeIds.includes(media.id));

    // Cleanup previews on unmount
    useEffect(() => {
        return () => {
            uploadFiles.forEach((item) => {
                if (item.preview && item.type === 'image') {
                    URL.revokeObjectURL(item.preview);
                }
            });
        };
    }, []);

    // Handle files added from dropzone
    const handleFilesAdded = async (files: File[]) => {
        const fileItems: UploadFileItem[] = await Promise.all(
            files.map(async (file) => {
                const preview = await createPreview(file);
                const title = file.name.replace(/\.[^/.]+$/, '');
                return {
                    id: generateFileId(),
                    file,
                    title,
                    preview,
                    type: file.type.startsWith('video/') ? 'video' : 'image',
                    status: 'pending',
                    progress: 0,
                } as UploadFileItem;
            })
        );
        setUploadFiles((prev) => [...prev, ...fileItems]);
    };

    const updateUploadFile = (id: string, updates: Partial<UploadFileItem>) => {
        setUploadFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
    };

    const removeUploadFile = (id: string) => {
        setUploadFiles((prev) => {
            const item = prev.find((f) => f.id === id);
            if (item?.preview && item.type === 'image') {
                URL.revokeObjectURL(item.preview);
            }
            return prev.filter((f) => f.id !== id);
        });
    };

    const uploadFile = (item: UploadFileItem): Promise<{ success: boolean; mediaId?: string }> => {
        return new Promise((resolve) => {
            const formData = new FormData();
            formData.append('file', item.file);
            if (item.title) {
                formData.append('title', item.title);
            }

            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const percent = Math.round((event.loaded / event.total) * 100);
                    updateUploadFile(item.id, { progress: percent });
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        updateUploadFile(item.id, {
                            status: 'completed',
                            progress: 100,
                            mediaId: response.id,
                        });
                        resolve({ success: true, mediaId: response.id });
                    } catch {
                        updateUploadFile(item.id, { status: 'completed', progress: 100 });
                        resolve({ success: true });
                    }
                } else if (isCsrfError(xhr.status)) {
                    setUploadError(t('errors.sessionExpired') || 'Your session has expired. Please reload the page.');
                    resolve({ success: false });
                } else {
                    let errorMsg = t('media.uploadFailed') || 'Upload failed';
                    try {
                        const response = JSON.parse(xhr.responseText);
                        if (response.errors?.file) {
                            errorMsg = Array.isArray(response.errors.file)
                                ? response.errors.file[0]
                                : response.errors.file;
                        } else if (response.message) {
                            errorMsg = response.message;
                        }
                    } catch {
                        // Use default error message
                    }
                    updateUploadFile(item.id, { status: 'error', error: errorMsg });
                    resolve({ success: false });
                }
            });

            xhr.addEventListener('error', () => {
                updateUploadFile(item.id, {
                    status: 'error',
                    error: t('media.uploadFailed') || 'Upload failed',
                });
                resolve({ success: false });
            });

            xhr.open('POST', '/media');
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.setRequestHeader('X-CSRF-TOKEN', getCsrfToken());
            xhr.setRequestHeader('Accept', 'application/json');

            updateUploadFile(item.id, { status: 'uploading', progress: 0 });
            xhr.send(formData);
        });
    };

    const handleStartUpload = async () => {
        const pendingFiles = uploadFiles.filter((f) => f.status === 'pending' || f.status === 'error');
        if (pendingFiles.length === 0) return;

        setIsUploading(true);
        setUploadError(null);

        const uploadedIds: string[] = [];

        // Upload files sequentially
        for (const file of pendingFiles) {
            const result = await uploadFile(file);
            if (result.success && result.mediaId) {
                uploadedIds.push(result.mediaId);
            }
        }

        setIsUploading(false);

        if (uploadedIds.length > 0) {
            setRecentlyUploaded((prev) => [...prev, ...uploadedIds]);
        }
    };

    const handleAddUploadedToPlaylist = async () => {
        // Get IDs of completed uploads
        const completedIds = uploadFiles
            .filter((f) => f.status === 'completed' && f.mediaId)
            .map((f) => f.mediaId as string);

        if (completedIds.length === 0) return;

        setIsAddingToPlaylist(true);

        // Fetch media details for each completed upload and add to playlist
        for (const mediaId of completedIds) {
            try {
                const response = await fetch(`/api/media/${mediaId}`, {
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });
                if (response.ok) {
                    const media: MediaItem = await response.json();
                    onAddMedia(media);
                }
            } catch (error) {
                console.error('Failed to fetch media:', error);
            }
        }

        setIsAddingToPlaylist(false);

        // Refresh the library and switch to library tab
        setMediaList([]);
        setCurrentPage(1);
        setHasMore(true);
        setActiveTab('library');
        // Clear upload state
        setUploadFiles([]);
        setRecentlyUploaded([]);
    };

    const handleClose = () => {
        // Reset all state
        setMediaSearch('');
        setMediaType('all');
        setSelectedTag('all');
        setMediaList([]);
        setCurrentPage(1);
        setHasMore(true);
        setActiveTab('library');
        // Cleanup upload state
        uploadFiles.forEach((item) => {
            if (item.preview && item.type === 'image') {
                URL.revokeObjectURL(item.preview);
            }
        });
        setUploadFiles([]);
        setIsUploading(false);
        setUploadError(null);
        setRecentlyUploaded([]);
        onClose();
    };

    const pendingUploadCount = uploadFiles.filter((f) => f.status === 'pending' || f.status === 'error').length;
    const completedUploadCount = uploadFiles.filter((f) => f.status === 'completed').length;
    const uploadingCount = uploadFiles.filter((f) => f.status === 'uploading').length;

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={(e) => e.target === e.currentTarget && !isUploading && handleClose()}
        >
            <Card className="w-full max-w-2xl mx-4 flex flex-col max-h-[80vh]">
                <CardHeader className="flex-shrink-0 space-y-4 pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle>{t('playlists.addMedia') || 'Add Media'}</CardTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleClose}
                            disabled={isUploading}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 rounded-lg bg-muted p-1">
                        <button
                            onClick={() => setActiveTab('library')}
                            className={cn(
                                'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors flex-1 justify-center',
                                activeTab === 'library'
                                    ? 'bg-background shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <Film className="h-4 w-4" />
                            {t('media.library') || 'Library'}
                        </button>
                        <button
                            onClick={() => setActiveTab('upload')}
                            className={cn(
                                'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors flex-1 justify-center',
                                activeTab === 'upload'
                                    ? 'bg-background shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <Upload className="h-4 w-4" />
                            {t('media.upload') || 'Upload'}
                            {uploadingCount > 0 && (
                                <Badge variant="secondary" className="ml-1">
                                    {uploadingCount}
                                </Badge>
                            )}
                        </button>
                    </div>

                    {/* Library Filters */}
                    {activeTab === 'library' && (
                        <div className="flex gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={t('playlists.searchByName') || 'Search by name'}
                                    value={mediaSearch}
                                    onChange={(e) => setMediaSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={mediaType} onValueChange={setMediaType}>
                                <SelectTrigger className="w-32">
                                    <SelectValue placeholder={t('playlists.type') || 'Type'} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('playlists.all') || 'All'}</SelectItem>
                                    <SelectItem value="video">{t('playlists.video') || 'Video'}</SelectItem>
                                    <SelectItem value="image">{t('playlists.image') || 'Image'}</SelectItem>
                                </SelectContent>
                            </Select>
                            {tags.length > 0 && (
                                <Select value={selectedTag} onValueChange={setSelectedTag}>
                                    <SelectTrigger className="w-36">
                                        <SelectValue placeholder={t('tags.tag') || 'Tag'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('tags.allTags') || 'All tags'}</SelectItem>
                                        {tags.map((tag) => (
                                            <SelectItem key={tag.id} value={tag.id}>
                                                <div className="flex items-center gap-2">
                                                    {tag.color && (
                                                        <span
                                                            className="w-2 h-2 rounded-full"
                                                            style={{ backgroundColor: tag.color }}
                                                        />
                                                    )}
                                                    {tag.name}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    )}
                </CardHeader>

                <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-6">
                    {/* Library Tab */}
                    {activeTab === 'library' && (
                        <>
                            {mediaLoading && mediaList.length === 0 ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : availableMedia.length === 0 && !mediaLoading ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Film className="mx-auto h-12 w-12" />
                                    <p className="mt-4">{t('playlists.noMediaFound') || 'No media found'}</p>
                                    <p className="text-sm">{t('playlists.tryAdjustingSearch') || 'Try adjusting your search'}</p>
                                    <Button
                                        variant="outline"
                                        className="mt-4"
                                        onClick={() => setActiveTab('upload')}
                                    >
                                        <Upload className="mr-2 h-4 w-4" />
                                        {t('media.uploadNew') || 'Upload New Media'}
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        {availableMedia.map((media) => {
                                            const isRecentlyUploaded = recentlyUploaded.includes(media.id);
                                            return (
                                                <div
                                                    key={media.id}
                                                    className={cn(
                                                        'flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors',
                                                        isRecentlyUploaded && 'ring-2 ring-green-500 bg-green-50 dark:bg-green-950/20'
                                                    )}
                                                    onClick={() => onAddMedia(media)}
                                                >
                                                    <div className="w-16 h-10 bg-muted rounded overflow-hidden flex items-center justify-center flex-shrink-0">
                                                        {media.thumbnail_url ? (
                                                            <img
                                                                src={media.thumbnail_url}
                                                                alt={media.title}
                                                                className="object-cover w-full h-full"
                                                            />
                                                        ) : media.type === 'video' ? (
                                                            <Film className="h-5 w-5 text-muted-foreground" />
                                                        ) : (
                                                            <Image className="h-5 w-5 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium truncate text-sm">{media.title}</p>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="text-xs">
                                                                {media.type}
                                                            </Badge>
                                                            {media.formatted_duration && (
                                                                <span className="text-xs text-muted-foreground">
                                                                    {media.formatted_duration}
                                                                </span>
                                                            )}
                                                            {isRecentlyUploaded && (
                                                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                                                    {t('common.new') || 'New'}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Plus className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Load more button */}
                                    {hasMore && mediaList.length > 0 && (
                                        <div className="flex justify-center pt-4">
                                            <Button
                                                variant="outline"
                                                onClick={() => fetchMedia(buildSearchUrl(currentPage + 1), currentPage + 1, true)}
                                                disabled={mediaLoading}
                                            >
                                                {mediaLoading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        {t('playlists.loading') || 'Loading...'}
                                                    </>
                                                ) : (
                                                    t('playlists.loadMore') || 'Load More'
                                                )}
                                            </Button>
                                        </div>
                                    )}

                                    {/* End of list */}
                                    {!hasMore && mediaList.length > 0 && (
                                        <p className="text-center text-sm text-muted-foreground pt-4">
                                            {t('playlists.allItemsLoaded') || 'All items loaded'}
                                        </p>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {/* Upload Tab */}
                    {activeTab === 'upload' && (
                        <div className="space-y-4">
                            <UploadDropzone
                                onFilesAdded={handleFilesAdded}
                                disabled={isUploading}
                                compact
                            />

                            {uploadError && (
                                <p className="text-sm text-red-600">{uploadError}</p>
                            )}

                            {uploadFiles.length > 0 && (
                                <UploadFileList
                                    files={uploadFiles}
                                    onUpdateFile={updateUploadFile}
                                    onRemoveFile={removeUploadFile}
                                    isUploading={isUploading}
                                    compact
                                />
                            )}

                            {/* Actions */}
                            <div className="flex justify-between items-center pt-2">
                                {completedUploadCount > 0 && (
                                    <Button
                                        variant="outline"
                                        onClick={handleAddUploadedToPlaylist}
                                        disabled={isUploading || isAddingToPlaylist}
                                    >
                                        {isAddingToPlaylist ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Plus className="mr-2 h-4 w-4 text-green-600" />
                                        )}
                                        {t('media.addToPlaylist') || 'Add to Playlist'} ({completedUploadCount})
                                    </Button>
                                )}
                                <div className="flex-1" />
                                {pendingUploadCount > 0 && (
                                    <Button
                                        onClick={handleStartUpload}
                                        disabled={isUploading || pendingUploadCount === 0}
                                    >
                                        {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {isUploading
                                            ? t('media.uploading') || 'Uploading...'
                                            : `${t('media.uploadFiles') || 'Upload'} (${pendingUploadCount})`
                                        }
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
