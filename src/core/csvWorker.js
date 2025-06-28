/**
 * csvWorker.js — Web Worker pour le parsing rapide des chunks CSV
 * Les données reçues sont parsées ligne par ligne puis renvoyées.
 */

// Pour éviter d'importer des modules externes dans un worker, on fait simple.
self.onmessage = function (e) {
  const { chunk, headers } = e.data;
  const lines = chunk.split('\n');
  const result = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || (i === 0 && headers && line === headers.join(','))) continue;
    const values = line.split(',');
    if (values.length < 6) continue;
    const [datetime, open, high, low, close, volume] = values;
    result.push({
      datetime,
      open: Number(open),
      high: Number(high),
      low: Number(low),
      close: Number(close),
      volume: Number(volume)
    });
  }

  self.postMessage({ candles: result });
};