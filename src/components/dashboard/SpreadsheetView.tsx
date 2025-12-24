import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Student, Attendance, AttendanceStatus } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Clock, Search, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpreadsheetViewProps {
  students: Student[];
  attendance: Attendance[];
  onStatusChange: (studentId: string, status: AttendanceStatus) => void;
  canEdit: boolean;
  selectedDate: Date;
  onDownload: () => void;
}

export function SpreadsheetView({ 
  students, 
  attendance, 
  onStatusChange, 
  canEdit, 
  selectedDate,
  onDownload 
}: SpreadsheetViewProps) {
  const [search, setSearch] = useState('');

  const attendanceMap = useMemo(() => {
    const map = new Map<string, Attendance>();
    attendance.forEach((a) => map.set(a.student_id, a));
    return map;
  }, [attendance]);

  const filteredStudents = useMemo(() => {
    if (!search) return students;
    const searchLower = search.toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(searchLower) ||
        s.register_number.toLowerCase().includes(searchLower) ||
        s.department.toLowerCase().includes(searchLower)
    );
  }, [students, search]);

  const getStatusForStudent = (studentId: string): AttendanceStatus => {
    return attendanceMap.get(studentId)?.status || 'absent';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, roll number, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl glass border-border/50"
          />
        </div>
        <Button onClick={onDownload} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Download CSV
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        {format(selectedDate, 'EEEE, MMMM d, yyyy')} • {filteredStudents.length} students
      </div>

      <div className="rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12">#</TableHead>
                <TableHead>Register No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student, index) => {
                const status = getStatusForStudent(student.id);
                const att = attendanceMap.get(student.id);
                
                return (
                  <TableRow 
                    key={student.id}
                    className={cn(
                      'transition-colors',
                      status === 'present' && 'bg-success/5',
                      status === 'absent' && 'bg-destructive/5',
                      status === 'od' && 'bg-warning/5'
                    )}
                  >
                    <TableCell className="font-mono text-muted-foreground">{index + 1}</TableCell>
                    <TableCell className="font-mono">{student.register_number}</TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.department}</TableCell>
                    <TableCell>
                      <span className="text-xs px-2 py-1 rounded bg-muted">
                        {student.hostel_or_dayscolar}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {status === 'present' && (
                          <span className="flex items-center gap-1 text-success">
                            <CheckCircle className="w-4 h-4" />
                            Present
                          </span>
                        )}
                        {status === 'absent' && (
                          <span className="flex items-center gap-1 text-destructive">
                            <XCircle className="w-4 h-4" />
                            Absent
                          </span>
                        )}
                        {status === 'od' && (
                          <span className="flex items-center gap-1 text-warning">
                            <Clock className="w-4 h-4" />
                            OD
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!canEdit}
                          onClick={() => onStatusChange(student.id, 'present')}
                          className={cn(
                            'w-8 h-8 p-0 rounded-lg',
                            status === 'present' && 'bg-success text-success-foreground border-success'
                          )}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!canEdit}
                          onClick={() => onStatusChange(student.id, 'absent')}
                          className={cn(
                            'w-8 h-8 p-0 rounded-lg',
                            status === 'absent' && 'bg-destructive text-destructive-foreground border-destructive'
                          )}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!canEdit}
                          onClick={() => onStatusChange(student.id, 'od')}
                          className={cn(
                            'w-8 h-8 p-0 rounded-lg',
                            status === 'od' && 'bg-warning text-warning-foreground border-warning'
                          )}
                        >
                          <Clock className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No students found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
