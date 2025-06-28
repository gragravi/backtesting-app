/**
 * DataManager - Gestion optimisée des données de marché (bougies)
 * - Chargement par chunks
 * - Parsing via Web Worker (optionnel)
 * - Interface d'accès centralisée pour tout le projet
 */

import { eventBus } from './EventBus';
import { PERFORMANCE_CONFIG } from '../config/performance.config.js';
import { createWorker } from './workerFactory.js';

// Structure de cache mémoire simple (pour évolution future)
const memoryCache = new Map(); // clé = position, valeur = tableau de bougies

class DataManager {
  constructor() {
    this.csvUrl = '/data/EURUSD_M1_BID_2020-2025.csv'; // chemin par défaut
    this.chunkSize = PERFORMANCE_CONFIG.CHUNK_SIZE;
    this.onDataLoaded = null;
    this.loading = false;
    this.totalRows = 0;
    this.headers = [];
    this.fileSize = 0;

    this.worker = null;
    this.useWorker = true; // On peut désactiver pour debug
  }

  initWorker() {
    if (!this.worker) {
      this.worker = createWorker('./csvWorker.js');
    }
  }

  parseChunkWithWorker(chunk, headers) {
    return new Promise((resolve) => {
      this.initWorker();
      this.worker.onmessage = (e) => {
        resolve(e.data.candles);
      };
      this.worker.postMessage({ chunk, headers });
    });
  }

  /**
   * Démarre le chargement du fichier CSV par chunks
   * @param {Object} [options] - {offset: number, onChunk: function}
   */
  async loadCSV({ offset = 0, onChunk = null } = {}) {
    if (this.loading) return;
    this.loading = true;

    // Récupère la taille du fichier pour info/progress bar
    const headResp = await fetch(this.csvUrl, { method: 'HEAD' });
    this.fileSize = Number(headResp.headers.get('Content-Length') || 0);

    // Flux de lecture du fichier
    const resp = await fetch(this.csvUrl);
    if (!resp.body) throw new Error('Streaming non supporté par ce navigateur.');

    const reader = resp.body.getReader();
    let partial = '';
    let received = 0;
    let chunkData = [];
    let firstChunk = true;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      received += value.length;
      const text = partial + new TextDecoder().decode(value);
      const lines = text.split('\n');
      partial = lines.pop(); // garde la dernière ligne (peut-être incomplète)

      for (let line of lines) {
        if (firstChunk) {
          this.headers = line.trim().split(',');
          firstChunk = false;
          continue;
        }
        if (!line.trim()) continue;
        chunkData.push(line);
        if (chunkData.length >= this.chunkSize) {
          let candles;
          if (this.useWorker) {
            candles = await this.parseChunkWithWorker(chunkData.join('\n'), this.headers);
          } else {
            candles = chunkData.map(this.parseLine);
          }
          memoryCache.set(offset, candles.slice());
          if (typeof onChunk === 'function') onChunk(candles.slice());
          eventBus.publish('data:chunkLoaded', { offset, chunk: candles.slice() });
          offset += candles.length;
          chunkData = [];
        }
      }
    }
    // Dernier chunk
    if (chunkData.length) {
      let candles;
      if (this.useWorker) {
        candles = await this.parseChunkWithWorker(chunkData.join('\n'), this.headers);
      } else {
        candles = chunkData.map(this.parseLine);
      }
      memoryCache.set(offset, candles);
      if (typeof onChunk === 'function') onChunk(candles);
      eventBus.publish('data:chunkLoaded', { offset, chunk: candles });
    }

    this.loading = false;
    eventBus.publish('data:allLoaded', { totalRows: offset });
  }

  /**
   * Parse une ligne CSV en objet bougie
   * @param {string} line
   * @returns {Object}
   */
  parseLine(line) {
    // Ex : 2020-01-01 00:00:00.000,1.12000,1.12100,1.11900,1.12050,0
    const values = line.trim().split(',');
    const [datetime, open, high, low, close, volume] = values;
    return {
      datetime: new Date(datetime),
      open: Number(open),
      high: Number(high),
      low: Number(low),
      close: Number(close),
      volume: Number(volume)
    };
  }

  /**
   * Permet de récupérer des bougies à partir d'une position (offset)
   * @param {number} offset
   * @param {number} count
   * @returns {Array}
   */
  getCandles(offset, count) {
    // Cherche dans le cache mémoire
    if (memoryCache.has(offset)) {
      return memoryCache.get(offset).slice(0, count);
    }
    // Pourra évoluer vers lecture IndexedDB ou fetch différé
    return [];
  }

  /**
   * Vide le cache mémoire (pour GC ou changement de période)
   */
  clearCache() {
    memoryCache.clear();
  }
}

export const dataManager = new DataManager();