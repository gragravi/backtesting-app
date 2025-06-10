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
// js/core/TradingViewEngine.js

// --- VARIABLES DU MODULE ---
let chart = null;
let candleSeries = null;
let lastData = null;

// --- AJOUT : Variables spécifiques au Replay ---
let replayLine = null;
let crosshairMoveSubscription = null;
let clickSubscription = null;
// --- FIN DE L'AJOUT ---

export const TradingViewEngine = {
    initChart(containerId) {
        const chartContainer = document.getElementById(containerId);
        if (!chartContainer) {
            console.error(`❌ L'élément conteneur #${containerId} n'a pas été trouvé.`);
            return;
        }

        chart = LightweightCharts.createChart(chartContainer, {
            // ... (options du graphique inchangées)
            width: chartContainer.clientWidth,
            height: chartContainer.clientHeight,
            layout: { background: { color: '#ffffff' }, textColor: '#222222' },
            grid: { vertLines: { color: '#eeeeee' }, horzLines: { color: '#eeeeee' } },
            timeScale: { timeVisible: true, secondsVisible: false, },
            // --- AJOUT : Crosshair (curseur en croix) pour la sélection ---
            crosshair: {
                mode: LightweightCharts.CrosshairMode.Normal,
            },
            // --- FIN DE L'AJOUT ---
        });

        candleSeries = chart.addCandlestickSeries({
            // ... (options de la série inchangées)
            upColor: '#2ebd85', downColor: '#e74c3c',
            borderUpColor: '#2ebd85', borderDownColor: '#e74c3c',
            wickUpColor: '#2ebd85', wickDownColor: '#e74c3c',
            priceFormat: { type: 'price', precision: 5, minMove: 0.00001, },
        });

        // --- AJOUT : Création de la ligne verticale de Replay (invisible au début) ---
        replayLine = chart.addVerticalLine({
            color: 'rgba(0, 120, 255, 0.7)',
            width: 2,
            style: LightweightCharts.LineStyle.Dashed,
            label: 'Replay Start',
            labelBackgroundColor: '#0078FF',
            labelTextColor: 'white',
            visible: false,
        });
        // --- FIN DE L'AJOUT ---

        console.log('✅ Moteur TradingView initialisé.');

        new ResizeObserver(entries => {
            if (entries.length > 0 && entries[0].contentRect.width > 0) {
                const { width, height } = entries[0].contentRect;
                chart.resize(width, height);
            }
        }).observe(chartContainer);
    },

    setSeriesData(data) {
        if (!candleSeries) {
            console.error('❌ La série de bougies n\'est pas initialisée.');
            return;
        }
        candleSeries.setData(data);
        lastData = data;
        console.log('✅ Données injectées dans le graphique.');
        chart.timeScale().fitContent();
    },

    getLatestPrice() {
        if (lastData && lastData.length > 0) {
            return lastData[lastData.length - 1].close;
        }
        return null;
    },

    // --- AJOUT : NOUVELLE FONCTION POUR LE REPLAY ---
    /**
     * Active le mode de sélection sur le graphique.
     * Affiche une ligne verticale qui suit la souris et attend un clic.
     * @param {function} onPointSelectedCallback - Fonction à appeler avec le timestamp quand un point est cliqué.
     */
    activateReplaySelection(onPointSelectedCallback) {
        // Rend la ligne de replay visible
        replayLine.applyOptions({ visible: true });

        // 1. Fait suivre la ligne verticale au curseur de la souris
        crosshairMoveSubscription = chart.subscribeCrosshairMove(param => {
            // Si le curseur est hors du graphique ou s'il n'y a pas de temps, on ne fait rien
            if (!param.time) {
                replayLine.applyOptions({ visible: false });
                return;
            }
            replayLine.applyOptions({ visible: true, time: param.time });
        });

        // 2. Attend un clic pour valider la sélection
        clickSubscription = chart.subscribeClick(param => {
            if (!param.time) return; // Ne pas valider si on clique en dehors des bougies

            // Nettoyage : on arrête d'écouter les mouvements et les clics
            chart.unsubscribeCrosshairMove(crosshairMoveSubscription);
            chart.unsubscribeClick(clickSubscription);
            replayLine.applyOptions({ visible: false }); // On cache la ligne de sélection

            // On appelle la fonction du ReplayEngine pour lui donner le point sélectionné
            onPointSelectedCallback(param.time);
        });
    }
    // --- FIN DE L'AJOUT ---
};