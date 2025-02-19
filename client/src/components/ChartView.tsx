import { useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card } from './ui/card';

interface ChartViewProps {
  contractAddress: string;
  timeRange: [Date, Date];
  onTimeRangeChange: (range: [Date, Date]) => void;
}

export function ChartView({
  contractAddress,
  timeRange,
  onTimeRangeChange
}: ChartViewProps) {
  // Sample data - replace with real data fetch
  const data = [
    { time: '2024-01-01', value: 10 },
    { time: '2024-01-02', value: 11 },
    { time: '2024-01-03', value: 14 },
    { time: '2024-01-04', value: 12 },
    { time: '2024-01-05', value: 15 },
  ];

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="time" stroke="#d1d5db" />
          <YAxis stroke="#d1d5db" />
          <Tooltip />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#22c55e" 
            fillOpacity={1}
            fill="url(#colorValue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}