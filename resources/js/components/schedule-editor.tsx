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
import { DatePicker, TimeInput } from '@/components/ui/date-time-picker';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, HelpCircle, Pencil, Plus, Repeat, Star, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { ScheduleSlotModal, type ScheduleSlot } from './schedule-slot-modal';

export type ScheduleType = 'always' | 'date_range' | 'recurring';
export type ScheduleMode = 'always' | 'available' | 'priority_once' | 'priority_loop';

export type { ScheduleSlot };

export interface ScheduleData {
    schedule_type: ScheduleType;
    schedule_mode?: ScheduleMode;
    priority_order?: number | null;
    starts_at: string | null;
    ends_at: string | null;
    day_schedules: ScheduleSlot[] | null;
}

interface ScheduleEditorProps {
    value: ScheduleData;
    onChange: (value: ScheduleData) => void;
    disabled?: boolean;
    hideAlwaysOption?: boolean;
    hideScheduleMode?: boolean;
    t: (key: string) => string;
}

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function getDayName(day: number, t: (key: string) => string): string {
    const key = DAY_KEYS[day];
    return t(`schedule.days.${key}`) || ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][day];
}

function parseDate(isoString: string | null): Date | null {
    if (!isoString) return null;
    const date = new Date(isoString);
    return isNaN(date.getTime()) ? null : date;
}

