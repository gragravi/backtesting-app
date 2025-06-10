// js/core/StorageManager.js

import { parseCSV } from '../utils/csvParser.js';

export const StorageManager = (function() {
    let historicalData = [];

    // Fonction pour charger un fichier CSV et parser les données historiques
    async function loadCSVData(filePath) {
        // On va charger le fichier CSV depuis le dossier 'data'
        try {
            const response = await fetch(filePath);
            if (!response.ok) throw new Error('Fichier non trouvé: ' + filePath);
            const csvText = await response.text();

            // Utilise le parser CSV existant (dans js/utils/csvParser.js)
            const parsed = parseCSV(csvText);

            // On suppose que le CSV a les colonnes: time, open, high, low, close, volume
            // On formate pour Lightweight Charts (time doit être un timestamp/secondes UNIX)
            historicalData = parsed.map(row => ({
                time: parseInt(row.time), // Ex: 1622505600
                open: parseFloat(row.open),
                high: parseFloat(row.high),
                low: parseFloat(row.low),
                close: parseFloat(row.close),
                volume: row.volume ? parseFloat(row.volume) : undefined
            })).filter(row => !isNaN(row.time) && !isNaN(row.open));

            return historicalData;
        } catch (err) {
            console.error('Erreur lors du chargement du CSV:', err);
            return [];
        }
    }

    // Fonction pour obtenir les données déjà chargées
    function getHistoricalData() {
        return historicalData;
    }

    // (Pour extension) Fonction pour nettoyer ou remplacer les données
    function clearData() {
        historicalData = [];
    }

    return {
        loadCSVData,
        getHistoricalData,
        clearData
    };
})();