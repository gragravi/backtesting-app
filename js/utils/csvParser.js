// js/utils/csvParser.js

export async function parseCSVData(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        
        const csvText = await response.text();
        const lines = csvText.trim().split('\n');
        
        lines.shift(); // Enlève l'en-tête

        const data = lines
            .map(row => {
                if (!row.trim()) return null; // --- Ignore les lignes vides ---

                const [dateTime, open, high, low, close] = row.split(',');

                // --- Vérifie que toutes les données de base sont présentes ---
                if (!dateTime || !open || !high || !low || !close) return null;

                const [datePart, timePart] = dateTime.split(' ');
                if (!datePart || !timePart) return null;

                const [day, month, year] = datePart.split('.');
                const [hours, minutes] = timePart.split(':');
                if (!year || !month || !day || !hours || !minutes) return null;

                const isoDate = `${year}-${month}-${day}T${hours}:${minutes}:00Z`;
                const dateObject = new Date(isoDate);

                const timestamp = Math.floor(dateObject.getTime() / 1000);
                if (isNaN(timestamp)) return null; // --- Vérifie que la date est valide ---

                return {
                    time: timestamp,
                    open: parseFloat(open),
                    high: parseFloat(high),
                    low: parseFloat(low),
                    close: parseFloat(close),
                };
            })
            .filter(candle => candle !== null); // --- Garde uniquement les bougies valides ---

        console.log(`✅ Fichier CSV parsé : ${data.length} bougies valides chargées.`);
        return data.sort((a, b) => a.time - b.time); // Assure-toi que tout est bien trié

    } catch (error) {
        console.error("❌ Erreur lors du parsing du fichier CSV:", error);
        return [];
    }
}