function extractTime(isoString: string | null): string {
    if (!isoString) return '00:00';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '00:00';
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

function combineDateAndTime(date: Date | null, time: string): string | null {
    if (!date) return null;
    const [hours, minutes] = time.split(':').map(Number);
    const combined = new Date(date);
    combined.setHours(hours || 0, minutes || 0, 0, 0);
    return combined.toISOString();
}

function formatDaysLabel(days: number[], t: (key: string) => string): string {
    const sortedDays = [...days].sort((a, b) => a - b);

    // Check for common patterns
    if (sortedDays.length === 7) {
        return t('schedule.everyDay') || 'Todos os dias';
    }
    if (JSON.stringify(sortedDays) === JSON.stringify([1, 2, 3, 4, 5])) {
        return t('schedule.weekdaysOnly') || 'Segunda a Sexta';
    }
    if (JSON.stringify(sortedDays) === JSON.stringify([0, 6])) {
        return t('schedule.weekendOnly') || 'Sábado e Domingo';
    }

    return sortedDays.map((d) => getDayName(d, t)).join(', ');
}

function formatSlotValidity(slot: ScheduleSlot, t: (key: string) => string): string | null {
    if (!slot.starts_at && !slot.ends_at) return null;

    const parts: string[] = [];
    if (slot.starts_at) {
        parts.push((t('schedule.validFrom') || 'de') + ' ' + new Date(slot.starts_at).toLocaleDateString());
    }
    if (slot.ends_at) {
        parts.push((t('schedule.validUntil') || 'até') + ' ' + new Date(slot.ends_at).toLocaleDateString());
    }
    return parts.join(' ');
}

export function ScheduleEditor({ value, onChange, disabled = false, hideAlwaysOption = false, hideScheduleMode = false, t }: ScheduleEditorProps) {
    const scheduleType = value.schedule_type || 'always';
    const scheduleMode = value.schedule_mode || 'always';
    const priorityOrder = value.priority_order;
    const slots = value.day_schedules || [];

    const isPriorityMode = scheduleMode === 'priority_once' || scheduleMode === 'priority_loop';

    const [showSlotModal, setShowSlotModal] = useState(false);
    const [editingSlot, setEditingSlot] = useState<ScheduleSlot | null>(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [pendingType, setPendingType] = useState<ScheduleType | null>(null);
    const [behaviorModeHelpOpen, setBehaviorModeHelpOpen] = useState(false);

    const updateField = <K extends keyof ScheduleData>(field: K, fieldValue: ScheduleData[K]) => {
        onChange({ ...value, [field]: fieldValue });
    };

    const clearSchedule = () => {
        onChange({
            schedule_type: 'always',
            schedule_mode: 'always',
            priority_order: null,
            starts_at: null,
            ends_at: null,
            day_schedules: null,
        });
    };

    // Check if changing type would lose data
    const hasDataToLose = (currentType: ScheduleType, newType: ScheduleType): boolean => {
        if (newType === 'always') {
            // Would lose everything if there's anything configured
            return !!(value.starts_at || value.ends_at || (value.day_schedules?.length ?? 0) > 0);
        }
        if (currentType === 'recurring' && newType === 'date_range') {
            // Would lose recurring slots
            return (value.day_schedules?.length ?? 0) > 0;
        }
        if (currentType === 'date_range' && newType === 'recurring') {
            // Would lose date range
            return !!(value.starts_at || value.ends_at);
        }
        return false;
    };

    const applyTypeChange = (newType: ScheduleType) => {
        if (newType === 'always') {
            clearSchedule();
        } else if (newType === 'date_range') {
            onChange({
                ...value,
                schedule_type: newType,
                schedule_mode: value.schedule_mode === 'always' ? 'available' : value.schedule_mode,
                day_schedules: null,
            });
        } else {
            onChange({
                ...value,
                schedule_type: newType,
                schedule_mode: value.schedule_mode === 'always' ? 'available' : value.schedule_mode,
                starts_at: null,
                ends_at: null,
            });
        }
    };

    const handleScheduleTypeChange = (newType: ScheduleType) => {
        if (hasDataToLose(scheduleType, newType)) {
            setPendingType(newType);
            setConfirmDialogOpen(true);
            return;
        }
        // No data to lose, change directly
        applyTypeChange(newType);
    };

    const confirmTypeChange = () => {
        if (pendingType) {
            applyTypeChange(pendingType);
            setPendingType(null);
        }
        setConfirmDialogOpen(false);
    };

    const cancelTypeChange = () => {
        setPendingType(null);
        setConfirmDialogOpen(false);
    };

    const handleAddSlot = () => {
        setEditingSlot(null);
        setShowSlotModal(true);
    };

    const handleEditSlot = (slot: ScheduleSlot) => {
        setEditingSlot(slot);
        setShowSlotModal(true);
    };

    const handleSaveSlot = (slot: ScheduleSlot) => {
        const currentSlots = value.day_schedules || [];
        const existingIndex = currentSlots.findIndex((s) => s.id === slot.id);

        let newSlots: ScheduleSlot[];
        if (existingIndex >= 0) {
            // Update existing
            newSlots = [...currentSlots];
            newSlots[existingIndex] = slot;
        } else {
            // Add new
            newSlots = [...currentSlots, slot];
        }

        updateField('day_schedules', newSlots);
    };

    const handleRemoveSlot = (slotId: string) => {
        const currentSlots = value.day_schedules || [];
        const newSlots = currentSlots.filter((s) => s.id !== slotId);
        updateField('day_schedules', newSlots.length > 0 ? newSlots : null);
    };

    return (
        <div className="space-y-4">
            {/* Schedule Type Selector */}
            <RadioGroup
                value={scheduleType}
                onValueChange={(v) => handleScheduleTypeChange(v as ScheduleType)}
                className={cn('grid gap-2', hideAlwaysOption ? 'grid-cols-2' : 'grid-cols-3')}
                disabled={disabled}
            >
                {!hideAlwaysOption && (
                    <Label
                        htmlFor="schedule-always"
                        className={cn(
                            'flex cursor-pointer flex-col items-center gap-1 rounded-md border-2 p-3 text-center hover:bg-accent',
                            scheduleType === 'always' ? 'border-primary bg-accent' : 'border-muted'
                        )}
                    >
                        <RadioGroupItem value="always" id="schedule-always" className="sr-only" />
                        <Clock className="h-4 w-4" />
                        <span className="text-xs font-medium">{t('schedule.always') || 'Sempre'}</span>
                    </Label>
                )}

                <Label
                    htmlFor="schedule-date_range"
                    className={cn(
                        'flex cursor-pointer flex-col items-center gap-1 rounded-md border-2 p-3 text-center hover:bg-accent',
                        scheduleType === 'date_range' ? 'border-primary bg-accent' : 'border-muted'
                    )}
                >
                    <RadioGroupItem value="date_range" id="schedule-date_range" className="sr-only" />
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs font-medium">{t('schedule.dateRange') || 'Período'}</span>
                </Label>

                <Label
                    htmlFor="schedule-recurring"
                    className={cn(
                        'flex cursor-pointer flex-col items-center gap-1 rounded-md border-2 p-3 text-center hover:bg-accent',
                        scheduleType === 'recurring' ? 'border-primary bg-accent' : 'border-muted'
                    )}
                >
                    <RadioGroupItem value="recurring" id="schedule-recurring" className="sr-only" />
                    <Repeat className="h-4 w-4" />
                    <span className="text-xs font-medium">{t('schedule.recurring') || 'Recorrente'}</span>
                </Label>
            </RadioGroup>

            {/* Schedule Mode Selector (only when not 'always' and not hidden) */}
            {scheduleType !== 'always' && !hideScheduleMode && (
                <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Label className="text-xs font-medium">
                                {t('schedule.behaviorMode') || 'Comportamento durante o período'}
                            </Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 text-muted-foreground hover:text-foreground"
                                onClick={() => setBehaviorModeHelpOpen(true)}
                            >
                                <HelpCircle className="h-4 w-4" />
                            </Button>
                        </div>
                        <Select
                            value={scheduleMode}
                            onValueChange={(v) => updateField('schedule_mode', v as ScheduleMode)}
                            disabled={disabled}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="available">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        <span>{t('schedule.modeAvailable') || 'Disponível no período'}</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="priority_once">
                                    <div className="flex items-center gap-2">
                                        <Star className="h-4 w-4" />
                                        <span>{t('schedule.modePriorityOnce') || 'Prioridade (uma vez)'}</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="priority_loop">
                                    <div className="flex items-center gap-2">
                                        <Repeat className="h-4 w-4" />
                                        <span>{t('schedule.modePriorityLoop') || 'Prioridade (repetir)'}</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            {scheduleMode === 'available' && (t('schedule.modeAvailableDesc') || 'Entra na rotação normal durante o período, pode tocar várias vezes.')}
                            {scheduleMode === 'priority_once' && (t('schedule.modePriorityOnceDesc') || 'Toca com prioridade uma vez, depois volta para a rotação normal.')}
                            {scheduleMode === 'priority_loop' && (t('schedule.modePriorityLoopDesc') || 'Toca em loop com prioridade até o fim da janela.')}
                        </p>
                    </div>

                    {/* Priority Order (only for priority modes) */}
                    {isPriorityMode && (
                        <div className="space-y-1">
                            <Label className="text-xs font-medium">
                                {t('schedule.priorityOrder') || 'Ordem de prioridade'}
                            </Label>
                            <Input
                                type="number"
                                min={1}
                                max={100}
                                value={priorityOrder || ''}
                                onChange={(e) => updateField('priority_order', e.target.value ? parseInt(e.target.value) : null)}
                                placeholder="1"
                                className="w-24"
                                disabled={disabled}
                            />
                            <p className="text-xs text-muted-foreground">
                                {t('schedule.priorityOrderDesc') || 'Quando há múltiplos itens prioritários, o menor número tem maior prioridade.'}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Date Range Fields */}
            {scheduleType === 'date_range' && (
                <div className="space-y-3 pt-2">
                    <p className="text-xs text-muted-foreground">
                        {t('schedule.dateRangeDesc') ||
                            'O conteúdo ficará disponível apenas durante este período.'}
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Start Date and Time */}
                        <div className="space-y-1">
                            <Label className="text-xs">{t('schedule.startsAt') || 'Início'}</Label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1">
                                    <DatePicker
                                        value={parseDate(value.starts_at)}
                                        onChange={(date) => {
                                            const currentTime = extractTime(value.starts_at);
                                            updateField('starts_at', combineDateAndTime(date, currentTime));
                                        }}
                                        placeholder={t('schedule.selectDate') || 'Selecione'}
                                        disabled={disabled}
                                    />
                                </div>
                                <TimeInput
                                    value={extractTime(value.starts_at)}
                                    onChange={(time) => {
                                        const currentDate = parseDate(value.starts_at);
                                        if (currentDate) {
                                            updateField(
                                                'starts_at',
                                                combineDateAndTime(currentDate, time || '00:00')
                                            );
                                        }
                                    }}
                                    disabled={disabled || !value.starts_at}
                                />
                            </div>
                        </div>

                        {/* End Date and Time */}
                        <div className="space-y-1">
                            <Label className="text-xs">{t('schedule.endsAt') || 'Fim'}</Label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1">
                                    <DatePicker
                                        value={parseDate(value.ends_at)}
                                        onChange={(date) => {
                                            const currentTime = extractTime(value.ends_at);
                                            updateField('ends_at', combineDateAndTime(date, currentTime));
                                        }}
                                        placeholder={t('schedule.selectDate') || 'Selecione'}
                                        disabled={disabled}
                                    />
                                </div>
                                <TimeInput
                                    value={extractTime(value.ends_at)}
                                    onChange={(time) => {
                                        const currentDate = parseDate(value.ends_at);
                                        if (currentDate) {
                                            updateField(
                                                'ends_at',
                                                combineDateAndTime(currentDate, time || '23:59')
                                            );
                                        }
                                    }}
                                    disabled={disabled || !value.ends_at}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Recurring Schedule - Slots List */}
            {scheduleType === 'recurring' && (
                <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                            {t('schedule.recurringDesc') ||
                                'Configure os horários de exibição para cada dia da semana.'}
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddSlot}
                            disabled={disabled}
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            {t('schedule.addSchedule') || 'Adicionar horário'}
                        </Button>
                    </div>

                    {/* Slots List */}
                    {slots.length === 0 ? (
                        <div className="text-center py-6 border-2 border-dashed rounded-lg">
                            <Calendar className="h-8 w-8 mx-auto text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">
                                {t('schedule.noSchedules') || 'Nenhum horário configurado'}
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-3"
                                onClick={handleAddSlot}
                                disabled={disabled}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                {t('schedule.addFirstSchedule') || 'Adicionar primeiro horário'}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {slots.map((slot) => (
                                <div
                                    key={slot.id}
                                    className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-card"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm">
                                            {formatDaysLabel(slot.days, t)}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>
                                                {slot.time_start} - {slot.time_end}
                                            </span>
                                            {formatSlotValidity(slot, t) && (
                                                <>
                                                    <span>•</span>
                                                    <span>{formatSlotValidity(slot, t)}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleEditSlot(slot)}
                                            disabled={disabled}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleRemoveSlot(slot.id)}
                                            disabled={disabled}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Slot Modal */}
            <ScheduleSlotModal
                open={showSlotModal}
                onClose={() => setShowSlotModal(false)}
                onSave={handleSaveSlot}
                existingSlots={slots}
                editingSlot={editingSlot}
                t={t}
            />

            {/* Confirm Type Change Dialog */}
            <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t('schedule.changeTypeTitle') || 'Alterar tipo de agendamento?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('schedule.changeTypeDescription') || 'As configurações de agendamento atuais serão perdidas. Tem certeza que deseja continuar?'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={cancelTypeChange}>
                            {t('common.cancel') || 'Cancelar'}
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={confirmTypeChange}>
                            {t('common.confirm') || 'Confirmar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Behavior Mode Help Dialog */}
            <Dialog open={behaviorModeHelpOpen} onOpenChange={setBehaviorModeHelpOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {t('schedule.behaviorModeHelpTitle') || 'Modos de Comportamento'}
                        </DialogTitle>
                        <DialogDescription>
                            {t('schedule.behaviorModeHelpDesc') || 'Entenda como cada modo afeta a reprodução do item durante o período agendado.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Available */}
                        <div className="rounded-lg border p-4">
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-blue-500" />
                                <h4 className="font-semibold">
                                    {t('schedule.modeAvailable') || 'Disponível no período'}
                                </h4>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {t('schedule.modeAvailableHelpDesc') || 'O item entra na rotação normal da playlist durante o período configurado. Pode tocar várias vezes enquanto estiver ativo. Fora do período, o item não aparece.'}
                            </p>
                            <div className="mt-2 rounded bg-muted p-2 font-mono text-xs">
                                {t('schedule.modeAvailableHelpExample') || 'Exemplo: Menu Almoço (11h-15h) → Aparece na rotação normal apenas nesse horário'}
                            </div>
                        </div>

                        {/* Priority Once */}
                        <div className="rounded-lg border p-4">
                            <div className="flex items-center gap-2">
                                <Star className="h-5 w-5 text-amber-500" />
                                <h4 className="font-semibold">
                                    {t('schedule.modePriorityOnce') || 'Prioridade (uma vez)'}
                                </h4>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {t('schedule.modePriorityOnceHelpDesc') || 'Quando o período começa, o item interrompe a playlist normal e toca UMA vez com prioridade. Depois, a playlist normal continua de onde parou. Útil para avisos importantes.'}
                            </p>
                            <div className="mt-2 rounded bg-muted p-2 font-mono text-xs">
                                {t('schedule.modePriorityOnceHelpExample') || 'Exemplo: Aviso Reunião às 14h → Interrompe, toca 1x, playlist continua'}
                            </div>
                        </div>

                        {/* Priority Loop */}
                        <div className="rounded-lg border p-4">
                            <div className="flex items-center gap-2">
                                <Repeat className="h-5 w-5 text-green-500" />
                                <h4 className="font-semibold">
                                    {t('schedule.modePriorityLoop') || 'Prioridade (repetir)'}
                                </h4>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {t('schedule.modePriorityLoopHelpDesc') || 'O item DOMINA a tela em loop durante todo o período. A playlist normal fica suspensa. Quando o período termina, a playlist normal retorna. Ideal para transmissões ao vivo ou emergências.'}
                            </p>
                            <div className="mt-2 rounded bg-muted p-2 font-mono text-xs">
                                {t('schedule.modePriorityLoopHelpExample') || 'Exemplo: Transmissão Evento (15h-17h) → Só esse item toca em loop até acabar o período'}
                            </div>
                        </div>

                        {/* Priority Order Note */}
                        <div className="rounded-lg border border-dashed p-4">
                            <p className="text-sm text-muted-foreground">
                                <strong>{t('schedule.priorityOrderNote') || 'Ordem de Prioridade:'}</strong>{' '}
                                {t('schedule.priorityOrderNoteDesc') || 'Quando há múltiplos itens prioritários ativos ao mesmo tempo, o item com menor número de prioridade é exibido primeiro.'}
                            </p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Helper to get schedule summary for display
export function getScheduleSummary(data: ScheduleData, t: (key: string) => string): string | null {
    if (data.schedule_type === 'always') {
        return null;
    }

    if (data.schedule_type === 'date_range') {
        if (data.starts_at && data.ends_at) {
            const start = new Date(data.starts_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
            const end = new Date(data.ends_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
            return `${start} - ${end}`;
        } else if (data.starts_at) {
            const start = new Date(data.starts_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
            return `${t('schedule.fromDate') || 'A partir de'} ${start}`;
        } else if (data.ends_at) {
            const end = new Date(data.ends_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
            return `${t('schedule.until') || 'Até'} ${end}`;
        }
    }

    if (data.schedule_type === 'recurring') {
        const slots = data.day_schedules || [];

        if (slots.length === 0) {
            return null;
        }

        if (slots.length === 1) {
            const slot = slots[0];
            const daysLabel = formatDaysLabel(slot.days, t);
            return `${daysLabel} | ${slot.time_start} - ${slot.time_end}`;
        }

        return `${slots.length} ${t('schedule.schedulesConfigured') || 'horários configurados'}`;
    }

    return null;
}
