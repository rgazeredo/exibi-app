import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { getCsrfToken, isCsrfError } from '@/hooks/use-csrf';
import { useT } from '@/hooks/use-translations';
import { AlertTriangle, CheckCircle2, Film, ImageIcon, Upload } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ReplaceMediaDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    media: {
        id: string;
        title: string;
        type: 'video' | 'image';
        thumbnail_url: string | null;
    };
    onReplaceComplete: () => void;
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

export function ReplaceMediaDialog({
    open,
    onOpenChange,
    media,
    onReplaceComplete,
}: ReplaceMediaDialogProps) {
    const { t } = useT();
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [title, setTitle] = useState(media.title);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Determine new file type
    const newType = file?.type.startsWith('video/') ? 'video' : 'image';
    const typeWillChange = file && newType !== media.type;

    // Reset state when dialog opens
    useEffect(() => {
        if (open) {
            setFile(null);
            setPreview(null);
            setTitle(media.title);
            setIsUploading(false);
            setProgress(0);
            setError(null);
            setIsComplete(false);
        }
    }, [open, media.title]);

    // Cleanup preview when component unmounts or file changes
    useEffect(() => {
        return () => {
            if (preview && file?.type.startsWith('image/')) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview, file]);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleFile = useCallback(async (newFile: File) => {
        const isValid = newFile.type.startsWith('video/') || newFile.type.startsWith('image/');
        if (!isValid) {
            setError(t('media.invalidFileType') || 'Tipo de arquivo não suportado');
            return;
        }

        // Check file size (512MB max)
        if (newFile.size > 512 * 1024 * 1024) {
            setError(t('media.fileTooLarge') || 'Arquivo muito grande (máx. 512MB)');
            return;
        }

        setError(null);
        setFile(newFile);

        const newPreview = await createPreview(newFile);
        setPreview(newPreview);
    }, [t]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, [handleFile]);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setIsUploading(true);
        setError(null);
        setProgress(0);

        const formData = new FormData();
        formData.append('file', file);
        if (title !== media.title) {
            formData.append('title', title);
        }

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const percent = Math.round((event.loaded / event.total) * 100);
                setProgress(percent);
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                setIsComplete(true);
                setTimeout(() => {
                    onReplaceComplete();
                    onOpenChange(false);
                }, 1000);
            } else if (isCsrfError(xhr.status)) {
                setError(t('errors.sessionExpired') || 'Sua sessão expirou. A página será recarregada.');
                setTimeout(() => window.location.reload(), 2000);
            } else {
                let errorMsg = t('media.replaceFailed') || 'Falha ao substituir mídia';
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
                setError(errorMsg);
                setIsUploading(false);
            }
        });

        xhr.addEventListener('error', () => {
            setError(t('media.replaceFailed') || 'Falha ao substituir mídia');
            setIsUploading(false);
        });

        xhr.open('POST', `/media/${media.id}/replace`);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('X-CSRF-TOKEN', getCsrfToken());
        xhr.send(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{t('media.replaceMedia') || 'Substituir Mídia'}</DialogTitle>
                    <DialogDescription>
                        {t('media.replaceMediaDesc') ||
                            'Envie um novo arquivo para substituir esta mídia. Todas as referências nas playlists serão preservadas.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Current media info */}
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="w-16 h-12 rounded bg-muted flex-shrink-0 overflow-hidden flex items-center justify-center">
                            {media.thumbnail_url ? (
                                <img
                                    src={media.thumbnail_url}
                                    alt={media.title}
                                    className="object-cover w-full h-full"
                                />
                            ) : media.type === 'video' ? (
                                <Film className="h-5 w-5 text-muted-foreground" />
                            ) : (
                                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{media.title}</p>
                            <p className="text-xs text-muted-foreground">
                                {t(`media.${media.type}`) || media.type}
                            </p>
                        </div>
                    </div>

                    {/* Dropzone */}
                    <div
                        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
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
                            onChange={handleFileInput}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={isUploading}
                        />

                        {file ? (
                            <div className="flex items-center gap-3">
                                <div className="w-16 h-12 rounded bg-muted flex-shrink-0 overflow-hidden flex items-center justify-center">
                                    {preview ? (
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            className="object-cover w-full h-full"
                                        />
                                    ) : newType === 'video' ? (
                                        <Film className="h-5 w-5 text-muted-foreground" />
                                    ) : (
                                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="min-w-0 text-left flex-1">
                                    <p className="text-sm font-medium truncate">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {(file.size / (1024 * 1024)).toFixed(2)} MB •{' '}
                                        {t(`media.${newType}`) || newType}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                                <p className="mt-2 text-sm font-medium">
                                    {t('media.dragAndDrop') || 'Arraste um arquivo ou clique para selecionar'}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {t('media.supportedFormats') ||
                                        'MP4, WebM, MOV, AVI, JPG, PNG, GIF, WebP (máx. 512MB)'}
                                </p>
                            </>
                        )}
                    </div>

                    {/* Type change warning */}
                    {typeWillChange && (
                        <Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100">
                            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <AlertDescription className="text-amber-800 dark:text-amber-200">
                                {t('media.typeWillChange', {
                                    from: t(`media.${media.type}`) || media.type,
                                    to: t(`media.${newType}`) || newType,
                                }) ||
                                    `O tipo de mídia será alterado de ${media.type} para ${newType}. Isso pode afetar as durações nas playlists.`}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Title field */}
                    {file && (
                        <div className="space-y-2">
                            <Label htmlFor="title">{t('common.title') || 'Título'}</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={isUploading}
                            />
                        </div>
                    )}

                    {/* Error message */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Progress bar */}
                    {isUploading && (
                        <div className="space-y-2">
                            <Progress value={progress} className="h-2" />
                            <p className="text-xs text-muted-foreground text-center">
                                {t('media.replacingMedia') || 'Substituindo mídia...'} {progress}%
                            </p>
                        </div>
                    )}

                    {/* Success message */}
                    {isComplete && (
                        <div className="flex items-center gap-2 text-green-600 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="font-medium">
                                {t('media.replaced') || 'Mídia substituída com sucesso!'}
                            </span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isUploading}
                        >
                            {t('common.cancel') || 'Cancelar'}
                        </Button>
                        <Button type="submit" disabled={!file || isUploading || isComplete}>
                            {isUploading && <Spinner className="mr-2" />}
                            {isUploading
                                ? t('media.replacing') || 'Substituindo...'
                                : t('media.replace') || 'Substituir'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
