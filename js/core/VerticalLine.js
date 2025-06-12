// js/core/VerticalLine.js

export class VerticalLine {
    constructor(chart, series, options) {
        this._chart = chart;
        this._series = series; // La série à laquelle on est attaché
        this._options = options;
        this._paneView = new VerticalLinePaneView(this);
    }

    update(options) {
        this._options = { ...this._options, ...options };
        // On notifie la série parente qu'elle doit se redessiner
        this._series.update({});
    }

    paneViews() {
        return [this._paneView];
    }
    
    options() {
        return this._options;
    }
}

class VerticalLinePaneView {
    constructor(source) {
        this._source = source;
    }

    renderer() {
        // La primitive sera dessinée par-dessus les bougies
        return new VerticalLineRenderer(this._source);
    }
}

class VerticalLineRenderer {
    constructor(source) {
        this._source = source;
    }

    draw(target) {
        target.useBitmapCoordinateSpace(scope => {
            const options = this._source.options();
            if (!options.visible || !options.time) {
                return;
            }

            const chart = this._source._chart;
            const timeScale = chart.timeScale();
            const x = timeScale.timeToCoordinate(options.time);

            if (x === null) return;

            const ctx = scope.context;
            ctx.save();
            ctx.strokeStyle = 'rgba(0, 120, 255, 0.7)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, scope.bitmapSize.height);
            ctx.stroke();
            ctx.restore();
        });
    }
}