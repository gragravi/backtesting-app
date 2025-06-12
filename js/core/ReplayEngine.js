// js/core/ReplayEngine.js

import { TradingViewEngine } from './TradingViewEngine.js';

let allHistoricalData = [];

function onReplayPointSelected(time) {
    // --- MODIFICATION : On affiche juste le nombre, pas l'objet Date ---
    console.log(`Point de départ validé (timestamp): ${time}`);
    // La prochaine étape sera ici : couper le graphique
}

export const ReplayEngine = {
    setHistoricalData(data) {
        allHistoricalData = data;
    },
    startReplaySetup() {
        console.log('Activation du mode de sélection Replay...');
        TradingViewEngine.activateReplaySelection(onReplayPointSelected);
    }
};