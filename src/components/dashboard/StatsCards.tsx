import { AttendanceStats } from '@/lib/types';
import { CheckCircle2, XCircle, Clock, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardsProps {
  stats: AttendanceStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: 'Total Students',
      value: stats.total,
      icon: Users,
      className: 'bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20',
      iconClass: 'text-primary',
      valueClass: 'text-foreground',
    },
    {
      label: 'Present',
      value: stats.present,
      percentage: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0,
      icon: CheckCircle2,
      trendIcon: TrendingUp,
      className: 'bg-gradient-to-br from-success/5 to-success/15 border-success/30',
      iconClass: 'text-success',
      valueClass: 'text-success',
      trendClass: 'text-success',
    },
    {
      label: 'Absent',
      value: stats.absent,
      percentage: stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0,
      icon: XCircle,
      trendIcon: TrendingDown,
      className: 'bg-gradient-to-br from-destructive/5 to-destructive/15 border-destructive/30',
      iconClass: 'text-destructive',
      valueClass: 'text-destructive',
      trendClass: 'text-destructive',
    },
    {
      label: 'On Duty',
      value: stats.od,
      percentage: stats.total > 0 ? Math.round((stats.od / stats.total) * 100) : 0,
      icon: Clock,
      className: 'bg-gradient-to-br from-warning/5 to-warning/15 border-warning/30',
      iconClass: 'text-warning',
      valueClass: 'text-warning',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const TrendIcon = card.trendIcon;
        return (
          <div
            key={card.label}
            className={cn(
              'p-5 rounded-2xl border-2 transition-all duration-300 stats-card card-shine relative overflow-hidden',
              card.className
            )}
          >
            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{card.label}</p>
                <p className={cn('text-3xl font-bold font-mono', card.valueClass)}>{card.value}</p>
                {card.percentage !== undefined && (
                  <div className="flex items-center gap-1 mt-1">
                    {TrendIcon && <TrendIcon className={cn('w-3 h-3', card.trendClass)} />}
                    <span className={cn('text-sm font-semibold', card.trendClass || 'text-muted-foreground')}>
                      {card.percentage}%
                    </span>
                  </div>
                )}
              </div>
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center',
                card.iconClass.replace('text-', 'bg-').replace(')', '/20)')
              )}>
                <Icon className={cn('w-6 h-6', card.iconClass)} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
