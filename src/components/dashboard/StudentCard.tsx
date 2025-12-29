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
  index?: number;
}

export function StudentCard({ student, status, onStatusChange, canEdit, timeMarked, onClick, index = 0 }: StudentCardProps) {

  const statusButtons = [
    { value: 'present' as AttendanceStatus, icon: CheckCircle2, label: 'Present', activeColor: 'bg-emerald-500 text-white shadow-emerald-500/40', borderColor: 'border-emerald-500/50', hover: 'hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-400' },
    { value: 'absent' as AttendanceStatus, icon: XCircle, label: 'Absent', activeColor: 'bg-rose-500 text-white shadow-rose-500/40', borderColor: 'border-rose-500/50', hover: 'hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-400' },
    { value: 'od' as AttendanceStatus, icon: Clock, label: 'On Duty', activeColor: 'bg-amber-500 text-white shadow-amber-500/40', borderColor: 'border-amber-500/50', hover: 'hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-400' },
  ];

  return (
    <div className={cn(
      'group relative p-4 rounded-2xl transition-all duration-300 animate-fade-in',
      'glass-card border border-white/5 bg-white/[0.02] hover:bg-white/[0.05]',
      status === 'present' && 'border-l-4 border-l-emerald-500',
      status === 'absent' && 'border-l-4 border-l-rose-500',
      status === 'od' && 'border-l-4 border-l-amber-500',
      !status && 'border-l-4 border-l-transparent'
    )}>
      <div className="flex items-center justify-between gap-4">
        <div
          className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
          onClick={onClick}
        >
          {/* Avatar / Icon */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center shrink-0 border border-white/10 group-hover:scale-105 transition-transform duration-300 group-hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <User className="w-6 h-6 text-violet-300" />
          </div>

          {/* Text Info */}
          <div className="min-w-0 space-y-1">
            <h3 className="font-bold text-base text-white truncate tracking-tight group-hover:text-primary transition-colors">
              {student.name}
            </h3>
            <p className="text-xs text-white/40 font-mono tracking-wider">{student.register_number}</p>

            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-white/5 text-white/60 border border-white/5">
                {student.department}
              </span>
              {student.hostel_or_dayscolar === 'Hosteller' && (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/20">
                  Hostel
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1.5 shrink-0">
          {statusButtons.map((btn) => {
            const Icon = btn.icon;
            const isActive = status === btn.value;

            return (
              <button
                key={btn.value}
                disabled={!canEdit}
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(student.id, btn.value);
                }}
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 border',
                  isActive
                    ? `${btn.activeColor} border-transparent shadow-lg scale-105`
                    : `bg-transparent border-white/5 text-white/20 ${btn.hover} hover:scale-105`
                )}
                title={btn.label}
              >
                <Icon className={cn("w-5 h-5", isActive ? "animate-pulse" : "")} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Marked Indicator */}
      {timeMarked && (
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Clock className="w-3 h-3 text-white/20" />
          <span className="text-[10px] font-mono text-white/30">
            {new Date(timeMarked).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )}
    </div>
  );
}
