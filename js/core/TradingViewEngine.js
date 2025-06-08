import EventManager from './EventManager.js';

export class TradingViewEngine {
    constructor(chartContainerId, equityContainerId) {
        this.chart = null;
        this.candleSeries = null;
        this.container = document.getElementById(chartContainerId);
        
        this.equityChart = null;
        this.equitySeries = null;
        this.equityContainer = document.getElementById(equityContainerId);

        this.isDrawingMode = false;
        this.drawingHistory = [];
        this.selectedLine = null;
        this.tradeLines = {};

        if (!this.container) throw new Error(`Conteneur principal introuvable: #${chartContainerId}`);
        if (!this.equityContainer) console.warn(`Conteneur d'équité introuvable: #${equityContainerId}`);
    }

    init() {
        // Options du graphique principal
        const chartOptions = {
            layout: { background: { color: '#1f2937' }, textColor: '#d1d5db' },
            grid: { vertLines: { color: '#374151' }, horzLines: { color: '#374151' } },
            crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
            rightPriceScale: { borderColor: '#4b5563' },
            timeScale: { borderColor: '#4b5563', timeVisible: true, secondsVisible: false }
        };
        this.chart = LightweightCharts.createChart(this.container, chartOptions);

        const seriesOptions = {
            upColor: '#22c55e', downColor: '#ef4444',
            borderDownColor: '#ef4444', borderUpColor: '#22c55e',
            wickDownColor: '#ef4444', wickUpColor: '#22c55e'
        };
        this.candleSeries = this.chart.addCandlestickSeries(seriesOptions);

        // Initialisation du graphique d'équité
        if (this.equityContainer) {
            const equityChartOptions = {
                layout: { background: { color: '#1f2937' }, textColor: '#d1d5db' },
                grid: { vertLines: { color: '#374151' }, horzLines: { color: '#374151' } },
                timeScale: { visible: false },
                rightPriceScale: { borderVisible: false }
            };
            this.equityChart = LightweightCharts.createChart(this.equityContainer, equityChartOptions);
            this.equitySeries = this.equityChart.addLineSeries({ color: '#2962FF', lineWidth: 2 });
        }

        // Abonnements aux événements
        this.chart.subscribeClick(this.handleChartClick.bind(this));
        window.addEventListener('resize', this.resizeChart.bind(this));
        window.addEventListener('keydown', this.handleKeyDown.bind(this));

        EventManager.on('replay:data-update', (data) => this.setData(data));
        EventManager.on('replay:new-candle', (candle) => this.addCandle(candle));
        EventManager.on('trade:opened', (position) => this.drawTradeLines(position));
        EventManager.on('trade:closed', (trade) => {
            this.removeTradeLines();
            if (this.equityContainer) this.updateEquityCurve(trade);
        });
    }

    updateEquityCurve(trade) {
        if (this.equitySeries) {
            this.equitySeries.update({ time: trade.time, value: trade.newCapital });
        }
    }

    drawTradeLines(position) {
        this.removeTradeLines();
        this.tradeLines.entry = this.candleSeries.createPriceLine({ price: position.entryPrice, color: '#ffffff', lineWidth: 2, lineStyle: LightweightCharts.LineStyle.Dashed, axisLabelVisible: true, title: 'Entrée' });
        this.tradeLines.sl = this.candleSeries.createPriceLine({ price: position.sl, color: '#ef4444', lineWidth: 2, lineStyle: LightweightCharts.LineStyle.Dotted, axisLabelVisible: true, title: 'SL' });
        this.tradeLines.tp = this.candleSeries.createPriceLine({ price: position.tp, color: '#22c55e', lineWidth: 2, lineStyle: LightweightCharts.LineStyle.Dotted, axisLabelVisible: true, title: 'TP' });
    }

    removeTradeLines() {
        if (this.tradeLines.entry) this.candleSeries.removePriceLine(this.tradeLines.entry);
        if (this.tradeLines.sl) this.candleSeries.removePriceLine(this.tradeLines.sl);
        if (this.tradeLines.tp) this.candleSeries.removePriceLine(this.tradeLines.tp);
        this.tradeLines = {};
    }

    handleChartClick(param) {
        if (!param.point) { this.deselectLine(); return; }
        if (this.isDrawingMode) {
            const price = this.candleSeries.coordinateToPrice(param.point.y);
            this.createHorizontalLine(price);
            this.isDrawingMode = false;
            this.container.style.cursor = 'default';
            return;
        }
        const clickedLine = this.findClickedLine(param);
        if (clickedLine) { this.selectLine(clickedLine); } else { this.deselectLine(); }
    }

    createHorizontalLine(price) {
        const line = this.candleSeries.createPriceLine({ price, color: '#2962FF', lineWidth: 2, lineStyle: LightweightCharts.LineStyle.Solid, axisLabelVisible: true, title: '' });
        this.drawingHistory.push(line);
    }

    toggleDrawingMode() {
        this.isDrawingMode = !this.isDrawingMode;
        this.container.style.cursor = this.isDrawingMode ? 'crosshair' : 'default';
    }

    undoLastDrawing() {
        const lastLine = this.drawingHistory.pop();
        if (lastLine) this.candleSeries.removePriceLine(lastLine);
    }

    handleKeyDown(event) {
        if (event.ctrlKey && (event.key === 'z' || event.key === 'Z')) { event.preventDefault(); this.undoLastDrawing(); }
        if (event.key === 'Delete' && this.selectedLine) { this.removeSelectedLine(); }
    }

    findClickedLine(param) {
        const clickY = param.point.y;
        const CLICK_THRESHOLD_PX = 5;
        for (const line of this.drawingHistory) {
            const lineY = this.candleSeries.priceToCoordinate(line.options().price);
            if (Math.abs(lineY - clickY) < CLICK_THRESHOLD_PX) return line;
        }
        return null;
    }

    selectLine(line) {
        this.deselectLine();
        this.selectedLine = line;
        line.applyOptions({ color: '#FFEB3B', lineWidth: 3 });
    }

    deselectLine() {
        if (this.selectedLine) {
            this.selectedLine.applyOptions({ color: '#2962FF', lineWidth: 2 });
        }
        this.selectedLine = null;
    }

    removeSelectedLine() {
        if (this.selectedLine) {
            const lineToRemove = this.selectedLine;
            this.candleSeries.removePriceLine(lineToRemove);
            this.drawingHistory = this.drawingHistory.filter(l => l !== lineToRemove);
            this.selectedLine = null;
        }
    }

    resizeChart() {
        if (this.chart && this.container) {
            this.chart.resize(this.container.clientWidth, this.container.clientHeight);
        }
        if (this.equityChart && this.equityContainer) {
            this.equityChart.resize(this.equityContainer.clientWidth, this.equityContainer.clientHeight);
        }
    }

    setData(data) {
        if (!this.candleSeries) return;
        this.candleSeries.setData(data);
        this.chart.timeScale().fitContent();
    }

    addCandle(candle) {
        if (!this.candleSeries) return;
        this.candleSeries.update(candle);
    }
}
