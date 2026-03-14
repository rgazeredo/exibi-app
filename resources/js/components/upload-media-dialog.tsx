import InputError from '@/components/input-error';
import { TagInput } from '@/components/tag-input';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { getCsrfToken, isCsrfError } from '@/hooks/use-csrf';
import { useT } from '@/hooks/use-translations';
import {
    CheckCircle2,
    Film,
    ImageIcon,
    Plus,
    Trash2,
    Upload,
    XCircle,
} from 'lucide-react';
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

interface UploadMediaDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    folderId?: string | null;
    folderName?: string | null;
    onUploadComplete: () => void;
    onFileUploaded?: (mediaId: string) => void;
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

export function UploadMediaDialog({
    open,
    onOpenChange,
    folderId,
    folderName,
    onUploadComplete,
    onFileUploaded,
}: UploadMediaDialogProps) {
    const { t } = useT();
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState<FileItem[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [globalError, setGlobalError] = useState<string | null>(null);
    const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const prevOpenRef = useRef(open);
    const hasCalledCompleteRef = useRef(false);

    // Reset state when dialog opens, cleanup previews when closes
    useEffect(() => {
        const wasOpen = prevOpenRef.current;
        prevOpenRef.current = open;

        if (open && !wasOpen) {
            // Dialog just opened - reset state
            // eslint-disable-next-line react-hooks/set-state-in-effect -- Valid: resetting state when dialog opens
            setFiles([]);
            setGlobalError(null);
            setDragActive(false);
            setIsUploading(false);
            hasCalledCompleteRef.current = false;
        }
    }, [open]);

    // Cleanup previews when files change or component unmounts
    useEffect(() => {
        return () => {
            files.forEach((item) => {
                if (item.preview && item.type === 'image') {
                    URL.revokeObjectURL(item.preview);
                }
            });
        };
    }, [files]);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const addFiles = useCallback(async (newFiles: File[]) => {
        const validFiles = newFiles.filter(
            (file) =>
                file.type.startsWith('video/') ||
                file.type.startsWith('image/'),
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
            }),
        );

        setFiles((prev) => [...prev, ...fileItems]);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);

            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                addFiles(Array.from(e.dataTransfer.files));
            }
        },
        [addFiles],
    );

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
        setFiles((prev) =>
            prev.map((f) => (f.id === id ? { ...f, ...updates } : f)),
        );
    };

    const uploadFile = useCallback(
        (item: FileItem): Promise<boolean> => {
            return new Promise((resolve) => {
                const formData = new FormData();
                formData.append('file', item.file);
                if (item.title) {
                    formData.append('title', item.title);
                }
                if (folderId) {
                    formData.append('folder_id', folderId);
                }
                if (item.tags.length > 0) {
                    item.tags.forEach((tag) =>
                        formData.append('tags[]', tag.id),
                    );
                }

                const xhr = new XMLHttpRequest();

                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        const percent = Math.round(
                            (event.loaded / event.total) * 100,
                        );
                        updateFile(item.id, { progress: percent });
                    }
                });

                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        updateFile(item.id, {
                            status: 'completed',
                            progress: 100,
                        });

                        // Extract media ID from response and notify
                        try {
                            const response = JSON.parse(xhr.responseText);
                            if (response.id && onFileUploaded) {
                                onFileUploaded(response.id);
                            }
                        } catch {
                            // Ignore parse errors
                        }

                        resolve(true);
                    } else if (isCsrfError(xhr.status)) {
                        setGlobalError(
                            t('errors.sessionExpired') ||
                                'Your session has expired. The page will reload.',
                        );
                        setTimeout(() => window.location.reload(), 2000);
                        resolve(false);
                    } else {
                        let errorMsg =
                            t('media.uploadFailed') || 'Upload failed';
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
        },
        [folderId, onFileUploaded, t],
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const pendingFiles = files.filter(
            (f) => f.status === 'pending' || f.status === 'error',
        );
        if (pendingFiles.length === 0) return;

        setIsUploading(true);
        setGlobalError(null);

        // Upload files sequentially
        for (const file of pendingFiles) {
            await uploadFile(file);
        }

        setIsUploading(false);
    };

    const pendingCount = files.filter(
        (f) => f.status === 'pending' || f.status === 'error',
    ).length;
    const completedCount = files.filter((f) => f.status === 'completed').length;
    const uploadingCount = files.filter((f) => f.status === 'uploading').length;
    const allCompleted =
        files.length > 0 && files.every((f) => f.status === 'completed');

    // Auto close and callback when all uploads complete
    useEffect(() => {
        if (allCompleted && !hasCalledCompleteRef.current) {
            hasCalledCompleteRef.current = true;
            const timer = setTimeout(() => {
                onUploadComplete();
                onOpenChange(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [allCompleted, onUploadComplete, onOpenChange]);

    // Handle dialog close attempt
    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen && (isUploading || uploadingCount > 0)) {
            // Show confirmation if upload is in progress
            setConfirmCloseOpen(true);
            return;
        }
        onOpenChange(newOpen);
    };

    const handleConfirmClose = () => {
        setConfirmCloseOpen(false);
        onOpenChange(false);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="flex h-[75vh] w-[50vw] !max-w-none flex-col">
                    <DialogHeader>
                        <DialogTitle>
                            {t('media.uploadMedia') || 'Upload de Mídia'}
                        </DialogTitle>
                        <DialogDescription>
                            {t('media.uploadMediaDesc') ||
                                'Selecione os arquivos para fazer upload.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-1 flex-col gap-4 overflow-hidden"
                    >
                        {/* Dropzone */}
                        <div
                            className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                                files.length === 0 ? 'flex-1' : ''
                            } ${
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
                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                disabled={isUploading}
                            />
                            <Upload className="h-10 w-10 text-muted-foreground" />
                            <p className="mt-3 text-sm font-medium">
                                {t('media.dragAndDropMultiple') ||
                                    'Arraste arquivos aqui ou clique para selecionar'}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {t('media.supportedFormats') ||
                                    'Formatos: MP4, WebM, MOV, AVI, JPG, PNG, GIF, WebP (máx. 500MB)'}
                            </p>
                        </div>

                        {globalError && <InputError message={globalError} />}

                        {/* File List */}
                        {files.length > 0 && (
                            <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">
                                        {t('media.filesToUpload') || 'Arquivos'}{' '}
                                        ({files.length})
                                    </span>
                                    {completedCount > 0 && (
                                        <span className="text-muted-foreground">
                                            {completedCount} / {files.length}{' '}
                                            {t('common.completed') ||
                                                'concluídos'}
                                        </span>
                                    )}
                                </div>

                                {files.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`flex items-center gap-2 rounded border px-2 py-1.5 ${
                                            item.status === 'completed'
                                                ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20'
                                                : item.status === 'error'
                                                  ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20'
                                                  : 'bg-muted/30'
                                        }`}
                                    >
                                        {/* Preview */}
                                        <div className="flex h-8 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded bg-muted">
                                            {item.preview ? (
                                                <img
                                                    src={item.preview}
                                                    alt="Preview"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : item.type === 'video' ? (
                                                <Film className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </div>

                                        {/* File info */}
                                        <div className="w-32 min-w-0 flex-shrink-0">
                                            <p className="truncate text-xs font-medium">
                                                {item.file.name}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {(
                                                    item.file.size /
                                                    (1024 * 1024)
                                                ).toFixed(2)}{' '}
                                                MB
                                            </p>
                                        </div>

                                        {/* Editable fields or status */}
                                        <div className="flex min-w-0 flex-1 items-center gap-2">
                                            {(item.status === 'pending' ||
                                                item.status === 'error') && (
                                                <>
                                                    <Input
                                                        value={item.title}
                                                        onChange={(e) =>
                                                            updateFile(
                                                                item.id,
                                                                {
                                                                    title: e
                                                                        .target
                                                                        .value,
                                                                },
                                                            )
                                                        }
                                                        placeholder={
                                                            t('common.title') ||
                                                            'Título'
                                                        }
                                                        className="h-7 flex-1 text-xs"
                                                        disabled={isUploading}
                                                    />
                                                    <div className="w-40 flex-shrink-0">
                                                        <TagInput
                                                            value={item.tags}
                                                            onChange={(tags) =>
                                                                updateFile(
                                                                    item.id,
                                                                    { tags },
                                                                )
                                                            }
                                                            placeholder={
                                                                t(
                                                                    'tags.title',
                                                                ) || 'Tags'
                                                            }
                                                            disabled={
                                                                isUploading
                                                            }
                                                        />
                                                    </div>
                                                </>
                                            )}

                                            {item.status === 'uploading' && (
                                                <div className="flex flex-1 items-center gap-2">
                                                    <Progress
                                                        value={item.progress}
                                                        className="h-1.5 flex-1"
                                                    />
                                                    <span className="w-10 text-xs text-muted-foreground">
                                                        {item.progress}%
                                                    </span>
                                                </div>
                                            )}

                                            {item.status === 'completed' && (
                                                <span className="text-xs text-green-600">
                                                    {t(
                                                        'media.uploadComplete',
                                                    ) || 'Concluído'}
                                                </span>
                                            )}

                                            {item.status === 'error' &&
                                                item.error && (
                                                    <span className="truncate text-xs text-red-600">
                                                        {item.error}
                                                    </span>
                                                )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-shrink-0 items-center gap-1">
                                            {item.status === 'completed' && (
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                            )}
                                            {item.status === 'error' && (
                                                <XCircle className="h-4 w-4 text-red-600" />
                                            )}
                                            {item.status !== 'uploading' &&
                                                item.status !== 'completed' && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() =>
                                                            removeFile(item.id)
                                                        }
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                )}
                                        </div>
                                    </div>
                                ))}

                                {/* Add more files button */}
                                {!allCompleted && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        disabled={isUploading}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        {t('media.addMoreFiles') ||
                                            'Adicionar mais arquivos'}
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* All completed message */}
                        {allCompleted && (
                            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-600 dark:bg-green-950/20">
                                <CheckCircle2 className="h-5 w-5" />
                                <span className="font-medium">
                                    {t('media.allUploadsComplete') ||
                                        'Todos os uploads foram concluídos!'}
                                </span>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="mt-auto flex justify-end gap-3 border-t pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleOpenChange(false)}
                                disabled={isUploading}
                            >
                                {t('common.cancel') || 'Cancelar'}
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    isUploading ||
                                    pendingCount === 0 ||
                                    allCompleted
                                }
                            >
                                {isUploading && <Spinner className="mr-2" />}
                                {isUploading
                                    ? t('media.uploading') || 'Enviando...'
                                    : pendingCount > 1
                                      ? `${t('media.uploadFiles') || 'Enviar'} (${pendingCount})`
                                      : t('media.uploadMedia') || 'Enviar'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Confirmation dialog for closing during upload */}
            <AlertDialog
                open={confirmCloseOpen}
                onOpenChange={setConfirmCloseOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t('media.cancelUploadTitle') || 'Cancelar upload?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('media.cancelUploadDesc') ||
                                'Há uploads em andamento. Se fechar agora, os arquivos pendentes não serão enviados.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            {t('common.continue') || 'Continuar enviando'}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmClose}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            {t('media.cancelUpload') || 'Cancelar upload'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
