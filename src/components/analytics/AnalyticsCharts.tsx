import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { AttendanceStats } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface AnalyticsChartsProps {
  stats: AttendanceStats;
  trendData: { date: string; present: number; absent: number; od: number }[];
}

const COLORS = {
  present: 'hsl(160, 84%, 39%)',
  absent: 'hsl(0, 84%, 60%)',
  od: 'hsl(38, 92%, 50%)',
};

export function AnalyticsCharts({ stats, trendData }: AnalyticsChartsProps) {
  const pieData = useMemo(() => [
    { name: 'Present', value: stats.present, color: COLORS.present },
    { name: 'Absent', value: stats.absent, color: COLORS.absent },
    { name: 'On Duty', value: stats.od, color: COLORS.od },
  ].filter(d => d.value > 0), [stats]);

  const percentageData = useMemo(() => {
    const total = stats.total || 1;
    return [
      { name: 'Present', value: stats.present, percentage: ((stats.present / total) * 100).toFixed(1), color: COLORS.present, icon: TrendingUp, trend: 'up' },
      { name: 'Absent', value: stats.absent, percentage: ((stats.absent / total) * 100).toFixed(1), color: COLORS.absent, icon: TrendingDown, trend: 'down' },
      { name: 'On Duty', value: stats.od, percentage: ((stats.od / total) * 100).toFixed(1), color: COLORS.od, icon: Clock, trend: 'neutral' },
    ];
  }, [stats]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-3 rounded-lg border border-border/50">
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 sticky top-24">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-3 w-full">
          <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
          <TabsTrigger value="trends" className="flex-1">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Status Breakdown Bar Chart */}
          <Card className="glass border-border/50 card-shine overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Status Breakdown</CardTitle>
                <div className="flex items-center gap-2">
                  {percentageData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-muted-foreground">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pieData} barSize={40}>
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats with Arrows */}
          <div className="grid grid-cols-3 gap-3">
            {percentageData.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.name} className="glass border-border/50 overflow-hidden stats-card">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center gap-2">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${item.color}20` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: item.color }} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
                        <p className="text-xs text-muted-foreground">{item.name}</p>
                      </div>
                      <div 
                        className="flex items-center gap-1 text-sm font-semibold"
                        style={{ color: item.color }}
                      >
                        {item.trend === 'up' && <TrendingUp className="w-4 h-4" />}
                        {item.trend === 'down' && <TrendingDown className="w-4 h-4" />}
                        {item.percentage}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <Card className="glass border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Attendance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[320px]">
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Line type="monotone" dataKey="present" stroke={COLORS.present} strokeWidth={2} dot={{ r: 3 }} name="Present" />
                      <Line type="monotone" dataKey="absent" stroke={COLORS.absent} strokeWidth={2} dot={{ r: 3 }} name="Absent" />
                      <Line type="monotone" dataKey="od" stroke={COLORS.od} strokeWidth={2} dot={{ r: 3 }} name="On Duty" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>No trend data available yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
