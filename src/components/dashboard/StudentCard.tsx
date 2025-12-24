import { CheckCircle2, XCircle, Clock, User } from 'lucide-react';
import { Student, AttendanceStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StudentCardProps {
  student: Student;
  status: AttendanceStatus;
  onStatusChange: (studentId: string, status: AttendanceStatus) => void;
  canEdit: boolean;
  timeMarked?: string;
  onClick?: () => void;
}

export function StudentCard({ student, status, onStatusChange, canEdit, timeMarked, onClick }: StudentCardProps) {
  const statusButtons = [
    { value: 'present' as AttendanceStatus, icon: CheckCircle2, label: 'Present', bgClass: 'bg-success', textClass: 'text-success-foreground', borderClass: 'border-success', hoverClass: 'hover:bg-success/90' },
    { value: 'absent' as AttendanceStatus, icon: XCircle, label: 'Absent', bgClass: 'bg-destructive', textClass: 'text-destructive-foreground', borderClass: 'border-destructive', hoverClass: 'hover:bg-destructive/90' },
    { value: 'od' as AttendanceStatus, icon: Clock, label: 'On Duty', bgClass: 'bg-warning', textClass: 'text-warning-foreground', borderClass: 'border-warning', hoverClass: 'hover:bg-warning/90' },
  ];

  return (
    <div className={cn(
      'group p-4 rounded-2xl glass border-2 transition-all duration-300 hover:shadow-xl animate-fade-in',
      status === 'present' && 'border-success/40 bg-success/5',
      status === 'absent' && 'border-destructive/40 bg-destructive/5',
      status === 'od' && 'border-warning/40 bg-warning/5',
      !['present', 'absent', 'od'].includes(status) && 'border-border/50'
    )}>
      <div className="flex items-center justify-between gap-4">
        <div 
          className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer group-hover:scale-[1.01] transition-transform"
          onClick={onClick}
        >
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300",
            status === 'present' && 'bg-success/20',
            status === 'absent' && 'bg-destructive/20',
            status === 'od' && 'bg-warning/20',
            !['present', 'absent', 'od'].includes(status) && 'bg-muted'
          )}>
            <User className={cn(
              "w-7 h-7 transition-colors",
              status === 'present' && 'text-success',
              status === 'absent' && 'text-destructive',
              status === 'od' && 'text-warning',
              !['present', 'absent', 'od'].includes(status) && 'text-muted-foreground'
            )} />
          </div>
          <div className="min-w-0 space-y-1">
            <h3 className="font-bold text-lg truncate tracking-tight">{student.name}</h3>
            <p className="text-sm text-muted-foreground font-mono">{student.register_number}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">{student.department}</span>
              <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                {student.hostel_or_dayscolar}
              </span>
            </div>
            {timeMarked && (
              <p className="text-xs text-muted-foreground font-mono">
                ⏱ {new Date(timeMarked).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          {statusButtons.map((btn) => {
            const Icon = btn.icon;
            const isActive = status === btn.value;

            return (
              <Button
                key={btn.value}
                variant="outline"
                size="sm"
                disabled={!canEdit}
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(student.id, btn.value);
                }}
                className={cn(
                  'px-4 py-3 h-auto rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-1.5 min-w-[80px] font-semibold',
                  isActive && `${btn.bgClass} ${btn.textClass} ${btn.borderClass} shadow-lg`,
                  isActive && btn.value === 'present' && 'shadow-success/30',
                  isActive && btn.value === 'absent' && 'shadow-destructive/30',
                  isActive && btn.value === 'od' && 'shadow-warning/30',
                  !isActive && 'hover:scale-105 hover:border-border'
                )}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs">{btn.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
