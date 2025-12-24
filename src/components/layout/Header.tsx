import { Moon, Sun, LogOut, Shield, CheckCircle2, XCircle, Clock, Users } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AttendanceStatus, AttendanceStats } from '@/lib/types';
import { cn } from '@/lib/utils';

interface HeaderProps {
  stats?: AttendanceStats;
  activeFilter?: AttendanceStatus | null;
  onFilterChange?: (status: AttendanceStatus | null) => void;
}

export function Header({ stats, activeFilter, onFilterChange }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, isAdmin, signOut } = useAuth();

  const filterTabs = stats ? [
    { status: null, label: 'All', count: stats.total, icon: Users, color: 'primary' },
    { status: 'present' as AttendanceStatus, label: 'Present', count: stats.present, icon: CheckCircle2, color: 'success' },
    { status: 'absent' as AttendanceStatus, label: 'Absent', count: stats.absent, icon: XCircle, color: 'destructive' },
    { status: 'od' as AttendanceStatus, label: 'On Duty', count: stats.od, icon: Clock, color: 'warning' },
  ] : [];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-border/30">
      <div className="container mx-auto px-4">
        {/* Top Row */}
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">F</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">COE – FINTECH</h1>
              <p className="text-xs text-muted-foreground">Attendance Management System</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user && isAdmin && (
              <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10">
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-xl hover:bg-muted"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            {user && (
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                className="rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
