import { useEffect, useRef } from 'react';
import { createChart, IChartApi } from 'lightweight-charts';

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

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#374151' },
        horzLines: { color: '#374151' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });

    const lineSeries = chart.addLineSeries({
      color: '#22c55e',
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

    lineSeries.setData(data);
    chart.timeScale().fitContent();
    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [contractAddress]);

  return <div ref={chartContainerRef} className="w-full" />;
}