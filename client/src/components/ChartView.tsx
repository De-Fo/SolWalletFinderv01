
import { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi } from 'lightweight-charts';

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
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth
        });
      }
    };

    chartRef.current = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#374151' },
        horzLines: { color: '#374151' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });

    const areaSeries = chartRef.current.addAreaSeries({
      lineColor: '#22c55e',
      topColor: '#22c55e50',
      bottomColor: '#22c55e10',
      lineWidth: 2,
    });

    // Sample data - replace with real data fetch
    const data = [
      { time: '2024-01-01', value: 10 },
      { time: '2024-01-02', value: 11 },
      { time: '2024-01-03', value: 14 },
      { time: '2024-01-04', value: 12 },
      { time: '2024-01-05', value: 15 },
    ];

    areaSeries.setData(data);
    chartRef.current.timeScale().fitContent();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [contractAddress]);

  return <div ref={chartContainerRef} className="w-full" />;
}
