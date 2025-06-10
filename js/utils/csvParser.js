// js/utils/csvParser.js

/**
 * Lit un fichier CSV de données Dukascopy de manière blindée et le transforme en un tableau
 * de bougies. Il ignore les lignes vides, mal formées ou incomplètes.
 * @param {string} filePath - Le chemin vers le fichier CSV.
 * @returns {Promise<Array<{time: number, open: number, high: number, low: number, close: number}>>}
 */
export async function parseCSVData(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) { throw new Error(`Erreur HTTP: ${response.status}`); }
        const csvText = await response.text();
        const lines = csvText.trim().split('\n');
        
        lines.shift(); // Enlève l'en-tête

        const data = lines
            .map((row, index) => {
                try {
                    if (!row || row.trim() === '') { return null; }

                    const [dateTime, openStr, highStr, lowStr, closeStr] = row.split(',');
                    
                    if (!dateTime || !openStr || !highStr || !lowStr || !closeStr) {
                        throw new Error("Ligne mal formée, données manquantes.");
                    }

                    const [datePart, timePart] = dateTime.split(' ');
                    const [day, month, year] = datePart.split('.');
                    const [hours, minutes] = timePart.split(':');

                    if (!day || !month || !year || !hours || !minutes) {
                        throw new Error("Format de date invalide.");
                    }
                    
                    const isoDate = `${year}-${month}-${day}T${hours}:${minutes}:00Z`;
                    const dateObject = new Date(isoDate);
                    const timestamp = Math.floor(dateObject.getTime() / 1000);

                    const open = parseFloat(openStr);
                    const high = parseFloat(highStr);
                    const low = parseFloat(lowStr);
                    const close = parseFloat(closeStr);

                    // --- AJOUT DE CETTE VÉRIFICATION FINALE ---
                    // Si une des valeurs n'est pas un nombre valide (NaN), on rejette la bougie.
                    if (isNaN(timestamp) || isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close)) {
                        throw new Error("Valeur non numérique (NaN) détectée.");
                    }
                    // --- FIN DE L'AJOUT ---

                    return { time: timestamp, open, high, low, close };

                } catch (error) {
                    console.warn(`⚠️ Ligne CSV invalide (n°${index + 2}) ignorée. Raison: ${error.message}`);
                    return null;
                }
            })
            .filter(Boolean);

        if (data.length === 0 && lines.length > 0) {
            console.error("❌ Aucune donnée valide n'a pu être extraite du CSV.");
        } else {
            console.log(`✅ Fichier CSV parsé : ${data.length} bougies valides chargées.`);
        }
        
        return data;

    } catch (error) {
        console.error("❌ Erreur majeure lors du parsing du fichier CSV:", error);
        return [];
    }
}