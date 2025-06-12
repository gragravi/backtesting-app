// js/core/TradingViewEngine.js

import { VerticalLine } from './VerticalLine.js';

let chart = null;
let candleSeries = null;
let lastData = null;
let replayLinePrimitive = null;

export const TradingViewEngine = {
    initChart(containerId) {
        const chartContainer = document.getElementById(containerId);
        chart = LightweightCharts.createChart(chartContainer, {
            width: chartContainer.clientWidth, height: chartContainer.clientHeight,
            layout: { background: { color: '#ffffff' }, textColor: '#222222' },
            grid: { vertLines: { color: '#eeeeee' }, horzLines: { color: '#eeeeee' } },
            timeScale: { timeVisible: true, secondsVisible: false },
            crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
        });

        candleSeries = chart.addCandlestickSeries({
            upColor: '#2ebd85', downColor: '#e74c3c',
            borderUpColor: '#2ebd85', borderDownColor: '#e74c3c',
            wickUpColor: '#2ebd85', wickDownColor: '#e74c3c',
            priceFormat: { type: 'price', precision: 5, minMove: 0.00001 },
        });

        replayLinePrimitive = new VerticalLine(chart, candleSeries, { visible: false });
        candleSeries.attachPrimitive(replayLinePrimitive);

        console.log('✅ Moteur TradingView initialisé.');
        new ResizeObserver(entries => {
            if (entries.length > 0 && entries[0].contentRect.width > 0) {
                chart.resize(entries[0].contentRect.width, entries[0].contentRect.height);
            }
        }).observe(chartContainer);
    },

    setSeriesData(data) {
        if (!candleSeries) return;
        candleSeries.setData(data);
        lastData = data;
        chart.timeScale().fitContent();
        console.log("✅ Données injectées dans le graphique.");
    },

    getLatestPrice() {
        if (lastData && lastData.length > 0) {
            return lastData[lastData.length - 1].close;
        }
        return null;
    },

    activateReplaySelection(onPointSelectedCallback) {
        if (!replayLinePrimitive) return;
        replayLinePrimitive.update({ visible: true });

        const crosshairMoveSubscription = (param) => {
            if (!param.time || !param.point) {
                replayLinePrimitive.update({ visible: false });
                return;
            }
            replayLinePrimitive.update({ visible: true, time: param.time });
        };

        const clickSubscription = (param) => {
            if (!param.time) return;
            chart.unsubscribeCrosshairMove(crosshairMoveSubscription);
            chart.unsubscribeClick(clickSubscription);
            replayLinePrimitive.update({ visible: false });
            onPointSelectedCallback(param.time);
        };
        chart.subscribeCrosshairMove(crosshairMoveSubscription);
        chart.subscribeClick(clickSubscription);
    }
};