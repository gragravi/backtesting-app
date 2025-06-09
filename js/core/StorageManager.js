// js/core/StorageManager.js

export class StorageManager {
    constructor() {
        this.db = new Dexie('BacktestingAppDB');
        this.db.version(1).stores({
            sessions: 'id,timestamp', // 'id' est la clé primaire, 'timestamp' est un index
        });
    }

    // --- Préférences simples (LocalStorage) ---

    savePreference(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    loadPreference(key, defaultValue = null) {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
    }

    // --- Session de backtesting (IndexedDB via Dexie) ---

    async saveSession(sessionData) {
        try {
            // On sauvegarde la session avec un ID fixe (1) pour toujours écraser la dernière.
            // On pourrait faire un système plus complexe avec plusieurs sessions sauvegardées.
            const sessionToSave = {
                id: 1,
                timestamp: new Date(),
                data: sessionData,
            };
            await this.db.sessions.put(sessionToSave);
            console.log("Session sauvegardée avec succès !");
            return true;
        } catch (error) {
            console.error("Erreur lors de la sauvegarde de la session:", error);
            return false;
        }
    }

    async loadLastSession() {
        try {
            const session = await this.db.sessions.get(1);
            if (session) {
                console.log("Dernière session chargée.");
                return session.data;
            }
            console.log("Aucune session sauvegardée trouvée.");
            return null;
        } catch (error) {
            console.error("Erreur lors du chargement de la session:", error);
            return null;
        }
    }
}