// Fichier : js/utils/csvParser.js (Version Complète)

/**
 * Lit un fichier CSV de données de bougies et le transforme en tableau d'objets.
 * Conçu pour le format Dukascopy : "Gmt time,Open,High,Low,Close,Volume"
 * @param {string} filePath - Le chemin vers le fichier CSV.
 * @returns {Promise<Array<Object>>} Une promesse qui se résout avec les données parsées.
 */
export async function parseCSVData(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const csvText = await response.text();
        const rows = csvText.trim().split('\n');

        // On ignore la première ligne (l'en-tête)
        const data = rows.slice(1).map(row => {
            const [gmtTime, open, high, low, close] = row.split(',');

            // Convertit la date du format "dd.MM.yyyy HH:mm:ss.SSS" en timestamp UNIX
            const [datePart, timePart] = gmtTime.split(' ');
            const [day, month, year] = datePart.split('.');
            const isoDate = `${year}-${month}-${day}T${timePart.slice(0, 8)}Z`; // On prend HH:mm:ss et on ajoute Z pour UTC
            
            const timestamp = Math.floor(new Date(isoDate).getTime() / 1000);

            return {
                time: timestamp,
                open: parseFloat(open),
                high: parseFloat(high),
                low: parseFloat(low),
                close: parseFloat(close),
            };
        }).filter(candle => !isNaN(candle.time)); // Filtre les lignes invalides (au cas où)

        console.log(`[csvParser] ${data.length} bougies chargées et parsées.`);
        return data;
    } catch (error) {
        console.error("[csvParser] Erreur lors de la lecture du fichier CSV:", error);
        return []; // Retourne un tableau vide en cas d'erreur
    }
}