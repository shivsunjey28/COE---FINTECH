import { useEffect, useState, useMemo } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Student, Attendance, AttendanceStatus } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CheckCircle, XCircle, Clock, User, Loader2 } from 'lucide-react';

interface StudentAnalyticsModalProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COLORS = {
  present: 'hsl(160, 84%, 39%)',
  absent: 'hsl(0, 84%, 60%)',
  od: 'hsl(38, 92%, 50%)',
};

export function StudentAnalyticsModal({ student, open, onOpenChange }: StudentAnalyticsModalProps) {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (student && open) {
      fetchStudentAttendance();
    }
  }, [student, open]);

  const fetchStudentAttendance = async () => {
    if (!student) return;
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', student.id)
      .order('date', { ascending: false });

    if (!error && data) {
      setAttendance(data);
    }
    setIsLoading(false);
  };

  const stats = useMemo(() => {
    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const od = attendance.filter(a => a.status === 'od').length;
    const total = attendance.length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { present, absent, od, total, percentage };
  }, [attendance]);

  const pieData = useMemo(() => [
    { name: 'Present', value: stats.present, color: COLORS.present },
    { name: 'Absent', value: stats.absent, color: COLORS.absent },
    { name: 'OD', value: stats.od, color: COLORS.od },
  ].filter(d => d.value > 0), [stats]);

  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div>{student.name}</div>
              <div className="text-sm font-normal text-muted-foreground">{student.register_number}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-muted/50 text-center">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total Days</div>
              </div>
              <div className="p-4 rounded-xl bg-success/10 text-center">
                <div className="text-2xl font-bold text-success">{stats.present}</div>
                <div className="text-xs text-muted-foreground">Present</div>
              </div>
              <div className="p-4 rounded-xl bg-destructive/10 text-center">
                <div className="text-2xl font-bold text-destructive">{stats.absent}</div>
                <div className="text-xs text-muted-foreground">Absent</div>
              </div>
              <div className="p-4 rounded-xl bg-warning/10 text-center">
                <div className="text-2xl font-bold text-warning">{stats.od}</div>
                <div className="text-xs text-muted-foreground">OD</div>
              </div>
            </div>

            {/* Attendance Percentage */}
            <div className="p-4 rounded-xl glass border">
              <div className="text-sm text-muted-foreground mb-2">Attendance Percentage</div>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-primary">{stats.percentage}%</div>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Pie Chart */}
            {pieData.length > 0 && (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Recent Attendance */}
            <div>
              <h4 className="font-semibold mb-3">Recent Attendance</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {attendance.slice(0, 10).map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-mono">{format(new Date(a.date), 'dd MMM yyyy')}</span>
                    <div className="flex items-center gap-2">
                      {a.status === 'present' && <CheckCircle className="w-4 h-4 text-success" />}
                      {a.status === 'absent' && <XCircle className="w-4 h-4 text-destructive" />}
                      {a.status === 'od' && <Clock className="w-4 h-4 text-warning" />}
                      <span className="text-sm capitalize">{a.status}</span>
                    </div>
                  </div>
                ))}
                {attendance.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    No attendance records found
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
