
import { useEffect, useRef } from 'react';
import { IChartApi, createChart, ColorType } from 'lightweight-charts';
import { CryptoCompareAPI } from '@cryptocompare/cg-api-ts';

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
  const api = new CryptoCompareAPI();

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
        background: { type: ColorType.Solid, color: '#1a1a1a' },
        textColor: '#d1d5db',
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      grid: {
        vertLines: { color: '#2c2c2c' },
        horzLines: { color: '#2c2c2c' },
      },
    });

    const lineSeries = chartRef.current.addLineSeries({
      color: '#2962FF',
      lineWidth: 2,
    });

    const fetchData = async () => {
      try {
        const endTime = Math.floor(Date.now() / 1000);
        const startTime = endTime - 7 * 24 * 60 * 60; // 7 days of data

        const response = await api.getOHLCV(contractAddress, 'usd', {
          after: startTime,
          before: endTime,
          precision: '1h'
        });

        const chartData = response.map((item: any) => ({
          time: item.time,
          value: item.close,
        }));

        lineSeries.setData(chartData);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    fetchData();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [contractAddress]);

  return (
    <div className="w-full h-[400px]" ref={chartContainerRef} />
  );
}
