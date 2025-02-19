
import { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';
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
  const api = new CryptoCompareAPI();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: '#1a1a1a' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#2c2c2c' },
        horzLines: { color: '#2c2c2c' },
      },
    });

    const candlestickSeries = chart.addCandlestickSeries();

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
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        }));

        candlestickSeries.setData(chartData);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    fetchData();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ 
          width: chartContainerRef.current.clientWidth 
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      chart.remove();
      window.removeEventListener('resize', handleResize);
    };
  }, [contractAddress]);

  return (
    <div className="w-full h-[400px]" ref={chartContainerRef} />
  );
}
