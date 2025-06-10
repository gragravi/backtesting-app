// js/core/ReplayEngine.js

import { TradingViewEngine } from './TradingViewEngine.js';

let isSetupActive = false;
let allHistoricalData = [];
let replayStartIndex = -1;

function onReplayPointSelected(time) {
    console.log(`POINT DE DÉPART REPLAY SÉLECTIONNÉ :`, new Date(time * 1000).toLocaleString());
    
    // Pour l'instant, on ne fait rien de plus. 
    // La prochaine étape sera de "couper" le graphique ici.
    isSetupActive = false;
}

export const ReplayEngine = {
    /**
     * Stocke les données historiques complètes pour le replay.
     * @param {Array} data - Le tableau complet des bougies.
     */
    setHistoricalData(data) {
        allHistoricalData = data;
        console.log(`ReplayEngine: ${data.length} bougies mémorisées pour le replay.`);
    },

    /**
     * Démarre le processus de sélection du point de départ du replay.
     */
    startReplaySetup() {
        if (isSetupActive) {
            console.log('Le mode de sélection Replay est déjà actif.');
            return;
        }
        
        console.log('Activation du mode de sélection Replay...');
        isSetupActive = true;
        
        // On demande au TradingViewEngine d'afficher la ligne de sélection
        // et de nous appeler (callback) quand un point est cliqué.
        TradingViewEngine.activateReplaySelection(onReplayPointSelected);
    }
};