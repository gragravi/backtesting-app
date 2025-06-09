/**
 * Charge et parse des données OHLCV depuis un fichier CSV.
 */
export async function parseCSV(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        const lines = csvText.trim().split('\n');
        
        const data = lines.slice(1).map(line => {
            const [time, open, high, low, close, volume] = line.split(',');
            return {
                time: time, // On garde la chaîne de caractères pour l'instant
                open: parseFloat(open),
                high: parseFloat(high),
                low: parseFloat(low),
                close: parseFloat(close),
                volume: parseFloat(volume)
            };
        });
        
        return data;
    } catch (error) {
        console.error("Erreur lors du parsing du CSV:", error);
        return [];
    }
}