import { ScheduleEditor, type ScheduleData } from '@/components/schedule-editor';
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
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Calendar, Cloud, Film, Image, LayoutList, Newspaper, Ticket } from 'lucide-react';
import { useEffect, useState } from 'react';

interface OtherItemSchedule {
    index: number;
    name: string;
    schedule: ScheduleData;
}

interface ScheduleModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (schedule: ScheduleData) => void;
    initialData: ScheduleData;
    itemName: string;
    itemType: 'media' | 'playlist' | 'widget';
    itemSubtype?: string;
    otherItems?: OtherItemSchedule[];
    currentIndex?: number;
    t: (key: string) => string;
}

function getItemIcon(itemType: string, itemSubtype?: string) {
    if (itemType === 'media') {
        return itemSubtype === 'video' ? (
            <Film className="h-5 w-5 text-muted-foreground" />
        ) : (
            <Image className="h-5 w-5 text-muted-foreground" />
        );
    }
    if (itemType === 'playlist') {
        return <LayoutList className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    }
    if (itemType === 'widget') {
        switch (itemSubtype) {
            case 'weather':
                return <Cloud className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />;
            case 'lottery':
                return <Ticket className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
            case 'news':
                return <Newspaper className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
            default:
                return <Film className="h-5 w-5 text-muted-foreground" />;
        }
    }
    return <Film className="h-5 w-5 text-muted-foreground" />;
}

function checkScheduleOverlap(scheduleA: ScheduleData, scheduleB: ScheduleData): boolean {
    // Only check priority items with date ranges
    const isPriorityA = scheduleA.schedule_mode === 'priority_once' || scheduleA.schedule_mode === 'priority_loop';
    const isPriorityB = scheduleB.schedule_mode === 'priority_once' || scheduleB.schedule_mode === 'priority_loop';

    if (!isPriorityA || !isPriorityB) return false;
    if (scheduleA.schedule_type !== 'date_range' || scheduleB.schedule_type !== 'date_range') return false;
    if (!scheduleA.starts_at || !scheduleA.ends_at || !scheduleB.starts_at || !scheduleB.ends_at) return false;

    const aStart = new Date(scheduleA.starts_at).getTime();
    const aEnd = new Date(scheduleA.ends_at).getTime();
    const bStart = new Date(scheduleB.starts_at).getTime();
    const bEnd = new Date(scheduleB.ends_at).getTime();

    return aStart < bEnd && aEnd > bStart;
}

export function ScheduleModal({
    open,
    onClose,
    onSave,
    initialData,
    itemName,
    itemType,
    itemSubtype,
    otherItems = [],
    currentIndex,
    t,
}: ScheduleModalProps) {
    const [scheduleData, setScheduleData] = useState<ScheduleData>(initialData);
    const [showConflictDialog, setShowConflictDialog] = useState(false);
    const [conflictingItems, setConflictingItems] = useState<string[]>([]);

    useEffect(() => {
        if (open) {
            setScheduleData(initialData);
        }
    }, [open, initialData]);

    const findConflicts = (): string[] => {
        const conflicts: string[] = [];

        for (const other of otherItems) {
            if (other.index === currentIndex) continue;
            if (checkScheduleOverlap(scheduleData, other.schedule)) {
                conflicts.push(`#${other.index + 1} ${other.name}`);
            }
        }

        return conflicts;
    };

    const handleSave = () => {
        const conflicts = findConflicts();

        if (conflicts.length > 0) {
            setConflictingItems(conflicts);
            setShowConflictDialog(true);
        } else {
            onSave(scheduleData);
            onClose();
        }
    };

    const handleConfirmSave = () => {
        setShowConflictDialog(false);
        onSave(scheduleData);
        onClose();
    };

    const handleClear = () => {
        const clearedData: ScheduleData = {
            schedule_type: 'always',
            schedule_mode: 'always',
            priority_order: null,
            starts_at: null,
            ends_at: null,
            day_schedules: null,
        };
        setScheduleData(clearedData);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
                <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            {t('playlists.scheduling')}
                        </DialogTitle>
                        <DialogDescription className="flex items-center gap-2">
                            {getItemIcon(itemType, itemSubtype)}
                            <span className="truncate">{itemName}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <ScheduleEditor
                            value={scheduleData}
                            onChange={setScheduleData}
                            t={t}
                        />
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClear}
                            className="sm:mr-auto"
                        >
                            {t('schedule.clear')}
                        </Button>
                        <Button type="button" variant="outline" onClick={onClose}>
                            {t('common.cancel')}
                        </Button>
                        <Button type="button" onClick={handleSave}>
                            {t('common.save')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showConflictDialog} onOpenChange={setShowConflictDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('playlists.scheduleConflict')}</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div>
                                <p>{t('playlists.scheduleConflictConfirm')}</p>
                                <ul className="mt-2 list-disc list-inside">
                                    {conflictingItems.map((item, idx) => (
                                        <li key={idx} className="font-medium">{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.no')}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmSave}>
                            {t('common.yes')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
