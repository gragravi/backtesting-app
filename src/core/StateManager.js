/**
 * StateManager - Gestion centralisée de l'état de l'application
 * Permet de stocker, récupérer et écouter les changements d'état de façon réactive.
 * Utilisation simple, extensible pour l'ensemble du projet.
 */

class StateManager {
  constructor(initialState = {}) {
    this.state = { ...initialState };
    this.listeners = new Map();
  }

  /**
   * Récupère la valeur d'une clé d'état
   * @param {string} key
   * @returns {*}
   */
  get(key) {
    return this.state[key];
  }

  /**
   * Définit une nouvelle valeur et notifie les abonnés
   * @param {string} key
   * @param {*} value
   */
  set(key, value) {
    const oldValue = this.state[key];
    this.state[key] = value;
    this.notify(key, value, oldValue);
  }

  /**
   * Abonne une fonction à un changement d'état
   * @param {string} key
   * @param {Function} callback
   * @returns {Function} unsubscribe
   */
  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);

    // Retourne la fonction de désabonnement
    return () => {
      this.listeners.get(key)?.delete(callback);
    };
  }

  /**
   * Notifie tous les abonnés d'une clé
   * @param {string} key
   * @param {*} newValue
   * @param {*} oldValue
   */
  notify(key, newValue, oldValue) {
    if (!this.listeners.has(key)) return;
    for (const cb of this.listeners.get(key)) {
      cb(newValue, oldValue);
    }
  }

  /**
   * Récupère tout l'état (lecture seule)
   */
  getState() {
    return { ...this.state };
  }
}

// Instance unique à utiliser dans toute l'app
export const stateManager = new StateManager({
  // Exemple d'état initial
  replayStatus: 'STOPPED',      // STOPPED, LOADING, PLAYING, PAUSED
  currentDatetime: null,
  selectedPair: 'EURUSD',
  account: {
    balance: 10000,
    margin: 0,
    freeMargin: 10000
  },
  positions: [],
  orders: [],
  notifications: []
});