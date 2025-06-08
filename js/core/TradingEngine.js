import EventManager from './EventManager.js';

export class TradingEngine {
    constructor(initialCapital = 10000) {
        this.initialCapital = initialCapital;
        this.capital = initialCapital;
        this.currentPosition = null;
        this.tradeHistory = [];
    }

    openTrade(type, currentPrice) {
        if (this.currentPosition) {
            console.warn("Une position est déjà ouverte.");
            return;
        }

        const riskAmount = this.capital * 0.01; // Risquer 1% du capital actuel par trade
        const slDistance = currentPrice * 0.02; // SL à 2% du prix pour l'exemple
        const positionSize = riskAmount / slDistance;

        const sl = type === 'buy' ? currentPrice - slDistance : currentPrice + slDistance;
        const tp = type === 'buy' ? currentPrice + (slDistance * 2) : currentPrice - (slDistance * 2); // RR de 2:1

        this.currentPosition = {
            type: type,
            entryPrice: currentPrice,
            sl: sl,
            tp: tp,
            size: positionSize,
            pnl: 0,
        };

        console.log(`Ouverture d'un trade ${type} @ ${currentPrice}`);
        EventManager.emit('trade:opened', this.currentPosition);
    }

    update(candle) {
        if (!this.currentPosition) return;

        const { high, low, close } = candle;
        let closedBy = null;

        if (this.currentPosition.type === 'buy') {
            if (low <= this.currentPosition.sl) closedBy = 'SL';
            if (high >= this.currentPosition.tp) closedBy = 'TP';
        } else { // 'sell'
            if (high >= this.currentPosition.sl) closedBy = 'SL';
            if (low <= this.currentPosition.tp) closedBy = 'TP';
        }

        if (closedBy) {
            const exitPrice = closedBy === 'SL' ? this.currentPosition.sl : this.currentPosition.tp;
            this.closeTrade(exitPrice, closedBy, candle.time);
        } else {
            const pnl = (close - this.currentPosition.entryPrice) * (this.currentPosition.type === 'buy' ? 1 : -1);
            this.currentPosition.pnl = pnl * this.currentPosition.size;
            EventManager.emit('trade:pnl-update', { pnl: this.currentPosition.pnl });
        }
    }

    closeTrade(exitPrice, reason, time) {
        if (!this.currentPosition) return;
        
        const pnl = (exitPrice - this.currentPosition.entryPrice) * (this.currentPosition.type === 'buy' ? 1 : -1);
        const finalPnl = pnl * this.currentPosition.size;
        this.capital += finalPnl;

        const tradeResult = {
            ...this.currentPosition,
            exitPrice,
            pnl: finalPnl,
            reason,
            time,
            newCapital: this.capital
        };

        this.tradeHistory.push(tradeResult);
        console.log(`Trade fermé. P&L: ${finalPnl.toFixed(2)}. Nouveau capital: ${this.capital.toFixed(2)}`);
        
        this.currentPosition = null;
        EventManager.emit('trade:closed', tradeResult);
        this.updateStats(); // Mettre à jour les stats globales
    }

    updateStats() {
        const totalTrades = this.tradeHistory.length;
        if (totalTrades === 0) return;

        const winningTrades = this.tradeHistory.filter(t => t.pnl > 0).length;
        const winRate = (winningTrades / totalTrades) * 100;
        const totalPnl = this.capital - this.initialCapital;

        const stats = {
            capital: this.capital,
            totalPnl: totalPnl,
            totalTrades: totalTrades,
            winRate: winRate,
        };

        EventManager.emit('stats:updated', stats);
    }
}
