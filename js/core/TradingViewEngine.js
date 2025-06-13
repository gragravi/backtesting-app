// js/core/TradingViewEngine.js

let chart = null;
let candleSeries = null;
let lastData = null;

export const TradingViewEngine = {
    initChart(containerId) {
        const chartContainer = document.getElementById(containerId);
        chart = LightweightCharts.createChart(chartContainer, {
            layout: { background: { color: '#ffffff' }, textColor: '#222222' },
            grid: { vertLines: { color: '#eeeeee' }, horzLines: { color: '#eeeeee' } },
            timeScale: { timeVisible: true, secondsVisible: false, borderColor: '#2B2B43' },
            crosshair: { mode: LightweightCharts.CrosshairMode.Normal }
        });

        candleSeries = chart.addCandlestickSeries({
            upColor: '#2ebd85', downColor: '#e74c3c',
            borderUpColor: '#2ebd85', borderDownColor: '#e74c3c',
            wickUpColor: '#2ebd85', wickDownColor: '#e74c3c',
            priceFormat: { type: 'price', precision: 5, minMove: 0.00001 }
        });

        const resizeObserver = new ResizeObserver(entries => {
            const chartElement = entries.find(entry => entry.target === chartContainer);
            if (!chartElement) { return; }
            const { width, height } = chartElement.contentRect;
            chart.applyOptions({ width, height });
        });
        resizeObserver.observe(chartContainer);
        console.log('✅ Moteur TradingView initialisé.');
    },

    setSeriesData(data) {
        if (!candleSeries) return;
        candleSeries.setData(data);
        lastData = data;
        chart.timeScale().fitContent();
        console.log("✅ Données initiales injectées dans le graphique.");
    },

    updateSeriesData(newData) {
        if (!candleSeries) return;
        candleSeries.setData(newData);
        lastData = newData;
        console.log(`📈 Graphique mis à jour avec ${newData.length} bougies.`);
    },
    
    updateCandle(candle) {
        if (!candleSeries) return;
        candleSeries.update(candle);
    },

    getLatestPrice() {
        if (lastData && lastData.length > 0) {
            return lastData[lastData.length - 1].close;
        }
        return null;
    }
};