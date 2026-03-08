import { Button } from '@/components/ui/button';
import { DatePicker, TimeInput } from '@/components/ui/date-time-picker';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export interface ScheduleSlot {
    id: string;
    days: number[];
    time_start: string;
    time_end: string;
    starts_at?: string | null;
    ends_at?: string | null;
}

interface ScheduleSlotModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (slot: ScheduleSlot) => void;
    existingSlots: ScheduleSlot[];
    editingSlot?: ScheduleSlot | null;
    t: (key: string) => string;
}

const DAYS_OF_WEEK = [
    { value: 0, labelKey: 'schedule.days.sun', fullLabelKey: 'schedule.days.sunday' },
    { value: 1, labelKey: 'schedule.days.mon', fullLabelKey: 'schedule.days.monday' },
    { value: 2, labelKey: 'schedule.days.tue', fullLabelKey: 'schedule.days.tuesday' },
    { value: 3, labelKey: 'schedule.days.wed', fullLabelKey: 'schedule.days.wednesday' },
    { value: 4, labelKey: 'schedule.days.thu', fullLabelKey: 'schedule.days.thursday' },
    { value: 5, labelKey: 'schedule.days.fri', fullLabelKey: 'schedule.days.friday' },
    { value: 6, labelKey: 'schedule.days.sat', fullLabelKey: 'schedule.days.saturday' },
];

