import { cn } from '@/lib/utils';
import { useT } from '@/hooks/use-translations';
import { Upload } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

interface UploadDropzoneProps {
    onFilesAdded: (files: File[]) => void;
    disabled?: boolean;
    compact?: boolean;
    className?: string;
    accept?: string;
}

export function UploadDropzone({
    onFilesAdded,
    disabled = false,
    compact = false,
    className,
    accept = 'video/*,image/*',
}: UploadDropzoneProps) {
    const { t } = useT();
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;

        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, [disabled]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (disabled) return;

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files).filter(
                (file) => file.type.startsWith('video/') || file.type.startsWith('image/')
            );
            if (files.length > 0) {
                onFilesAdded(files);
            }
        }
    }, [disabled, onFilesAdded]);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files).filter(
                (file) => file.type.startsWith('video/') || file.type.startsWith('image/')
            );
            if (files.length > 0) {
                onFilesAdded(files);
            }
            // Reset input so same file can be selected again
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleClick = () => {
        if (!disabled) {
            fileInputRef.current?.click();
        }
    };

    return (
        <div
            className={cn(
                'relative border-2 border-dashed rounded-lg text-center transition-colors cursor-pointer',
                compact ? 'p-4' : 'p-8',
                dragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50',
                disabled && 'opacity-50 cursor-not-allowed',
                className
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleClick}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                multiple
                onChange={handleFileInput}
                className="hidden"
                disabled={disabled}
            />
            <Upload className={cn('mx-auto text-muted-foreground', compact ? 'h-6 w-6' : 'h-10 w-10')} />
            <p className={cn('font-medium', compact ? 'mt-2 text-xs' : 'mt-3 text-sm')}>
                {t('media.dragAndDropMultiple') || 'Drag and drop your files here, or click to browse'}
            </p>
            {!compact && (
                <p className="mt-1 text-xs text-muted-foreground">
                    {t('media.maxFileSizeMultiple') || 'Videos and images up to 500MB each'}
                </p>
            )}
        </div>
    );
}
