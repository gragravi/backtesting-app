// js/core/TradingViewEngine.js

// Version de base, sans la logique de Replay, pour garantir la stabilité.

let chart = null;
let candleSeries = null;
let lastData = null;

export const TradingViewEngine = {
    initChart(containerId) {
        const chartContainer = document.getElementById(containerId);
        if (!chartContainer) {
            console.error(`❌ L'élément conteneur #${containerId} n'a pas été trouvé.`);
            return;
        }

        chart = LightweightCharts.createChart(chartContainer, {
            width: chartContainer.clientWidth,
            height: chartContainer.clientHeight,
            layout: { background: { color: '#ffffff' }, textColor: '#222222' },
            grid: { vertLines: { color: '#eeeeee' }, horzLines: { color: '#eeeeee' } },
            timeScale: { timeVisible: true, secondsVisible: false, }
        });

        candleSeries = chart.addCandlestickSeries({
            upColor: '#2ebd85',
            downColor: '#e74c3c',
            borderUpColor: '#2ebd85',
            borderDownColor: '#e74c3c',
            wickUpColor: '#2ebd85',
            wickDownColor: '#e74c3c',
            priceFormat: { type: 'price', precision: 5, minMove: 0.00001, },
        });

        console.log('✅ Moteur TradingView (base stable) initialisé.');

        new ResizeObserver(entries => {
            if (entries.length > 0 && entries[0].contentRect.width > 0) {
                const { width, height } = entries[0].contentRect;
                chart.resize(width, height);
            }
        }).observe(chartContainer);
    },

    setSeriesData(data) {
        if (!candleSeries) {
            console.error('❌ La série de bougies n\'est pas initialisée.');
            return;
        }
        candleSeries.setData(data);
        lastData = data;
        console.log('✅ Données injectées dans le graphique.');
        chart.timeScale().fitContent();
    },

    getLatestPrice() {
        if (lastData && lastData.length > 0) {
            return lastData[lastData.length - 1].close;
        }
        return null;
    }
};