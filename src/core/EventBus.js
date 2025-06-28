/**
 * EventBus - Système centralisé de publication/souscription d'événements.
 * Optimisé pour la performance, la prévention des cascades et le debug.
 */

class EventBus {
  constructor() {
    this.listeners = {};
    this.eventQueue = [];
    this.isBatching = false;
    this.debug = false;
  }

  /**
   * Active ou désactive le mode debug
   * @param {boolean} value
   */
  setDebug(value) {
    this.debug = value;
  }

  /**
   * S'abonner à un événement
   * @param {string} event
   * @param {Function} callback
   * @returns {Function} unsubscribe
   */
  subscribe(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }
    this.listeners[event].add(callback);

    if (this.debug) {
      console.log(`[EventBus] Subscribed to "${event}"`);
    }

    return () => this.unsubscribe(event, callback);
  }

  /**
   * Se désabonner d'un événement
   * @param {string} event
   * @param {Function} callback
   */
  unsubscribe(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].delete(callback);
      if (this.debug) {
        console.log(`[EventBus] Unsubscribed from "${event}"`);
      }
    }
  }

  /**
   * Publier un événement (en batch)
   * @param {string} event
   * @param {*} payload
   * @param {object} [options] {priority: number}
   */
  publish(event, payload, options = {}) {
    this.eventQueue.push({ event, payload, priority: options.priority || 0 });

    if (!this.isBatching) {
      this.isBatching = true;
      setTimeout(() => this._flushQueue(), 0);
    }
  }

  /**
   * Vide la queue des événements (batch)
   */
  _flushQueue() {
    // Tri par priorité décroissante
    this.eventQueue.sort((a, b) => b.priority - a.priority);

    for (const { event, payload } of this.eventQueue) {
      if (this.listeners[event]) {
        for (const cb of this.listeners[event]) {
          try {
            cb(payload);
          } catch (e) {
            if (this.debug) {
              console.error(`[EventBus] Error in "${event}" listener:`, e);
            }
          }
        }
      }
      if (this.debug) {
        console.log(`[EventBus] Event "${event}" dispatched`);
      }
    }
    this.eventQueue = [];
    this.isBatching = false;
  }
}

// Instance unique à utiliser dans toute l'app
export const eventBus = new EventBus();