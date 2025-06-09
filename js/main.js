// NOUVEL IMPORT pour la librairie de graphique
import { createChart } from './libs/lightweight-charts.standalone.js';

import { parseCSV } from './utils/csvParser.js';
// TradingViewEngine n'est plus nécessaire car nous créons le graphique directement ici
// import { TradingViewEngine } from './core/TradingViewEngine.js'; 
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
    const replayEngine = new ReplayEngine();
    let tradingEngine = new TradingEngine();
    
    // --- Pour pouvoir relancer facilement le replay ---
    let lastSessionData = null;
    let lastTimeframe = 1;
    let originalData = null;

    try {
        // --- NOUVEAU CODE : INITIALISATION DU GRAPHIQUE ---
        const chartContainer = document.getElementById('chart-container');
        const chart = createChart(chartContainer, {
          width: chartContainer.clientWidth,
          height: chartContainer.clientHeight,
          layout: {
            background: { color: '#fff' },
            textColor: '#222',
          },
          grid: {
            vertLines: { color: '#f0f0f0' }, // Lignes plus claires
            horzLines: { color: '#f0f0f0' },
          },
          timeScale: {
            borderColor: '#ddd',
            timeVisible: true,
            secondsVisible: false,
          },
          priceScale: {
            borderColor: '#ddd',
          },
          crosshair: {
            mode: 1, // 0 = Normal, 1 = Magnet
          }
        });

        // Ajoute la série de bougies
        const candleSeries = chart.addCandlestickSeries({
          upColor: '#2ebd85',
          downColor: '#e74c3c',
          borderUpColor: '#2ebd85',
          borderDownColor: '#e74c3c',
          wickUpColor: '#2ebd85',
          wickDownColor: '#e74c3c',
        });

        // S'adapter au redimensionnement de la fenêtre
        window.addEventListener('resize', () => {
          chart.applyOptions({
            width: chartContainer.clientWidth,
            height: chartContainer.clientHeight,
          });
        });
        // --- FIN DU NOUVEAU CODE DE GRAPHIQUE ---


        // --- Références au DOM (existantes) ---
        const playPauseBtn = document.getElementById('play-pause-btn');
        const stepForwardBtn = document.getElementById('step-forward-btn');
        const speedSelect = document.getElementById('speed-select');
        // Les boutons de dessin ne fonctionneront plus car TradingViewEngine a été retiré
        // const drawLineBtn = document.getElementById('draw-horizontal-line-btn');
        // const undoBtn = document.getElementById('undo-btn');
        const buyBtn = document.getElementById('buy-btn');
        const sellBtn = document.getElementById('sell-btn');
        const saveSessionBtn = document.getElementById('save-session-btn');
        const loadSessionBtn = document.getElementById('load-session-btn');
        const timeframeToolbar = document.getElementById('timeframe-toolbar');
        const exportTradesBtn = document.getElementById('export-trades-csv-btn');
        const exportSessionBtn = document.getElementById('export-session-json-btn');
        const importSessionInput = document.getElementById('import-session-json-input');
        const replayBtn = document.getElementById('replay-btn');

        // --- Données ---
        originalData = await parseCSV('data/M1_sample.csv');
        let lastCandle = null;
        if (!originalData || originalData.length === 0) throw new Error("Données M1 introuvables");

        // --- Logique principale ---
        function startReplay(timeframe, sessionData = null) {
            lastTimeframe = timeframe;
            lastSessionData = sessionData;
            EventManager.emit('replay:reset');

            if (sessionData) {
                // Logique de chargement de session (inchangée)
                tradingEngine = new TradingEngine(sessionData.capital);
                tradingEngine.tradeHistory = sessionData.tradeHistory;
                tradingEngine.updateStats();
                sessionData.tradeHistory.forEach(trade => EventManager.emit('trade:closed', trade));
                // La restauration des dessins est désactivée car elle dépendait de l'ancien moteur
            } else {
                tradingEngine = new TradingEngine();
                tradingEngine.updateStats();
            }
            const aggregated = aggregateData(originalData, timeframe);
            
            // MODIFIÉ : On charge les données dans le graphique et le moteur de replay
            candleSeries.setData(aggregated); // Affiche toutes les données initiales
            replayEngine.loadData(aggregated); // Prépare le replay
        }
        
        startReplay(1);

        // --- Connexions ---
        // MODIFIÉ : Mettre à jour le graphique à chaque nouvelle bougie
        EventManager.on('replay:new-candle', candle => {
            lastCandle = candle; 
            tradingEngine.update(candle); 
            candleSeries.update(candle); // Ajoute la nouvelle bougie au graphique !
        });

        // UI -> Moteurs
        if (playPauseBtn) playPauseBtn.addEventListener('click', () => replayEngine.togglePlayPause());
        if (stepForwardBtn) stepForwardBtn.addEventListener('click', () => replayEngine.stepForward());
        // Les boutons de dessin sont désactivés pour le moment
        // if (drawLineBtn) drawLineBtn.addEventListener('click', () => { /* logique de dessin à réimplémenter */ });
        // if (undoBtn) undoBtn.addEventListener('click', () => { /* logique d'annulation à réimplémenter */ });
        if (buyBtn) buyBtn.addEventListener('click', () => lastCandle && tradingEngine.openTrade('buy', lastCandle.close));
        if (sellBtn) sellBtn.addEventListener('click', () => lastCandle && tradingEngine.openTrade('sell', lastCandle.close));
        
        // ... le reste de vos écouteurs d'événements ...
        if (exportTradesBtn) exportTradesBtn.addEventListener('click', () => exportTradesToCSV(tradingEngine.tradeHistory));
        if (exportSessionBtn) exportSessionBtn.addEventListener('click', () => {
            const sessionData = {
                tradeHistory: tradingEngine.tradeHistory,
                // drawings: [], // Les dessins sont désactivés
                capital: tradingEngine.capital,
            };
            exportSessionToJSON(sessionData);
        });

        if (replayBtn) {
            replayBtn.addEventListener('click', () => {
                startReplay(lastTimeframe, null);
            });
        }
        
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