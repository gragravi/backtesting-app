// js/main.js
import { parseCSVData } from './utils/csvParser.js';
import { TradingViewEngine } from './core/TradingViewEngine.js';
import { ReplayEngine } from './core/ReplayEngine.js';

const SYMBOL = 'EURUSD';
const DATA_PATH = 'data/EURUSD_M1_BID_2020-2025.csv';
const CHART_CONTAINER_ID = 'chart-container';

function updateHeader(symbol, price) {
    const flagsMap = { 'EURUSD': '🇪🇺🇺🇸', 'USDJPY': '🇺🇸🇯🇵', 'GBPUSD': '🇬🇧🇺🇸', 'BTCUSD': '₿🇺🇸' };
    document.getElementById('pair-flags').textContent = flagsMap[symbol] || '🏳️';
    document.getElementById('symbol-name').textContent = symbol;
    if (price) {
        document.getElementById('symbol-price').textContent = price.toFixed(5);
    } else {
        document.getElementById('symbol-price').textContent = '---';
    }
}

function setupReplayUI() {
    const replayBtn = document.getElementById('replay-btn');
    const replayModal = document.getElementById('replay-modal');
    const cancelReplayBtn = document.getElementById('cancel-replay-btn');
    const startReplayBtn = document.getElementById('start-replay-btn');
    const replayControls = document.getElementById('replay-controls');
    const forwardBtn = document.getElementById('replay-forward-btn');
    const backBtn = document.getElementById('replay-back-btn');
    const stopBtn = document.getElementById('replay-stop-btn');
    
    replayBtn.addEventListener('click', () => replayModal.classList.remove('hidden'));
    cancelReplayBtn.addEventListener('click', () => replayModal.classList.add('hidden'));

    startReplayBtn.addEventListener('click', () => {
        replayModal.classList.add('hidden');
        replayControls.classList.remove('hidden');
        const balance = document.getElementById('initial-balance').value;
        const dateStr = document.getElementById('start-date').value;
        ReplayEngine.start(dateStr, balance);
    });

    forwardBtn.addEventListener('click', () => ReplayEngine.stepForward());
    backBtn.addEventListener('click', () => ReplayEngine.stepBackward());
    stopBtn.addEventListener('click', () => {
        replayControls.classList.add('hidden');
        ReplayEngine.stop();
    });
}

async function initializeApp() {
    console.log("🚀 Initialisation de l'application...");
    TradingViewEngine.initChart(CHART_CONTAINER_ID);
    const historicalData = await parseCSVData(DATA_PATH);
    if (historicalData && historicalData.length > 0) {
        TradingViewEngine.setSeriesData(historicalData);
        ReplayEngine.setHistoricalData(historicalData);
        updateHeader(SYMBOL, TradingViewEngine.getLatestPrice());
        setupReplayUI();
    } else {
        console.error(`❌ Aucune donnée chargée.`);
        updateHeader(SYMBOL, null);
    }
}
document.addEventListener('DOMContentLoaded', initializeApp);