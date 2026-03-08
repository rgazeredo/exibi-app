import InputError from '@/components/input-error';
import { TagInput } from '@/components/tag-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { getCsrfToken, isCsrfError } from '@/hooks/use-csrf';
import { useT } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { CheckCircle2, Film, ImageIcon, Plus, Trash2, Upload, XCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Tag {
    id: string;
    name: string;
    slug: string;
    color: string;
}

interface FileItem {
    id: string;
    file: File;
    title: string;
    tags: Tag[];
    preview: string | null;
    type: 'video' | 'image';
    status: 'pending' | 'uploading' | 'completed' | 'error';
    progress: number;
    error?: string;
}

function generateId(): string {
    return Math.random().toString(36).substring(2, 9);
}

function createPreview(file: File): Promise<string | null> {
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

export default function MediaUpload() {
    const { t } = useT();
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState<FileItem[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [globalError, setGlobalError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.dashboard'), href: '/dashboard' },
        { title: t('media.title'), href: '/media' },
        { title: t('media.upload'), href: '/media/create' },
    ];

    // Cleanup previews on unmount
    useEffect(() => {
        return () => {
            files.forEach((item) => {
                if (item.preview && item.type === 'image') {
                    URL.revokeObjectURL(item.preview);
                }
            });
        };
    }, []);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            addFiles(Array.from(e.dataTransfer.files));
        }
    }, []);

    const addFiles = async (newFiles: File[]) => {
        const validFiles = newFiles.filter(
            (file) => file.type.startsWith('video/') || file.type.startsWith('image/')
        );

        const fileItems: FileItem[] = await Promise.all(
            validFiles.map(async (file) => {
                const preview = await createPreview(file);
                const title = file.name.replace(/\.[^/.]+$/, '');
                return {
                    id: generateId(),
                    file,
                    title,
                    tags: [],
                    preview,
                    type: file.type.startsWith('video/') ? 'video' : 'image',
                    status: 'pending',
                    progress: 0,
                } as FileItem;
            })
        );

        setFiles((prev) => [...prev, ...fileItems]);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            addFiles(Array.from(e.target.files));
            // Reset input so same file can be selected again
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removeFile = (id: string) => {
        setFiles((prev) => {
            const item = prev.find((f) => f.id === id);
            if (item?.preview && item.type === 'image') {
                URL.revokeObjectURL(item.preview);
            }
            return prev.filter((f) => f.id !== id);
        });
    };

    const updateFile = (id: string, updates: Partial<FileItem>) => {
        setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
    };

    const uploadFile = (item: FileItem): Promise<boolean> => {
        return new Promise((resolve) => {
            const formData = new FormData();
            formData.append('file', item.file);
            if (item.title) {
                formData.append('title', item.title);
            }
            if (item.tags.length > 0) {
                item.tags.forEach((tag) => formData.append('tags[]', tag.id));
            }

            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const percent = Math.round((event.loaded / event.total) * 100);
                    updateFile(item.id, { progress: percent });
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    updateFile(item.id, { status: 'completed', progress: 100 });
                    resolve(true);
                } else if (isCsrfError(xhr.status)) {
                    setGlobalError(t('errors.sessionExpired') || 'Your session has expired. The page will reload.');
                    setTimeout(() => window.location.reload(), 2000);
                    resolve(false);
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
                    updateFile(item.id, { status: 'error', error: errorMsg });
                    resolve(false);
                }
            });

            xhr.addEventListener('error', () => {
                updateFile(item.id, {
                    status: 'error',
                    error: t('media.uploadFailed') || 'Upload failed',
                });
                resolve(false);
            });

            xhr.open('POST', '/media');
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.setRequestHeader('X-CSRF-TOKEN', getCsrfToken());

            updateFile(item.id, { status: 'uploading', progress: 0 });
            xhr.send(formData);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const pendingFiles = files.filter((f) => f.status === 'pending' || f.status === 'error');
        if (pendingFiles.length === 0) return;

        setIsUploading(true);
        setGlobalError(null);

        // Upload files sequentially
        for (const file of pendingFiles) {
            await uploadFile(file);
        }

        setIsUploading(false);
    };

    const pendingCount = files.filter((f) => f.status === 'pending' || f.status === 'error').length;
    const completedCount = files.filter((f) => f.status === 'completed').length;
    const allCompleted = files.length > 0 && files.every((f) => f.status === 'completed');

    // Redirect when all uploads complete
    useEffect(() => {
        if (allCompleted) {
            const timer = setTimeout(() => {
                router.visit('/media');
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [allCompleted]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('media.uploadMedia')} />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('media.uploadMedia')}</h1>
                    <p className="text-muted-foreground">
                        {t('media.uploadDesc') || 'Upload videos and images for your digital signage'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Dropzone */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('media.selectFiles') || 'Select Files'}</CardTitle>
                            <CardDescription>
                                {t('media.supportedFormats') ||
                                    'Supported formats: MP4, WebM, MOV, AVI, JPG, PNG, GIF, WebP (max 500MB)'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div
                                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                                    dragActive
                                        ? 'border-primary bg-primary/5'
                                        : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                                }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="video/*,image/*"
                                    multiple
                                    onChange={handleFileInput}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    disabled={isUploading}
                                />
                                <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                                <p className="mt-3 text-sm font-medium">
                                    {t('media.dragAndDropMultiple') ||
                                        'Drag and drop your files here, or click to browse'}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {t('media.maxFileSizeMultiple') || 'Videos and images up to 500MB each'}
                                </p>
                            </div>

                            {globalError && <InputError message={globalError} className="mt-2" />}
                        </CardContent>
                    </Card>

                    {/* File List */}
                    {files.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>
                                        {t('media.filesToUpload') || 'Files to Upload'} ({files.length})
                                    </span>
                                    {completedCount > 0 && (
                                        <span className="text-sm font-normal text-muted-foreground">
                                            {completedCount} / {files.length} {t('common.completed') || 'completed'}
                                        </span>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {files.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`flex gap-4 p-4 rounded-lg border ${
                                            item.status === 'completed'
                                                ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900'
                                                : item.status === 'error'
                                                  ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900'
                                                  : 'bg-muted/30'
                                        }`}
                                    >
                                        {/* Preview */}
                                        <div className="w-32 h-20 rounded-md bg-muted flex-shrink-0 overflow-hidden flex items-center justify-center">
                                            {item.preview ? (
                                                <img
                                                    src={item.preview}
                                                    alt="Preview"
                                                    className="object-cover w-full h-full"
                                                />
                                            ) : item.type === 'video' ? (
                                                <Film className="h-8 w-8 text-muted-foreground" />
                                            ) : (
                                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0 space-y-3">
                                            {/* File info */}
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium truncate">{item.file.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
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
                                                            className="h-8 w-8"
                                                            onClick={() => removeFile(item.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Upload progress */}
                                            {item.status === 'uploading' && (
                                                <div className="space-y-1">
                                                    <Progress value={item.progress} className="h-2" />
                                                    <p className="text-xs text-muted-foreground">
                                                        {t('media.uploading') || 'Uploading...'} {item.progress}%
                                                    </p>
                                                </div>
                                            )}

                                            {/* Error message */}
                                            {item.status === 'error' && item.error && (
                                                <p className="text-xs text-red-600">{item.error}</p>
                                            )}

                                            {/* Editable fields (only for pending/error) */}
                                            {(item.status === 'pending' || item.status === 'error') && (
                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">
                                                            {t('common.title') || 'Title'}
                                                        </Label>
                                                        <Input
                                                            value={item.title}
                                                            onChange={(e) =>
                                                                updateFile(item.id, { title: e.target.value })
                                                            }
                                                            placeholder={t('media.enterTitle') || 'Enter title'}
                                                            className="h-9"
                                                            disabled={isUploading}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">{t('tags.title') || 'Tags'}</Label>
                                                        <TagInput
                                                            value={item.tags}
                                                            onChange={(tags) => updateFile(item.id, { tags })}
                                                            placeholder={t('tags.selectTags') || 'Select tags...'}
                                                            disabled={isUploading}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Completed info */}
                                            {item.status === 'completed' && (
                                                <p className="text-xs text-green-600">
                                                    {t('media.uploadComplete') || 'Upload complete!'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Add more files button */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('media.addMoreFiles') || 'Add more files'}
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* All completed message */}
                    {allCompleted && (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle2 className="h-5 w-5" />
                                    <span className="font-medium">
                                        {t('media.allUploadsComplete') || 'All uploads complete!'}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {t('media.redirecting') || 'Redirecting to media library...'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.get('/media')}
                            disabled={isUploading}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" disabled={isUploading || pendingCount === 0}>
                            {isUploading && <Spinner className="mr-2" />}
                            {isUploading
                                ? t('media.uploading') || 'Uploading...'
                                : pendingCount > 1
                                  ? `${t('media.uploadFiles') || 'Upload'} (${pendingCount})`
                                  : t('media.uploadMedia') || 'Upload'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
