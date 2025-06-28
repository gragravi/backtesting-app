/**
 * workerFactory.js — Crée une instance de Web Worker compatible Vite/ESM
 * Usage : const worker = createWorker('../core/csvWorker.js');
 */

export function createWorker(workerPath) {
  // Vite supporte l'import de workers via new Worker(new URL(..., import.meta.url))
  return new Worker(new URL(workerPath, import.meta.url), { type: 'module' });
}