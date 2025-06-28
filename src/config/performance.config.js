export const PERFORMANCE_CONFIG = {
  CHUNK_SIZE: 50000,           // Lignes par chunk pour le parsing CSV
  CACHE_SIZE: 100000,          // Bougies en mémoire vive
  UPDATE_INTERVAL: 16,         // ms (60 FPS)
  PREFETCH_BUFFER: 10000,      // Bougies préchargées en buffer
  MAX_WORKERS: 4,              // Nombre maximal de Web Workers
  COMPRESSION_LEVEL: 6,        // Niveau de compression (gzip)
  CACHE_TTL: 3600000           // Durée de vie du cache en ms (1h)
};