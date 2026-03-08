// ============================================================================
// CONTENT EDITOR - DURATION MODAL
// ============================================================================

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    formatTimeInput,
    secondsToTimeString,
    timeStringToSeconds,
} from './utils';

interface DurationModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (duration: number | null) => void;
    currentDuration: number | null;
    originalDuration: number | null;
    itemName: string;
    t: (key: string) => string;
}

export function DurationModal({
    open,
    onClose,
    onSave,
    currentDuration,
    originalDuration,
    itemName,
    t,
}: DurationModalProps) {
    const [timeValue, setTimeValue] = useState<string>('00:00:00');

    // Reset when modal opens - pre-fill with current override or original duration
    useEffect(() => {
        if (open) {
            const durationToUse = currentDuration ?? originalDuration ?? 0;
            setTimeValue(secondsToTimeString(durationToUse));
        }
    }, [open, currentDuration, originalDuration]);

    const handleSave = () => {
        const seconds = timeStringToSeconds(timeValue);
        // If the value equals the original, save as null (auto)
        if (seconds === originalDuration) {
            onSave(null);
        } else {
            onSave(seconds);
        }
        onClose();
    };

    const handleClear = () => {
        // Reset to original duration
        setTimeValue(secondsToTimeString(originalDuration ?? 0));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatTimeInput(e.target.value);
        setTimeValue(formatted);
    };

    const currentSeconds = timeStringToSeconds(timeValue);
    const isDifferentFromOriginal = currentSeconds !== originalDuration;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('playlists.editDuration')}</DialogTitle>
                    <DialogDescription>{itemName}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {originalDuration && (
                        <div className="text-sm text-muted-foreground">
                            {t('playlists.originalDuration')}:{' '}
                            {secondsToTimeString(originalDuration)}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="duration-input">
                            {t('playlists.durationSeconds')}
                        </Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="duration-input"
                                type="text"
                                value={timeValue}
                                onChange={handleChange}
                                placeholder="00:00:00"
                                className="w-28 font-mono"
                            />
                            {isDifferentFromOriginal && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClear}
                                >
                                    {t('playlists.useAuto')}
                                </Button>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {t('playlists.durationHint')}
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        {t('common.cancel')}
                    </Button>
                    <Button onClick={handleSave}>{t('common.save')}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
