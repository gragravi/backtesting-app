/**
 * EventManager (Singleton Pattern)
 * Fournit un bus d'événements centralisé pour la communication inter-modules.
 * Utilisation :
 * import EventManager from './EventManager.js';
 * EventManager.on('mon-evenement', (data) => { console.log(data); });
 * EventManager.emit('mon-evenement', { info: 'utile' });
 */
class EventManager {
    constructor() {
        // Pour éviter d'être instancié plusieurs fois, on vérifie si une instance existe déjà.
        if (EventManager.instance) {
            return EventManager.instance;
        }
        this.events = {};
        EventManager.instance = this;
    }

    /**
     * S'abonne à un événement.
     * @param {string} eventName - Le nom de l'événement.
     * @param {function} listener - La fonction à exécuter lorsque l'événement est émis.
     * @returns {function} Une fonction pour se désabonner.
     */
    on(eventName, listener) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(listener);
        
        // Retourne une fonction de désabonnement
        return () => {
            this.events[eventName] = this.events[eventName].filter(l => l !== listener);
        };
    }

    /**
     * Émet un événement, déclenchant tous les écouteurs abonnés.
     * @param {string} eventName - Le nom de l'événement à émettre.
     * @param {*} data - Les données à passer aux écouteurs.
     */
    emit(eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(listener => listener(data));
        }
    }
}

// Exporte une instance unique (Singleton) pour que toute l'app partage le même EventManager.
const instance = new EventManager();
export default instance;