function generateId(): string {
    return `slot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function parseDate(isoString: string | null | undefined): Date | null {
    if (!isoString) return null;
    const date = new Date(isoString);
    return isNaN(date.getTime()) ? null : date;
}

function toIsoString(date: Date | null): string | null {
    if (!date) return null;
    return date.toISOString();
}

function hasTimeOverlap(slot1: ScheduleSlot, slot2: ScheduleSlot): { overlap: boolean; conflictDays: number[] } {
    // Find common days
    const commonDays = slot1.days.filter((d) => slot2.days.includes(d));
    if (commonDays.length === 0) {
        return { overlap: false, conflictDays: [] };
    }

    // Check time overlap
    const start1 = slot1.time_start;
    const end1 = slot1.time_end;
    const start2 = slot2.time_start;
    const end2 = slot2.time_end;

    // Times overlap if start1 < end2 AND start2 < end1
    const timesOverlap = start1 < end2 && start2 < end1;

    return { overlap: timesOverlap, conflictDays: timesOverlap ? commonDays : [] };
}

export function ScheduleSlotModal({
    open,
    onClose,
    onSave,
    existingSlots,
    editingSlot,
    t,
}: ScheduleSlotModalProps) {
    const [days, setDays] = useState<number[]>([]);
    const [timeStart, setTimeStart] = useState<string>('09:00');
    const [timeEnd, setTimeEnd] = useState<string>('18:00');
    const [startsAt, setStartsAt] = useState<Date | null>(null);
    const [endsAt, setEndsAt] = useState<Date | null>(null);

    // Reset form when opening or when editingSlot changes
    useEffect(() => {
        if (!open) return;

        if (editingSlot) {
            setDays(editingSlot.days);
            setTimeStart(editingSlot.time_start);
            setTimeEnd(editingSlot.time_end);
            setStartsAt(parseDate(editingSlot.starts_at));
            setEndsAt(parseDate(editingSlot.ends_at));
        } else {
            setDays([]);
            setTimeStart('09:00');
            setTimeEnd('18:00');
            setStartsAt(null);
            setEndsAt(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, editingSlot?.id]);

    // Track the slot ID we're currently working with to exclude from conflict check
    // This prevents false conflicts when the slot is added to existingSlots before modal closes
    const [savedSlotId, setSavedSlotId] = useState<string | null>(null);

    // Reset savedSlotId when modal opens
    useEffect(() => {
        if (open) {
            setSavedSlotId(null);
        }
    }, [open]);

    // Compute conflict as derived state using useMemo
    const conflict = useMemo(() => {
        if (days.length === 0 || !timeStart || !timeEnd) {
            return null;
        }

        const newSlot: ScheduleSlot = {
            id: editingSlot?.id || 'new',
            days,
            time_start: timeStart,
            time_end: timeEnd,
        };

        // Check against existing slots (excluding the one being edited and any just-saved slot)
        const slotsToCheck = existingSlots.filter((s) => s.id !== editingSlot?.id && s.id !== savedSlotId);

        for (const existingSlot of slotsToCheck) {
            const { overlap, conflictDays } = hasTimeOverlap(newSlot, existingSlot);
            if (overlap) {
                const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
                const conflictDayNames = conflictDays.map((d) => t(`schedule.days.${dayKeys[d]}`) || dayKeys[d]).join(', ');
                return `${t('schedule.conflict') || 'Conflito'}: ${t('schedule.conflictDescription') || 'Já existe horário para'} ${conflictDayNames} ${t('schedule.conflictFrom') || 'das'} ${existingSlot.time_start} ${t('schedule.conflictTo') || 'às'} ${existingSlot.time_end}`;
            }
        }

        return null;
    }, [days, timeStart, timeEnd, existingSlots, editingSlot, savedSlotId, t]);

    const toggleDay = (day: number) => {
        setDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => a - b)
        );
    };

    const selectWeekdays = () => setDays([1, 2, 3, 4, 5]);
    const selectWeekend = () => setDays([0, 6]);
    const selectAllDays = () => setDays([0, 1, 2, 3, 4, 5, 6]);

    const handleSave = () => {
        if (days.length === 0 || !timeStart || !timeEnd || conflict) {
            return;
        }

        const slotId = editingSlot?.id || generateId();
        const slot: ScheduleSlot = {
            id: slotId,
            days,
            time_start: timeStart,
            time_end: timeEnd,
            starts_at: toIsoString(startsAt),
            ends_at: toIsoString(endsAt),
        };

        // Set savedSlotId to exclude from conflict check when existingSlots updates
        setSavedSlotId(slotId);
        onSave(slot);
        onClose();
    };

    const isValid = days.length > 0 && timeStart && timeEnd && !conflict;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {editingSlot
                            ? t('schedule.editSchedule') || 'Editar horário'
                            : t('schedule.addSchedule') || 'Adicionar horário'}
                    </DialogTitle>
                    <DialogDescription>
                        {t('schedule.addScheduleDescription') ||
                            'Selecione os dias da semana e o horário de exibição.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Days of Week */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">
                                {t('schedule.daysOfWeek') || 'Dias da semana'} *
                            </Label>
                            <div className="flex gap-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={selectWeekdays}
                                >
                                    {t('schedule.weekdays') || 'Seg-Sex'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={selectWeekend}
                                >
                                    {t('schedule.weekend') || 'Fim de semana'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={selectAllDays}
                                >
                                    {t('schedule.allDays') || 'Todos'}
                                </Button>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            {DAYS_OF_WEEK.map((day) => {
                                const isSelected = days.includes(day.value);
                                return (
                                    <button
                                        key={day.value}
                                        type="button"
                                        onClick={() => toggleDay(day.value)}
                                        className={cn(
                                            'flex-1 rounded-md border py-2 text-xs font-medium transition-colors',
                                            isSelected
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-input bg-background hover:bg-accent'
                                        )}
                                        title={t(day.fullLabelKey)}
                                    >
                                        {t(day.labelKey)}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Time Range */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">
                            {t('schedule.timeRange') || 'Horário'} *
                        </Label>
                        <div className="flex items-center gap-2">
                            <Label className="shrink-0 text-xs text-muted-foreground">
                                {t('schedule.from') || 'Das'}
                            </Label>
                            <TimeInput
                                value={timeStart}
                                onChange={(time) => setTimeStart(time || '09:00')}
                            />
                            <Label className="shrink-0 text-xs text-muted-foreground">
                                {t('schedule.to') || 'às'}
                            </Label>
                            <TimeInput
                                value={timeEnd}
                                onChange={(time) => setTimeEnd(time || '18:00')}
                            />
                        </div>
                    </div>

                    {/* Validity Period (optional) */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">
                            {t('schedule.validityPeriod') || 'Período de validade'}{' '}
                            <span className="text-muted-foreground font-normal">
                                ({t('common.optional') || 'opcional'})
                            </span>
                        </Label>
                        <div className="flex items-center gap-2">
                            <Label className="shrink-0 text-xs text-muted-foreground">
                                {t('schedule.validFrom') || 'De'}
                            </Label>
                            <DatePicker
                                value={startsAt}
                                onChange={(date) => {
                                    if (date) date.setHours(0, 0, 0, 0);
                                    setStartsAt(date);
                                }}
                                placeholder={t('schedule.selectDate') || 'Selecione'}
                                className="flex-1"
                            />
                            <Label className="shrink-0 text-xs text-muted-foreground">
                                {t('schedule.validUntil') || 'até'}
                            </Label>
                            <DatePicker
                                value={endsAt}
                                onChange={(date) => {
                                    if (date) date.setHours(23, 59, 59, 999);
                                    setEndsAt(date);
                                }}
                                placeholder={t('schedule.selectDate') || 'Selecione'}
                                className="flex-1"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {t('schedule.validityDesc') ||
                                'Deixe em branco para que o horário seja permanente.'}
                        </p>
                    </div>

                    {/* Conflict Warning */}
                    {conflict && (
                        <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3">
                            <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                            <p className="text-sm text-destructive">{conflict}</p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>
                        {t('common.cancel') || 'Cancelar'}
                    </Button>
                    <Button type="button" onClick={handleSave} disabled={!isValid}>
                        {t('schedule.saveSchedule') || 'Salvar horário'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
