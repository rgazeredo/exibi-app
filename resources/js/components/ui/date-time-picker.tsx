import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useT } from '@/hooks/use-translations';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { enUS, ptBR } from 'date-fns/locale';
import { CalendarIcon, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface DateTimePickerProps {
    value: Date | null;
    onChange: (date: Date | null) => void;
    placeholder?: string;
    disabled?: boolean;
    showTime?: boolean;
    className?: string;
}

export function DateTimePicker({
    value,
    onChange,
    placeholder,
    disabled = false,
    showTime = true,
    className,
}: DateTimePickerProps) {
    const { t } = useT();
    const { i18n } = useTranslation();
    const locale = i18n.language === 'pt' ? ptBR : enUS;
    const defaultPlaceholder = t('datePicker.selectDate');
    const [open, setOpen] = useState(false);
    const [timeValue, setTimeValue] = useState<string>(
        value ? format(value, 'HH:mm') : '00:00'
    );

    const handleDateSelect = (date: Date | undefined) => {
        if (!date) {
            onChange(null);
            return;
        }

        // Combine date with existing time
        const [hours, minutes] = timeValue.split(':').map(Number);
        const newDate = new Date(date);
        newDate.setHours(hours || 0, minutes || 0, 0, 0);
        onChange(newDate);
    };

    const handleTimeChange = (time: string) => {
        setTimeValue(time);
        if (value) {
            const [hours, minutes] = time.split(':').map(Number);
            const newDate = new Date(value);
            newDate.setHours(hours || 0, minutes || 0, 0, 0);
            onChange(newDate);
        }
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null);
        setTimeValue('00:00');
    };

    const atWord = t('datePicker.at');
    const displayValue = value
        ? showTime
            ? format(value, `dd/MM/yyyy '${atWord}' HH:mm`, { locale })
            : format(value, 'dd/MM/yyyy', { locale })
        : null;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                        'w-full justify-start text-left font-normal',
                        !value && 'text-muted-foreground',
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="flex-1 truncate">
                        {displayValue || placeholder || defaultPlaceholder}
                    </span>
                    {value && !disabled && (
                        <X
                            className="h-4 w-4 flex-shrink-0 opacity-50 hover:opacity-100"
                            onClick={handleClear}
                        />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={value || undefined}
                    onSelect={handleDateSelect}
                    locale={locale}
                    initialFocus
                />
                {showTime && (
                    <div className="border-t p-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{t('datePicker.time')}:</span>
                            <Input
                                type="time"
                                value={timeValue}
                                onChange={(e) => handleTimeChange(e.target.value)}
                                className="w-auto"
                            />
                        </div>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}

interface DatePickerProps {
    value: Date | null;
    onChange: (date: Date | null) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export function DatePicker({
    value,
    onChange,
    placeholder,
    disabled = false,
    className,
}: DatePickerProps) {
    return (
        <DateTimePicker
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            showTime={false}
            className={className}
        />
    );
}

interface TimePickerProps {
    value: string | null;
    onChange: (time: string | null) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export function TimePicker({
    value,
    onChange,
    placeholder,
    disabled = false,
    className,
}: TimePickerProps) {
    const { t } = useT();
    const defaultPlaceholder = t('datePicker.time');
    const [open, setOpen] = useState(false);

    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = ['00', '15', '30', '45'];

    const handleSelect = (hour: string, minute: string) => {
        onChange(`${hour}:${minute}`);
        setOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                        'w-full justify-start text-left font-normal',
                        !value && 'text-muted-foreground',
                        className
                    )}
                >
                    <span className="flex-1">{value || placeholder || defaultPlaceholder}</span>
                    {value && !disabled && (
                        <X
                            className="h-4 w-4 flex-shrink-0 opacity-50 hover:opacity-100"
                            onClick={handleClear}
                        />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <div className="flex max-h-64">
                    {/* Hours */}
                    <div className="border-r overflow-y-auto">
                        <div className="p-2 text-xs font-medium text-muted-foreground sticky top-0 bg-popover">
                            {t('datePicker.hour')}
                        </div>
                        <div className="px-1 pb-1">
                            {hours.map((hour) => (
                                <Button
                                    key={hour}
                                    variant={value?.startsWith(hour + ':') ? 'default' : 'ghost'}
                                    size="sm"
                                    className="w-full justify-center"
                                    onClick={() => handleSelect(hour, value?.split(':')[1] || '00')}
                                >
                                    {hour}
                                </Button>
                            ))}
                        </div>
                    </div>
                    {/* Minutes */}
                    <div className="overflow-y-auto">
                        <div className="p-2 text-xs font-medium text-muted-foreground sticky top-0 bg-popover">
                            {t('datePicker.minute')}
                        </div>
                        <div className="px-1 pb-1">
                            {minutes.map((minute) => (
                                <Button
                                    key={minute}
                                    variant={value?.endsWith(':' + minute) ? 'default' : 'ghost'}
                                    size="sm"
                                    className="w-full justify-center"
                                    onClick={() => handleSelect(value?.split(':')[0] || '00', minute)}
                                >
                                    {minute}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
                {/* Manual input */}
                <div className="border-t p-2">
                    <Input
                        type="time"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value || null)}
                        className="w-full"
                    />
                </div>
            </PopoverContent>
        </Popover>
    );
}

interface TimeInputProps {
    value: string;
    onChange: (time: string) => void;
    disabled?: boolean;
    className?: string;
}

/**
 * Input de hora simples usando type="time" nativo
 */
export function TimeInput({
    value,
    onChange,
    disabled = false,
    className,
}: TimeInputProps) {
    return (
        <Input
            type="time"
            value={value || '00:00'}
            onChange={(e) => onChange(e.target.value || '00:00')}
            disabled={disabled}
            className={cn('w-24', className)}
        />
    );
}
