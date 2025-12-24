import { Student, AttendanceStatus, Attendance } from '@/lib/types';
import { StudentCard } from './StudentCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState, useMemo, KeyboardEvent } from 'react';

interface AttendanceListProps {
  students: Student[];
  attendance: Attendance[];
  onStatusChange: (studentId: string, status: AttendanceStatus) => void;
  canEdit: boolean;
  filterStatus: AttendanceStatus | null;
  onStudentClick?: (student: Student) => void;
}

export function AttendanceList({ students, attendance, onStatusChange, canEdit, filterStatus, onStudentClick }: AttendanceListProps) {
  const [search, setSearch] = useState('');

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

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, roll number, or department... (Enter to mark present)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter' && filteredStudents.length === 1) {
              onStatusChange(filteredStudents[0].id, 'present');
              setSearch('');
            }
          }}
          className="pl-10 rounded-xl glass border-border/50"
        />
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredStudents.length} of {students.length} students
      </div>

      <div className="grid gap-3 pb-24">
        {filteredStudents.map((student) => {
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
            />
          );
        })}

        {filteredStudents.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No students found</p>
          </div>
        )}
      </div>
    </div>
  );
}
