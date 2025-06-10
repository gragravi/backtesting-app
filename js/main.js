// Fichier : js/main.js (Version FINALE et Corrigée)

import { parseCSVData } from './utils/csvParser.js';
import { TradingViewEngine } from './core/TradingViewEngine.js';
// Les autres imports seront utilisés dans les prochaines phases
// import { ReplayEngine } from './core/ReplayEngine.js';
// import { TradingEngine } from './core/TradingEngine.js';
// import EventManager from './core/EventManager.js';

// Fonction principale asynchrone pour initialiser l'application
async function initializeApp() {
    console.log("🚀 Initialisation de l'application de backtesting...");
    
    try {
        // --- 1. Initialisation du moteur de graphique ---
        // Il prend l'ID du conteneur dans index.html
        const chartEngine = new TradingViewEngine('chart-container');

        // --- 2. Chargement des données historiques ---
        // ON UTILISE LE BON NOM DE FICHIER CORRIGÉ ICI
        const historicalData = await parseCSVData('data/EURUSD_M1_BID_2020-2025.csv');
        
        if (!historicalData || historicalData.length === 0) {
            throw new Error("Le chargement des données a échoué. Vérifiez le chemin du fichier et le contenu.");
        }
        
        // --- 3. Affichage des données sur le graphique ---
        // On passe toutes les données chargées au moteur de graphique
        chartEngine.setData(historicalData);
        
        console.log("✅ Application initialisée avec succès ! Le graphique est prêt.");

        // La logique pour le ReplayEngine, TradingEngine, etc. sera ajoutée ici dans les prochaines étapes.

    } catch (error) {
        console.error("❌ Erreur critique lors de l'initialisation :", error);
        // On pourrait afficher un message d'erreur à l'utilisateur ici
        document.body.innerHTML = `<div style="padding: 20px; text-align: center; color: red;">
            <h1>Erreur de chargement</h1>
            <p>${error.message}</p>
            <p>Veuillez vérifier la console (F12) pour plus de détails.</p>
        </div>`;
    }
}

// On attend que le DOM soit complètement chargé pour lancer notre application
document.addEventListener('DOMContentLoaded', initializeApp);