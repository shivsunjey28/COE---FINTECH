import { useEffect, useState, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/layout/Header';
import { DatePicker } from '@/components/dashboard/DatePicker';

import { AttendanceList } from '@/components/dashboard/AttendanceList';
import { SpreadsheetView } from '@/components/dashboard/SpreadsheetView';
import { StudentAnalyticsModal } from '@/components/dashboard/StudentAnalyticsModal';
import { AddStudentDialog } from '@/components/dashboard/AddStudentDialog';
import { AnalyticsCharts } from '@/components/analytics/AnalyticsCharts';
import { Student, Attendance, AttendanceStatus, AttendanceStats } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { Loader2, Table, LayoutGrid, Users, CheckCircle2, XCircle, Clock, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [trendData, setTrendData] = useState<{ date: string; present: number; absent: number; od: number }[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeStatusFilter, setActiveStatusFilter] = useState<AttendanceStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'cards' | 'spreadsheet'>('cards');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const canEdit = useMemo(() => {
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    return isAdmin || selected.getTime() === today.getTime();
  }, [selectedDate, isAdmin]);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  useEffect(() => {
    fetchTrendData();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('attendance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance',
        },
        () => {
          fetchAttendance();
          fetchTrendData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDate]);

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('name');

    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch students', variant: 'destructive' });
    } else {
      setStudents(data || []);
    }
    setIsLoading(false);
  };

  const fetchAttendance = async () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('date', dateStr);

    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch attendance', variant: 'destructive' });
    } else {
      setAttendance(data || []);
    }
  };

  const fetchTrendData = async () => {
    const { data, error } = await supabase
      .from('attendance')
      .select('date, status')
      .order('date', { ascending: true });

    if (error) return;

    const grouped = (data || []).reduce((acc, curr) => {
      if (!acc[curr.date]) {
        acc[curr.date] = { present: 0, absent: 0, od: 0 };
      }
      acc[curr.date][curr.status]++;
      return acc;
    }, {} as Record<string, { present: number; absent: number; od: number }>);

    const trend = Object.entries(grouped).map(([date, counts]) => ({
      date: format(new Date(date), 'MMM dd'),
      ...counts,
    }));

    setTrendData(trend);
  };

  const handleStatusChange = async (studentId: string, status: AttendanceStatus) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const existing = attendance.find((a) => a.student_id === studentId);

    if (existing) {
      const { error } = await supabase
        .from('attendance')
        .update({ status, time_marked: new Date().toISOString(), marked_by: user?.id })
        .eq('id', existing.id);

      if (error) {
        toast({ title: 'Error', description: 'Failed to update attendance', variant: 'destructive' });
      }
    } else {
      const { error } = await supabase.from('attendance').insert({
        student_id: studentId,
        date: dateStr,
        status,
        marked_by: user?.id,
      });

      if (error) {
        toast({ title: 'Error', description: 'Failed to mark attendance', variant: 'destructive' });
      }
    }

    fetchAttendance();
  };

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const handleDownload = useCallback(async () => {
    // Fetch all attendance records for all students
    const { data: allAttendance, error } = await supabase
      .from('attendance')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch attendance data', variant: 'destructive' });
      return;
    }

    // Get unique dates
    const dates = [...new Set(allAttendance?.map(a => a.date) || [])].sort();

    // Create attendance map: student_id -> date -> status
    const attendanceByStudentDate = new Map<string, Map<string, string>>();
    allAttendance?.forEach((a) => {
      if (!attendanceByStudentDate.has(a.student_id)) {
        attendanceByStudentDate.set(a.student_id, new Map());
      }
      attendanceByStudentDate.get(a.student_id)!.set(a.date, a.status);
    });

    // Calculate totals for each student
    const headers = ['S.No', 'Register Number', 'Name', 'Department', 'Type', ...dates.map(d => format(new Date(d), 'dd/MM')), 'Total Present', 'Total Absent', 'Total OD', 'Attendance %'];

    const rows = students.map((student, index) => {
      const studentAttendance = attendanceByStudentDate.get(student.id) || new Map();
      let present = 0, absent = 0, od = 0;

      const dailyStatuses = dates.map(date => {
        const status = studentAttendance.get(date) || 'A';
        const shortStatus = status === 'present' ? 'P' : status === 'od' ? 'OD' : 'A';
        if (status === 'present') present++;
        else if (status === 'od') od++;
        else absent++;
        return shortStatus;
      });

      const total = dates.length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

      return [
        index + 1,
        student.register_number,
        `"${student.name}"`,
        student.department,
        student.hostel_or_dayscolar,
        ...dailyStatuses,
        present,
        absent,
        od,
        `${percentage}%`,
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-full-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: 'Downloaded', description: 'Complete attendance report downloaded successfully' });
  }, [students]);

  // Stats calculation - default absent for unmarked students
  const stats: AttendanceStats = useMemo(() => {
    const attendanceMap = new Map<string, Attendance>();
    attendance.forEach((a) => attendanceMap.set(a.student_id, a));

    let present = 0;
    let absent = 0;
    let od = 0;

    students.forEach((student) => {
      const att = attendanceMap.get(student.id);
      const status = att?.status || 'absent';
      if (status === 'present') present++;
      else if (status === 'absent') absent++;
      else if (status === 'od') od++;
    });

    return { total: students.length, present, absent, od };
  }, [students, attendance]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background fintech-grid">
      <Header stats={stats} activeFilter={activeStatusFilter} onFilterChange={setActiveStatusFilter} />

      <main className="container mx-auto px-4 pt-28 pb-12">
        <div className="space-y-6 animate-fade-in">
          {/* Title & Date Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl glass border-border/30">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Attendance Dashboard</h2>
              <p className="text-muted-foreground">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            <DatePicker date={selectedDate} onDateChange={setSelectedDate} isAdmin={isAdmin} />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
            {[
              { status: null, label: 'All', count: stats.total, icon: Users, color: 'primary' },
              { status: 'present' as AttendanceStatus, label: 'Present', count: stats.present, icon: CheckCircle2, color: 'success' },
              { status: 'absent' as AttendanceStatus, label: 'Absent', count: stats.absent, icon: XCircle, color: 'destructive' },
              { status: 'od' as AttendanceStatus, label: 'On Duty', count: stats.od, icon: Clock, color: 'warning' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeStatusFilter === tab.status;

              return (
                <button
                  key={tab.label}
                  onClick={() => setActiveStatusFilter(tab.status)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 whitespace-nowrap border',
                    isActive && tab.color === 'primary' && 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20',
                    isActive && tab.color === 'success' && 'bg-success text-success-foreground border-success shadow-lg shadow-success/20',
                    isActive && tab.color === 'destructive' && 'bg-destructive text-destructive-foreground border-destructive shadow-lg shadow-destructive/20',
                    isActive && tab.color === 'warning' && 'bg-warning text-warning-foreground border-warning shadow-lg shadow-warning/20',
                    !isActive && 'bg-muted/50 border-border/50 hover:bg-muted hover:scale-105'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{tab.label}</span>
                  <span className={cn(
                    'font-mono text-xs font-bold px-2 py-0.5 rounded-lg',
                    isActive ? 'bg-background/20' : 'bg-background/80'
                  )}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>



          {/* Main Content Grid */}
          <div className="flex gap-6">
            {/* Attendance List - 2/3 width */}
            <div className="w-2/3 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl glass border-border/30">
                <h3 className="text-lg font-semibold">Student Attendance</h3>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setShowAddStudentDialog(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="sm"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Student
                  </Button>
                  <div className="flex items-center gap-2 bg-muted/50 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`p-2.5 rounded-lg transition-all duration-200 ${viewMode === 'cards' ? 'bg-background shadow-md' : 'hover:bg-background/50'}`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('spreadsheet')}
                      className={`p-2.5 rounded-lg transition-all duration-200 ${viewMode === 'spreadsheet' ? 'bg-background shadow-md' : 'hover:bg-background/50'}`}
                    >
                      <Table className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="max-h-[calc(100vh-400px)] overflow-y-auto custom-scrollbar pr-2">
                {viewMode === 'cards' ? (
                  <AttendanceList
                    students={students}
                    attendance={attendance}
                    onStatusChange={handleStatusChange}
                    canEdit={canEdit}
                    filterStatus={activeStatusFilter}
                    onStudentClick={handleStudentClick}
                  />
                ) : (
                  <SpreadsheetView
                    students={students}
                    attendance={attendance}
                    onStatusChange={handleStatusChange}
                    canEdit={canEdit}
                    selectedDate={selectedDate}
                    onDownload={handleDownload}
                  />
                )}
              </div>
            </div>

            {/* Analytics - 1/3 width */}
            <div className="w-1/3">
              <AnalyticsCharts stats={stats} trendData={trendData} />
            </div>
          </div>
        </div>
      </main>

      <StudentAnalyticsModal
        student={selectedStudent}
        open={showStudentModal}
        onOpenChange={setShowStudentModal}
      />

      <AddStudentDialog
        open={showAddStudentDialog}
        onOpenChange={setShowAddStudentDialog}
        onStudentAdded={fetchStudents}
      />
    </div>
  );
}
