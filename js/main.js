import { parseCSV } from './utils/csvParser.js';
import { TradingViewEngine } from './core/TradingViewEngine.js';
import { ReplayEngine } from './core/ReplayEngine.js';
import { TradingEngine } from './core/TradingEngine.js';
import EventManager from './core/EventManager.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log("Application initialisée.");

    try {
        // --- TOUT DOIT ÊTRE À L'INTÉRIEUR DU BLOC TRY ---

        // 1. Références aux éléments du DOM
        const playPauseBtn = document.getElementById('play-pause-btn');
        const stepForwardBtn = document.getElementById('step-forward-btn');
        const speedSelect = document.getElementById('speed-select');
        const drawLineBtn = document.getElementById('draw-horizontal-line-btn');
        const undoBtn = document.getElementById('undo-btn');
        const buyBtn = document.getElementById('buy-btn');
        const sellBtn = document.getElementById('sell-btn');
        const statusNoPos = document.getElementById('status-no-position');
        const statusOpenPos = document.getElementById('status-open-position');
        const posType = document.getElementById('position-type');
        const posEntry = document.getElementById('position-entry');
        const posPnl = document.getElementById('position-pnl');
        const statsCapital = document.getElementById('stats-capital');
        const statsTotalPnl = document.getElementById('stats-total-pnl');
        const statsTotalTrades = document.getElementById('stats-total-trades');
        const statsWinRate = document.getElementById('stats-win-rate');

        // 2. Initialiser les moteurs
        const chartEngine = new TradingViewEngine('chart-container', 'equity-chart-container');
        const replayEngine = new ReplayEngine();
        const tradingEngine = new TradingEngine();
        chartEngine.init();

        // 3. Charger les données
        let lastCandle = null;
        const candleData = await parseCSV('data/sample.csv');
        if (candleData && candleData.length > 0) {
            replayEngine.loadData(candleData);
        }

        // 4. Connecter les modules entre eux
        EventManager.on('replay:new-candle', (candle) => {
            lastCandle = candle;
            tradingEngine.update(candle);
        });

        // 5. Connecter l'UI aux moteurs
        playPauseBtn.addEventListener('click', () => replayEngine.togglePlayPause());
        stepForwardBtn.addEventListener('click', () => replayEngine.stepForward());
        speedSelect.addEventListener('change', (e) => replayEngine.setSpeed(parseInt(e.target.value, 10)));
        drawLineBtn.addEventListener('click', () => chartEngine.toggleDrawingMode());
        undoBtn.addEventListener('click', () => chartEngine.undoLastDrawing());
        buyBtn.addEventListener('click', () => lastCandle && tradingEngine.openTrade('buy', lastCandle.close));
        sellBtn.addEventListener('click', () => lastCandle && tradingEngine.openTrade('sell', lastCandle.close));

        // 6. Gérer les mises à jour de l'UI
        EventManager.on('replay:state-change', ({ isPlaying }) => { playPauseBtn.textContent = isPlaying ? 'Pause' : 'Play'; });

        EventManager.on('trade:opened', (pos) => {
            statusNoPos.classList.add('hidden');
            statusOpenPos.classList.remove('hidden');
            posType.textContent = pos.type.toUpperCase();
            posType.className = `font-mono ${pos.type === 'buy' ? 'text-green-400' : 'text-red-400'}`;
            posEntry.textContent = pos.entryPrice.toFixed(2);
            posPnl.textContent = '0.00';
        });

        EventManager.on('trade:closed', () => {
            statusNoPos.classList.remove('hidden');
            statusOpenPos.classList.add('hidden');
        });

        EventManager.on('trade:pnl-update', ({ pnl }) => {
            posPnl.textContent = pnl.toFixed(2);
            posPnl.className = `font-mono ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`;
        });

        EventManager.on('stats:updated', (stats) => {
            statsCapital.textContent = stats.capital.toFixed(2);
            statsTotalPnl.textContent = stats.totalPnl.toFixed(2);
            statsTotalPnl.className = `font-mono ${stats.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`;
            statsTotalTrades.textContent = stats.totalTrades;
            statsWinRate.textContent = `${stats.winRate.toFixed(1)}%`;
        });

    } catch (error) {
        console.error("Erreur critique au démarrage:", error);
        document.body.innerHTML = '<div class="text-red-500 text-center p-8"><h1>Erreur critique</h1><p>Impossible de charger l\'application. Vérifiez la console.</p></div>';
    }
});
