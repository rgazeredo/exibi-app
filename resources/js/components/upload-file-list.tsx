import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useT } from '@/hooks/use-translations';
import { cn } from '@/lib/utils';
import { CheckCircle2, Film, ImageIcon, Trash2, XCircle } from 'lucide-react';

export interface UploadFileItem {
    id: string;
    file: File;
    title: string;
    preview: string | null;
    type: 'video' | 'image';
    status: 'pending' | 'uploading' | 'completed' | 'error';
    progress: number;
    error?: string;
    mediaId?: string;
}

interface UploadFileListProps {
    files: UploadFileItem[];
    onUpdateFile: (id: string, updates: Partial<UploadFileItem>) => void;
    onRemoveFile: (id: string) => void;
    isUploading: boolean;
    compact?: boolean;
    className?: string;
}

export function UploadFileList({
    files,
    onUpdateFile,
    onRemoveFile,
    isUploading,
    compact = false,
    className,
}: UploadFileListProps) {
    const { t } = useT();

    if (files.length === 0) return null;

    return (
        <div className={cn('space-y-3', className)}>
            {files.map((item) => (
                <div
                    key={item.id}
                    className={cn(
                        'flex gap-3 rounded-lg border',
                        compact ? 'p-3' : 'p-4',
                        item.status === 'completed'
                            ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900'
                            : item.status === 'error'
                              ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900'
                              : 'bg-muted/30'
                    )}
                >
                    {/* Preview */}
                    <div
                        className={cn(
                            'rounded-md bg-muted flex-shrink-0 overflow-hidden flex items-center justify-center',
                            compact ? 'w-16 h-12' : 'w-24 h-16'
                        )}
                    >
                        {item.preview ? (
                            <img
                                src={item.preview}
                                alt="Preview"
                                className="object-cover w-full h-full"
                            />
                        ) : item.type === 'video' ? (
                            <Film className={cn('text-muted-foreground', compact ? 'h-5 w-5' : 'h-6 w-6')} />
                        ) : (
                            <ImageIcon className={cn('text-muted-foreground', compact ? 'h-5 w-5' : 'h-6 w-6')} />
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-2">
                        {/* File info and actions */}
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                                {/* Title input for pending/error */}
                                {(item.status === 'pending' || item.status === 'error') && (
                                    <div className="space-y-1">
                                        {!compact && (
                                            <Label className="text-xs">{t('common.title') || 'Title'}</Label>
                                        )}
                                        <Input
                                            value={item.title}
                                            onChange={(e) => onUpdateFile(item.id, { title: e.target.value })}
                                            placeholder={t('media.enterTitle') || 'Enter title'}
                                            className={cn(compact ? 'h-8 text-sm' : 'h-9')}
                                            disabled={isUploading}
                                        />
                                    </div>
                                )}
                                {/* Show title for uploading/completed */}
                                {(item.status === 'uploading' || item.status === 'completed') && (
                                    <p className="text-sm font-medium truncate">{item.title}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0">
                                {item.status === 'completed' && (
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                )}
                                {item.status === 'error' && (
                                    <XCircle className="h-5 w-5 text-red-600" />
                                )}
                                {item.status !== 'uploading' && item.status !== 'completed' && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => onRemoveFile(item.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Upload progress */}
                        {item.status === 'uploading' && (
                            <div className="space-y-1">
                                <Progress value={item.progress} className="h-1.5" />
                                <p className="text-xs text-muted-foreground">
                                    {t('media.uploading') || 'Uploading...'} {item.progress}%
                                </p>
                            </div>
                        )}

                        {/* Error message */}
                        {item.status === 'error' && item.error && (
                            <p className="text-xs text-red-600">{item.error}</p>
                        )}

                        {/* Completed message */}
                        {item.status === 'completed' && (
                            <p className="text-xs text-green-600">
                                {t('media.uploadComplete') || 'Upload complete!'}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

// Helper function to generate preview from file
export function createPreview(file: File): Promise<string | null> {
    return new Promise((resolve) => {
        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');

        if (isVideo) {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);
            video.onloadeddata = () => {
                video.currentTime = 1;
            };
            video.onseeked = () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d')?.drawImage(video, 0, 0);
                const dataUrl = canvas.toDataURL();
                URL.revokeObjectURL(video.src);
                resolve(dataUrl);
            };
            video.onerror = () => {
                URL.revokeObjectURL(video.src);
                resolve(null);
            };
        } else if (isImage) {
            resolve(URL.createObjectURL(file));
        } else {
            resolve(null);
        }
    });
}

// Helper to generate unique ID
export function generateFileId(): string {
    return Math.random().toString(36).substring(2, 9);
}
