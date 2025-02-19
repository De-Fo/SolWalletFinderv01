
import { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

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
  const chart = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      if (chartContainerRef.current && chart.current) {
        chart.current.applyOptions({ 
          width: chartContainerRef.current.clientWidth 
        });
      }
    };

    chart.current = createChart(chartContainerRef.current, {
      layout: {
        background: { 
          type: 'solid', 
          color: '#1a1a1a' 
        },
        textColor: '#d1d5db',
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      grid: {
        vertLines: { color: '#2c2c2c' },
        horzLines: { color: '#2c2c2c' },
      },
    });

    const lineSeries = chart.current.addLineSeries({
      color: '#2962FF',
      lineWidth: 2,
      priceLineVisible: false,
    });

    const fetchData = async () => {
      try {
        const endTime = Math.floor(Date.now() / 1000);
        const startTime = endTime - 7 * 24 * 60 * 60; // 7 days

        const response = await fetch(`/api/price-history/${contractAddress}?start=${startTime}&end=${endTime}`);
        const data = await response.json();

        lineSeries.setData(data.map((item: any) => ({
          time: item.time,
          value: parseFloat(item.value)
        })));
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    fetchData();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chart.current) {
        chart.current.remove();
      }
    };
  }, [contractAddress]);

  return (
    <div className="w-full h-[400px]" ref={chartContainerRef} />
  );
}
