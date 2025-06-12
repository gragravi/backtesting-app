// js/main.js

import { parseCSVData } from './utils/csvParser.js';
import { TradingViewEngine } from './core/TradingViewEngine.js';
import { ReplayEngine } from './core/ReplayEngine.js';

const SYMBOL = 'EURUSD';
const DATA_PATH = 'data/EURUSD_M1_BID_2020-2025.csv';
const CHART_CONTAINER_ID = 'chart-container';

// --- FONCTION DE MISE À JOUR DE L'EN-TÊTE RESTAURÉE ---
function updateHeader(symbol, price) {
    const flagsMap = {
        'EURUSD': '🇪🇺🇺🇸', 'USDJPY': '🇺🇸🇯🇵', 'GBPUSD': '🇬🇧🇺🇸',
        'BTCUSD': '₿🇺🇸'
    };

    document.getElementById('pair-flags').textContent = flagsMap[symbol] || '🏳️';
    document.getElementById('symbol-name').textContent = symbol;
    
    if (price) {
        document.getElementById('symbol-price').textContent = price.toFixed(5);
    } else {
        document.getElementById('symbol-price').textContent = '---';
    }
}

function setupReplayUI(allData) {
    const replayBtn = document.getElementById('replay-btn');
    const replayModal = document.getElementById('replay-modal');
    const cancelReplayBtn = document.getElementById('cancel-replay-btn');
    const startReplayBtn = document.getElementById('start-replay-btn');

    replayBtn.addEventListener('click', () => {
        replayModal.classList.remove('hidden');
    });

    cancelReplayBtn.addEventListener('click', () => {
        replayModal.classList.add('hidden');
    });

    startReplayBtn.addEventListener('click', () => {
        const balance = document.getElementById('initial-balance').value;
        const date = document.getElementById('start-date').value;
        
        console.log(`Démarrage du replay avec Capital: ${balance}, Date: ${date}`);
        
        replayModal.classList.add('hidden');
    });
}

async function initializeApp() {
    console.log("🚀 Initialisation de l'application...");
    
    TradingViewEngine.initChart(CHART_CONTAINER_ID);
    
    const historicalData = await parseCSVData(DATA_PATH);

    if (historicalData && historicalData.length > 0) {
        TradingViewEngine.setSeriesData(historicalData);
        // ReplayEngine.setHistoricalData(historicalData); // On garde ça pour plus tard

        // On met à jour l'en-tête après avoir injecté les données
        updateHeader(SYMBOL, TradingViewEngine.getLatestPrice());

        setupReplayUI(historicalData);
    } else {
        console.error(`❌ Aucune donnée chargée.`);
        updateHeader(SYMBOL, null);
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);