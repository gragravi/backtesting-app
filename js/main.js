import { parseCSV } from './utils/csvParser.js';
import { TradingViewEngine } from './core/TradingViewEngine.js';
import { ReplayEngine } from './core/ReplayEngine.js';
import { TradingEngine } from './core/TradingEngine.js';
import EventManager from './core/EventManager.js';
import { aggregateData } from './utils/dataAggregator.js';
import { StorageManager } from './core/StorageManager.js';
import { exportTradesToCSV, exportSessionToJSON } from './utils/exportManager.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log("Application initialisée.");
    
    // --- Initialisation des Moteurs et Managers ---
    const storageManager = new StorageManager();
    const chartEngine = new TradingViewEngine('chart-container', 'equity-chart-container');
    const replayEngine = new ReplayEngine();
    let tradingEngine = new TradingEngine();
    
    try {
        chartEngine.init();

        // --- Références au DOM ---
        const playPauseBtn = document.getElementById('play-pause-btn');
        const stepForwardBtn = document.getElementById('step-forward-btn');
        const speedSelect = document.getElementById('speed-select');
        const drawLineBtn = document.getElementById('draw-horizontal-line-btn');
        const undoBtn = document.getElementById('undo-btn');
        const buyBtn = document.getElementById('buy-btn');
        const sellBtn = document.getElementById('sell-btn');
        const saveSessionBtn = document.getElementById('save-session-btn');
        const loadSessionBtn = document.getElementById('load-session-btn');
        const timeframeToolbar = document.getElementById('timeframe-toolbar');
        const exportTradesBtn = document.getElementById('export-trades-csv-btn');
        const exportSessionBtn = document.getElementById('export-session-json-btn');
        const importSessionInput = document.getElementById('import-session-json-input');

        // --- Données ---
        const originalData = await parseCSV('data/M1_sample.csv');
        let lastCandle = null;
        if (!originalData || originalData.length === 0) throw new Error("Données M1 introuvables");

        // --- Logique principale ---
        function startReplay(timeframe, sessionData = null) {
            EventManager.emit('replay:reset');

            if (sessionData) {
                tradingEngine = new TradingEngine(sessionData.capital);
                tradingEngine.tradeHistory = sessionData.tradeHistory;
                tradingEngine.updateStats();
                sessionData.tradeHistory.forEach(trade => EventManager.emit('trade:closed', trade));
                
                // Restaurer les dessins
                chartEngine.drawingHistory.forEach(line => chartEngine.candleSeries.removePriceLine(line));
                chartEngine.drawingHistory = [];
                sessionData.drawings.forEach(lineOptions => {
                    const line = chartEngine.candleSeries.createPriceLine(lineOptions);
                    chartEngine.drawingHistory.push(line);
                });

            } else {
                tradingEngine = new TradingEngine();
                tradingEngine.updateStats();
            }
            const aggregated = aggregateData(originalData, timeframe);
            replayEngine.loadData(aggregated);
        }
        
        startReplay(1);

        // --- Connexions ---
        EventManager.on('replay:new-candle', candle => { lastCandle = candle; tradingEngine.update(candle); });

        // UI -> Moteurs
        playPauseBtn.addEventListener('click', () => replayEngine.togglePlayPause());
        stepForwardBtn.addEventListener('click', () => replayEngine.stepForward());
        speedSelect.addEventListener('change', (e) => { /* ... */ });
        timeframeToolbar.addEventListener('click', (e) => { /* ... */ });
        drawLineBtn.addEventListener('click', () => chartEngine.toggleDrawingMode());
        undoBtn.addEventListener('click', () => chartEngine.undoLastDrawing());
        buyBtn.addEventListener('click', () => lastCandle && tradingEngine.openTrade('buy', lastCandle.close));
        sellBtn.addEventListener('click', () => lastCandle && tradingEngine.openTrade('sell', lastCandle.close));
        saveSessionBtn.addEventListener('click', () => { /* ... */ });
        loadSessionBtn.addEventListener('click', async () => { /* ... */ });

        exportTradesBtn.addEventListener('click', () => exportTradesToCSV(tradingEngine.tradeHistory));
        exportSessionBtn.addEventListener('click', () => {
            const sessionData = {
                tradeHistory: tradingEngine.tradeHistory,
                drawings: chartEngine.drawingHistory.map(line => line.options()),
                capital: tradingEngine.capital,
            };
            exportSessionToJSON(sessionData);
        });
        importSessionInput.addEventListener('change', (event) => { /* ... */ });
        
        // ... (coller le reste des listeners depuis ma réponse précédente)

        window.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
            switch(e.code) {
                case 'Space': e.preventDefault(); replayEngine.togglePlayPause(); break;
                case 'ArrowRight': e.preventDefault(); replayEngine.stepForward(); break;
            }
        });

    } catch (error) {
        console.error("Erreur critique:", error);
    }
});