// Fichier : js/core/TradingViewEngine.js (Version Complète)

// On importe la fonction createChart directement de la librairie
import { createChart } from '../libs/lightweight-charts.standalone.js';

export class TradingViewEngine {
    constructor(containerId) {
        this.chart = null;
        this.candleSeries = null;
        this.container = document.getElementById(containerId);

        if (!this.container) {
            throw new Error(`[TradingViewEngine] L'élément conteneur avec l'ID "${containerId}" n'a pas été trouvé.`);
        }
        this.initChart();
    }

    initChart() {
        this.chart = createChart(this.container, {
            width: this.container.clientWidth,
            height: this.container.clientHeight,
            layout: { background: { color: '#ffffff' }, textColor: '#333333' },
            grid: { vertLines: { color: '#f0f0f0' }, horzLines: { color: '#f0f0f0' } },
            crosshair: { mode: 1 }, // Mode aimanté
            timeScale: { timeVisible: true, secondsVisible: false },
        });

        this.candleSeries = this.chart.addCandlestickSeries({
            upColor: '#2ebd85',
            downColor: '#e74c3c',
            borderVisible: false,
            wickUpColor: '#2ebd85',
            wickDownColor: '#e74c3c',
        });

        // Gérer le redimensionnement de la fenêtre pour que le graphique s'adapte
        window.addEventListener('resize', () => {
            this.chart.resize(this.container.clientWidth, this.container.clientHeight);
        });
    }

    /**
     * Affiche une série de données de bougies sur le graphique.
     * @param {Array<Object>} data - Les données à afficher.
     */
    setData(data) {
        if (this.candleSeries && data.length > 0) {
            this.candleSeries.setData(data);
            console.log(`[TradingViewEngine] ${data.length} bougies affichées sur le graphique.`);
        } else {
            console.error("[TradingViewEngine] Aucune donnée à afficher ou la série de bougies n'est pas initialisée.");
        }
    }
}