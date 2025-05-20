
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip } from 'recharts';

interface SessionStatsProps {
  sessionStats: {
    [key: string]: {
      total: number;
      winRate: number;
      breakEvenRate: number;
    }
  }
}

const SessionRadarChart = ({ sessionStats }: SessionStatsProps) => {
  // Transform session stats into data for radar chart
  const data = Object.entries(sessionStats).map(([name, stats]) => ({
    name,
    winRate: parseFloat(stats.winRate.toFixed(2)),
    total: stats.total,
  }));

  return (
    <Card className="glass-effect h-full">
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground mb-4">Session Performance</p>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart outerRadius={90} data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  return [
                    `${value.toFixed(2)}%`,
                    name === "winRate" ? "Win Rate" : name
                  ];
                }}
                labelFormatter={(label) => `Session: ${label}`}
              />
              <Radar
                name="Win Rate"
                dataKey="winRate"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionRadarChart;
