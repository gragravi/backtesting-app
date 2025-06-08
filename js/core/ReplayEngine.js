import EventManager from './EventManager.js';

export class ReplayEngine {
    constructor() {
        this.fullData = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.speed = 1000; // ms par bougie
        this.replayInterval = null;
        this.initialCandles = 50; // Nombre de bougies à afficher au départ
    }

    loadData(data) {
        this.fullData = data;
        
        // CORRECTION : On s'assure que l'index de départ ne dépasse jamais l'avant-dernière bougie
        // pour qu'il y ait toujours au moins une bougie à ajouter.
        // On prend le minimum entre 50 et la taille totale MOINS 2 (pour être sûr).
        const maxInitialIndex = Math.max(1, this.fullData.length - 2); // Il faut au moins 1 bougie
        this.currentIndex = Math.min(this.initialCandles, maxInitialIndex);

        const initialData = this.fullData.slice(0, this.currentIndex);
        EventManager.emit('replay:data-update', initialData);
    }

    stepForward() {
        // La condition est maintenant la bonne, car currentIndex est bien positionné.
        if (this.currentIndex < this.fullData.length) {
            const newCandle = this.fullData[this.currentIndex];
            EventManager.emit('replay:new-candle', newCandle);
            this.currentIndex++;
        } else {
            console.log("Fin du replay.");
            this.pause();
        }
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        if (this.isPlaying || this.currentIndex >= this.fullData.length) return;
        this.isPlaying = true;
        
        this.stepForward();
        this.replayInterval = setInterval(() => this.stepForward(), this.speed);

        EventManager.emit('replay:state-change', { isPlaying: true });
    }

    pause() {
        if (!this.isPlaying) return;
        this.isPlaying = false;
        clearInterval(this.replayInterval);
        this.replayInterval = null;

        EventManager.emit('replay:state-change', { isPlaying: false });
    }

    setSpeed(newSpeed) {
        this.speed = newSpeed;
        if (this.isPlaying) {
            this.pause();
            this.play();
        }
    }
}
