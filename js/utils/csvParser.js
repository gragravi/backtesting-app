export async function parseCSV(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        const lines = csvText.trim().split('\n');
        
        const header = lines[0].split(',');
        const data = lines.slice(1).map(line => {
            const values = line.split(',');
            return {
                time: values[0],
                open: parseFloat(values[1]),
                high: parseFloat(values[2]),
                low: parseFloat(values[3]),
                close: parseFloat(values[4]),
                volume: parseFloat(values[5])
            };
        });
        
        return data;
    } catch (error) {
        console.error("Erreur lors du parsing du CSV:", error);
        return [];
    }
}
