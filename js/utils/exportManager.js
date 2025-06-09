// js/utils/exportManager.js

function download(filename, text) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

export function exportTradesToCSV(tradeHistory) {
    if (tradeHistory.length === 0) {
        alert("Aucun trade à exporter.");
        return;
    }
    
    let csvContent = "Type,EntryPrice,ExitPrice,SL,TP,PnL,Reason,Timestamp\n";
    tradeHistory.forEach(trade => {
        const row = [
            trade.type,
            trade.entryPrice.toFixed(2),
            trade.exitPrice.toFixed(2),
            trade.sl.toFixed(2),
            trade.tp.toFixed(2),
            trade.pnl.toFixed(2),
            trade.reason,
            new Date(trade.time * 1000).toISOString()
        ].join(',');
        csvContent += row + "\n";
    });

    download('trades.csv', csvContent);
}

export function exportSessionToJSON(sessionData) {
    const jsonContent = JSON.stringify(sessionData, null, 2); // Le '2' formate le JSON pour être lisible
    download('session.json', jsonContent);
}