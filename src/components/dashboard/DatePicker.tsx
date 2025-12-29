import { format } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  date: Date;
  onDateChange: (date: Date) => void;
  isAdmin: boolean;
}

export function DatePicker({ date, onDateChange, isAdmin }: DatePickerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const goToPreviousDay = () => {
    const prev = new Date(date);
    prev.setDate(prev.getDate() - 1);
    // Allow viewing any past date
    onDateChange(prev);
  };

  const goToNextDay = () => {
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    // Allow viewing up to today, admins can view future
    if (next <= today || isAdmin) {
      onDateChange(next);
    }
  };

  const isToday = date.toDateString() === today.toDateString();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={goToPreviousDay}
        className="rounded-xl"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'min-w-[200px] justify-start text-left font-normal rounded-xl',
              'glass border-border/50',
              isToday && 'border-primary/50'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span className="font-mono">{format(date, 'PPP')}</span>
            {isToday && (
              <span className="ml-auto text-xs text-primary font-medium">Today</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => d && onDateChange(d)}
            initialFocus
            className="pointer-events-auto"
            disabled={(d) => {
              // Only disable future dates for non-admins
              if (isAdmin) return d > today;
              return d > today;
            }}
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="icon"
        onClick={goToNextDay}
        disabled={date >= today && !isAdmin}
        className="rounded-xl"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
}
