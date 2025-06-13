// js/core/ReplayEngine.js
import { TradingViewEngine } from './TradingViewEngine.js';

let allHistoricalData = [];
let isReplayActive = false;
let replayEndIndex = 0; // Index de la dernière bougie affichée

export const ReplayEngine = {
    setHistoricalData(data) { allHistoricalData = data; },

    start(startDateStr, initialBalance) {
        const date = new Date(startDateStr + 'T23:59:59Z');
        const startTimestamp = Math.floor(date.getTime() / 1000);
        const dataUntilDate = allHistoricalData.filter(candle => candle.time <= startTimestamp);
        
        if (dataUntilDate.length === 0) return;
        
        replayEndIndex = dataUntilDate.length -1;
        isReplayActive = true;
        TradingViewEngine.updateSeriesData(dataUntilDate);
    },

    stepForward() {
        if (!isReplayActive || replayEndIndex >= allHistoricalData.length - 1) return;
        replayEndIndex++;
        const nextCandle = allHistoricalData[replayEndIndex];
        TradingViewEngine.updateCandle(nextCandle);
    },

    stepBackward() {
        // Pour reculer, on doit supprimer la dernière bougie. Le plus simple
        // est de redessiner le graphique avec un tableau plus court.
        if (!isReplayActive || replayEndIndex <= 1) return;
        replayEndIndex--;
        const dataUntilNow = allHistoricalData.slice(0, replayEndIndex + 1);
        TradingViewEngine.updateSeriesData(dataUntilNow);
    },

    stop() {
        if (!isReplayActive) return;
        isReplayActive = false;
        TradingViewEngine.setSeriesData(allHistoricalData);
    }
};