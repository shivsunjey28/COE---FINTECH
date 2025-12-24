export type AttendanceStatus = 'present' | 'absent' | 'od';

export interface Student {
  id: string;
  register_number: string;
  name: string;
  department: string;
  hostel_or_dayscolar: string;
  email: string;
  created_at?: string;
}

export interface Attendance {
  id: string;
  student_id: string;
  date: string;
  time_marked: string;
  status: AttendanceStatus;
  marked_by?: string;
}

export interface AttendanceWithStudent extends Attendance {
  students: Student;
}

export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
}

export interface AttendanceStats {
  present: number;
  absent: number;
  od: number;
  total: number;
}
