// js/main.js

import { parseCSVData } from './utils/csvParser.js';
import { TradingViewEngine } from './core/TradingViewEngine.js';
// J'ai enlevé l'import de ReplayEngine

// --- CONSTANTES DE CONFIGURATION ---
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

async function initializeApp() {
    console.log("🚀 Initialisation de l'application (version stable)...");
    
    TradingViewEngine.initChart(CHART_CONTAINER_ID);
    
    console.log(`⏳ Chargement des données pour ${SYMBOL} depuis ${DATA_PATH}...`);
    const historicalData = await parseCSVData(DATA_PATH);

    if (historicalData && historicalData.length > 0) {
        console.log('⏳ Tri des données chronologiques...');
        historicalData.sort((a, b) => a.time - b.time);

        TradingViewEngine.setSeriesData(historicalData);
        // J'ai enlevé l'appel à ReplayEngine.setHistoricalData(historicalData);

        const lastPrice = TradingViewEngine.getLatestPrice();
        updateHeader(SYMBOL, lastPrice);
    } else {
        console.error(`❌ Aucune donnée n'a été chargée depuis ${DATA_PATH}.`);
        updateHeader(SYMBOL, null);
    }

    // Le bouton Replay ne fera rien pour l'instant, c'est normal.
    document.getElementById('replay-btn').onclick = (e) => {
        e.preventDefault();
        console.log('Bouton Replay cliqué (fonctionnalité désactivée temporairement).');
    };
}

document.addEventListener('DOMContentLoaded', initializeApp);