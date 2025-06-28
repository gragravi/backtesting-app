import React, { useRef, useEffect } from "react";
import { createChart } from "lightweight-charts";

export default function CandleChart({ candles, currentIndex }) {
  const chartRef = useRef();
  const chartInstance = useRef();
  const seriesRef = useRef();

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstance.current) {
      chartInstance.current.remove();
    }
    const chart = createChart(chartRef.current, {
      width: chartRef.current.offsetWidth,
      height: 280,
      layout: { background: { color: "#222" }, textColor: "#eee" },
      grid: { vertLines: { color: "#333" }, horzLines: { color: "#333" } },
      crosshair: { mode: 1 },
      timeScale: { timeVisible: true, secondsVisible: true }
    });
    const series = chart.addCandlestickSeries({
      upColor: "#4caf50", downColor: "#f44336", borderVisible: false,
      wickUpColor: "#4caf50", wickDownColor: "#f44336",
    });
    chartInstance.current = chart;
    seriesRef.current = series;

    // Nettoyage on unmount
    return () => chart.remove();
  }, []);

  useEffect(() => {
    if (!chartInstance.current || !seriesRef.current || candles.length === 0) return;
    const series = seriesRef.current;
    // On attend des objets de type {datetime, open, high, low, close}
    const windowCandles = candles.map(c => ({
      time: Math.floor(new Date(c.datetime).getTime() / 1000),
      open: Number(c.open),
      high: Number(c.high),
      low: Number(c.low),
      close: Number(c.close),
    }));

    series.setData(windowCandles);

    // Centrer la vue sur la bougie courante reçue (currentIndex)
    if (windowCandles.length > 0 && windowCandles[currentIndex]) {
      chartInstance.current.timeScale().setVisibleRange({
        from: windowCandles[0].time,
        to: windowCandles[windowCandles.length - 1].time,
      });
      // Optionnel : scrollToPosition pour centrer
      // chartInstance.current.timeScale().scrollToPosition(currentIndex, false);
    }
  }, [candles, currentIndex]);

  return (
    <div
      ref={chartRef}
      style={{
        width: "100%",
        height: 280,
        background: "#222",
        borderRadius: 6,
        margin: "1rem 0"
      }}
    />
  );
}