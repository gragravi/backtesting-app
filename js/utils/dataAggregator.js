/**
 * Agrége des données OHLCV à une nouvelle unité de temps.
 * @param {Array<Object>} data - Les données sources (doivent être en M1).
 * @param {number} targetTimeframe - L'unité de temps cible en minutes (ex: 5 pour M5).
 * @returns {Array<Object>} Les données agrégées.
 */
export function aggregateData(data, targetTimeframe) {
    if (targetTimeframe === 1) {
        return data.map(candle => {
            const date = new Date(candle.time);
            return { ...candle, time: date.getTime() / 1000 };
        });
    }

    const aggregatedData = [];
    let currentCandle = null;

    for (const candle of data) {
        const candleDate = new Date(candle.time);
        const minutes = candleDate.getUTCMinutes();
        
        // Début d'une nouvelle bougie agrégée
        if (minutes % targetTimeframe === 0) {
            if (currentCandle) {
                aggregatedData.push(currentCandle);
            }
            
            const newCandleTimestamp = Math.floor(candleDate.getTime() / (targetTimeframe * 60 * 1000)) * (targetTimeframe * 60);

            currentCandle = {
                time: newCandleTimestamp,
                open: candle.open,
                high: candle.high,
                low: candle.low,
                close: candle.close,
                volume: candle.volume,
            };
        } else if (currentCandle) {
            // Mise à jour de la bougie agrégée en cours
            currentCandle.high = Math.max(currentCandle.high, candle.high);
            currentCandle.low = Math.min(currentCandle.low, candle.low);
            currentCandle.close = candle.close;
            currentCandle.volume += candle.volume;
        }
    }

    // Ajouter la dernière bougie si elle existe
    if (currentCandle) {
        aggregatedData.push(currentCandle);
    }

    return aggregatedData;
}