import { useEffect, useState, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { utils, writeFile } from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DatePicker } from '@/components/dashboard/DatePicker';

import { AttendanceList } from '@/components/dashboard/AttendanceList';
import { SpreadsheetView } from '@/components/dashboard/SpreadsheetView';
import { StudentAnalyticsModal } from '@/components/dashboard/StudentAnalyticsModal';
import { AddStudentDialog } from '@/components/dashboard/AddStudentDialog';
import { AnalyticsCharts } from '@/components/analytics/AnalyticsCharts';
import { Student, Attendance, AttendanceStatus, AttendanceStats } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { Loader2, Table, LayoutGrid, Users, CheckCircle2, XCircle, Clock, UserPlus, Search, Shield, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  const [searchQuery, setSearchQuery] = useState('');

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
      .order('created_at', { ascending: false }); // Newest students first

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
    const { data: allAttendance, error } = await supabase
      .from('attendance')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch attendance data', variant: 'destructive' });
      return;
    }

    const dates = [...new Set(allAttendance?.map(a => a.date) || [])].sort();
    const attendanceByStudentDate = new Map<string, Map<string, string>>();
    allAttendance?.forEach((a) => {
      if (!attendanceByStudentDate.has(a.student_id)) {
        attendanceByStudentDate.set(a.student_id, new Map());
      }
      attendanceByStudentDate.get(a.student_id)!.set(a.date, a.status);
    });

    const headers = ['S.No', 'Register Number', 'Name', 'Department', 'Type', ...dates.map(d => format(new Date(d), 'dd/MM')), 'Total Present', 'Total Absent', 'Total OD', 'Attendance %'];

    const data: (string | number)[][] = [headers];

    students.forEach((student, index) => {
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

      data.push([
        index + 1,
        student.register_number,
        student.name,
        student.department,
        student.hostel_or_dayscolar,
        ...dailyStatuses,
        present,
        absent,
        od,
        `${percentage}%`,
      ]);
    });

    const worksheet = utils.aoa_to_sheet(data);
    const wscols = headers.map(h => ({ wch: h.length + 5 }));
    worksheet['!cols'] = wscols;

    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Attendance Report');
    writeFile(workbook, `attendance-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);

    toast({ title: 'Downloaded', description: 'Complete attendance report downloaded successfully as Excel file' });
  }, [students]);

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

  // Filter students based on search and status
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.register_number.toLowerCase().includes(searchQuery.toLowerCase());
      /* We handle status filtering in the AttendanceList component mostly, but for count consistency... */
      return matchesSearch;
    });
  }, [students, searchQuery]);


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {/* New Branding Section */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="text-xl font-bold text-white">F</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide leading-none">Fintech Coe</h1>
              <p className="text-xs text-white/50 font-medium">Attendance Portal</p>
            </div>
          </div>
          <p className="text-white/60">
            Welcome back, admin. Here's today's attendance overview.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input pl-9 pr-4 py-2.5 rounded-xl w-64 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10 h-10 px-3 rounded-xl gap-2">
                <Shield className="w-4 h-4" />
                Admin
              </Badge>
            )}

            <DatePicker date={selectedDate} onDateChange={setSelectedDate} isAdmin={isAdmin} />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => user && supabase.auth.signOut()}
              className="h-10 w-10 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 transition-colors border border-red-500/20"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', count: stats.total, icon: Users, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
          { label: 'Present', count: stats.present, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
          { label: 'Absent', count: stats.absent, icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
          { label: 'On Duty', count: stats.od, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
        ].map((stat) => (
          <div key={stat.label} className={`glass-card p-5 flex items-start justify-between border ${stat.border} hover:bg-white/[0.07]`}>
            <div>
              <p className="text-sm font-medium text-white/60 mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-white">{stat.count}</h3>
            </div>
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Attendance List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Attendance List</h3>

              <div className="flex gap-2 bg-black/20 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode('cards')}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    viewMode === 'cards' ? "bg-primary/20 text-primary" : "text-white/40 hover:text-white"
                  )}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('spreadsheet')}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    viewMode === 'spreadsheet' ? "bg-primary/20 text-primary" : "text-white/40 hover:text-white"
                  )}
                >
                  <Table className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {[
                { status: null, label: 'All', icon: Users },
                { status: 'present', label: 'Present', icon: CheckCircle2 },
                { status: 'absent', label: 'Absent', icon: XCircle },
                { status: 'od', label: 'On Duty', icon: Clock },
              ].map((filter) => (
                <button
                  key={filter.label}
                  onClick={() => setActiveStatusFilter(filter.status as AttendanceStatus)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium border transition-all flex items-center gap-2 whitespace-nowrap",
                    activeStatusFilter === filter.status
                      ? "bg-white/10 border-white/20 text-white shadow-lg"
                      : "bg-transparent border-white/5 text-white/40 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <filter.icon className="w-4 h-4" />
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="min-h-[400px]">
              {viewMode === 'cards' ? (
                <AttendanceList
                  students={filteredStudents}
                  attendance={attendance}
                  onStatusChange={handleStatusChange}
                  canEdit={canEdit}
                  filterStatus={activeStatusFilter}
                  onStudentClick={handleStudentClick}
                  onClearFilter={() => setActiveStatusFilter(null)}
                />
              ) : (
                <SpreadsheetView
                  students={filteredStudents}
                  attendance={attendance}
                  onStatusChange={handleStatusChange}
                  canEdit={canEdit}
                  selectedDate={selectedDate}
                  onDownload={handleDownload}
                  onAddStudent={() => setShowAddStudentDialog(true)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Analytics */}
        <div className="space-y-6">
          <AnalyticsCharts stats={stats} trendData={trendData} />
        </div>
      </div>

      {/* Floating Add Student Button */}
      {isAdmin && (
        <Button
          onClick={() => setShowAddStudentDialog(true)}
          className="fixed bottom-8 right-8 h-16 w-16 rounded-full bg-gradient-to-r from-primary to-fuchsia-600 hover:scale-110 text-white shadow-2xl shadow-primary/40 z-50 transition-all duration-300"
          size="icon"
        >
          <UserPlus className="w-7 h-7" />
        </Button>
      )}

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
