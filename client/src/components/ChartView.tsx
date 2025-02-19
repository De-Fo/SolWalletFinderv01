
import { useEffect, useRef } from 'react';
import { createChart, IChartApi, SingleValueData } from 'lightweight-charts';

interface ChartViewProps {
  contractAddress: string;
  timeRange: [Date, Date];
  onTimeRangeChange: (range: [Date, Date]) => void;
}

export function ChartView({
  contractAddress,
  timeRange,
}: ChartViewProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;
    const chart = createChart(container, {
      width: container.clientWidth,
      height: 400,
      layout: {
        background: { type: 'solid', color: '#1a1a1a' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#2c2c2c' },
        horzLines: { color: '#2c2c2c' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const areaSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    const fetchData = async () => {
      try {
        const endTime = Math.floor(Date.now() / 1000);
        const startTime = endTime - 7 * 24 * 60 * 60; // 7 days

        const response = await fetch(`/api/price-history/${contractAddress}?start=${startTime}&end=${endTime}`);
        const data = await response.json();

        const formattedData = data.map((item: any) => ({
          time: item.time,
          open: parseFloat(item.value),
          high: parseFloat(item.value),
          low: parseFloat(item.value),
          close: parseFloat(item.value),
        }));

        areaSeries.setData(formattedData);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    const handleResize = () => {
      chart.applyOptions({ 
        width: container.clientWidth 
      });
    };

    chartRef.current = chart;
    window.addEventListener('resize', handleResize);
    fetchData();

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [contractAddress]);

  return (
    <div className="w-full h-[400px]" ref={chartContainerRef} />
  );
}
