import { Student, AttendanceStatus, Attendance } from '@/lib/types';
import { StudentCard } from './StudentCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Search, X, Users, Filter, Sparkles } from 'lucide-react';
import { useState, useMemo, KeyboardEvent, useRef } from 'react';

interface AttendanceListProps {
  students: Student[];
  attendance: Attendance[];
  onStatusChange: (studentId: string, status: AttendanceStatus) => void;
  canEdit: boolean;
  filterStatus: AttendanceStatus | null;
  onStudentClick?: (student: Student) => void;
  onClearFilter?: () => void;
}

export function AttendanceList({ students, attendance, onStatusChange, canEdit, filterStatus, onStudentClick, onClearFilter }: AttendanceListProps) {
  const [search, setSearch] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const attendanceMap = useMemo(() => {
    const map = new Map<string, Attendance>();
    attendance.forEach((a) => map.set(a.student_id, a));
    return map;
  }, [attendance]);

  // Get effective status (default to absent if no attendance record)
  const getEffectiveStatus = (studentId: string): AttendanceStatus => {
    return attendanceMap.get(studentId)?.status || 'absent';
  };

  const filteredStudents = useMemo(() => {
    let result = students;

    // Filter by status if active
    if (filterStatus) {
      result = result.filter((s) => getEffectiveStatus(s.id) === filterStatus);
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(searchLower) ||
          s.register_number.toLowerCase().includes(searchLower) ||
          s.department.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [students, filterStatus, search, attendanceMap]);

  const handleClearSearch = () => {
    setSearch('');
    searchInputRef.current?.focus();
  };

  const getEmptyStateContent = () => {
    if (search && filteredStudents.length === 0) {
      return {
        icon: Search,
        title: 'No students found',
        description: `No students match "${search}". Try a different search term or clear the search.`,
        actionLabel: 'Clear Search',
        onAction: handleClearSearch,
      };
    }

    if (filterStatus && filteredStudents.length === 0) {
      const statusLabels = {
        present: 'Present',
        absent: 'Absent',
        od: 'On Duty',
      };
      return {
        icon: Filter,
        title: `No ${statusLabels[filterStatus]} students`,
        description: `There are no students marked as ${statusLabels[filterStatus].toLowerCase()} for this date.`,
        actionLabel: 'Clear Filter',
        onAction: onClearFilter,
      };
    }

    if (students.length === 0) {
      return {
        icon: Users,
        title: 'No students yet',
        description: 'Get started by adding your first student to the system.',
        actionLabel: undefined,
        onAction: undefined,
      };
    }

    return null;
  };

  const emptyState = getEmptyStateContent();

  return (
    <div className="space-y-4">
      {/* Enhanced Search Bar */}
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-focus-within:text-primary transition-colors" />
        <Input
          ref={searchInputRef}
          placeholder="Search by name, roll number, or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter' && filteredStudents.length === 1) {
              onStatusChange(filteredStudents[0].id, 'present');
              setSearch('');
            }
            if (e.key === 'Escape') {
              setSearch('');
            }
          }}
          className="pl-10 pr-10 rounded-xl glass-input border-white/10 h-10 w-full"
        />
        {search && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearSearch}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Results Count with Animation */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-white/40 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span className="font-medium">
            Showing {filteredStudents.length} of {students.length} students
          </span>
        </div>
        {search && (
          <div className="text-xs text-primary animate-fade-in">
            Press <kbd className="px-2 py-1 bg-white/10 rounded text-xs text-white/70">Enter</kbd> to mark as present
          </div>
        )}
      </div>

      {/* Student Cards or Empty State */}
      {filteredStudents.length > 0 ? (
        <div className="grid gap-3 pb-24">
          {filteredStudents.map((student, index) => {
            const att = attendanceMap.get(student.id);
            const effectiveStatus = getEffectiveStatus(student.id);
            return (
              <StudentCard
                key={student.id}
                student={student}
                status={effectiveStatus}
                timeMarked={att?.time_marked}
                onStatusChange={onStatusChange}
                canEdit={canEdit}
                onClick={() => onStudentClick?.(student)}
                index={index}
              />
            );
          })}
        </div>
      ) : emptyState ? (
        <EmptyState {...emptyState} />
      ) : null}
    </div>
  );
}
