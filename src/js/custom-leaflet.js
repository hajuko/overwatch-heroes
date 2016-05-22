L.Text = L.Layer.extend({
    //includes: L.Layer.Events,

    initialize: function (_text, _coordinates, _size, font) {
        this.font = font || 'Arial';
        this.text = _text;
        this.coordinates = _coordinates;
        this.size = _size;
        console.log('init');

    },

    onAdd: function (map) {
        this._map = map;
        this._ctx = this._map._renderer._ctx;

        console.log('onAdd');
        this._drawText();

        map
            .on('moveend', this._drawText, this)
            .on('viewreset', function() {
                console.log('zoomstart');
            }, this)
    },

    onRemove: function (map) {
        console.log('remove');
        map.off({
            moveend: this._drawText,
            viewreset: this._onViewReset
        }, this);

        this._requestUpdate();
        this._map = null;
    },

    _onViewReset: function (e) {
        if (e && e.hard) {
            this._drawText();
        }
    },

    _requestUpdate: function () {
        if (this._map && !L.Path._updateRequest) {
            L.Path._updateRequest = L.Util.requestAnimFrame(this._fireMapMoveEnd, this._map);
        }
    },

    _fireMapMoveEnd: function () {
        L.Path._updateRequest = null;
        this.fire('moveend');
    },

    updateText: function(text) {
        this.text = text;
    },

    _drawText: function () {
        var pos = this._map.latLngToLayerPoint(this.coordinates);
        console.log(this._map.getZoom());
        var size = this.size * Math.pow(2, this._map.getZoom());
        console.log(size);

        console.log('draw Text');

        if (this.text !== '') {
            this._ctx.fillStyle = this.color || '#000';
            this._ctx.globalAlpha = 1;
            this._ctx.font = size + 'px ' + this.font;
            this._ctx.textBaseline = 'middle';
            this._ctx.textAlign = 'center';
            this._ctx.fillText(this.text, pos.x, pos.y);
        }
    }
});

L.ImageOverlay = L.ImageOverlay.extend({
    _initImage: function () {
        var img = this._image =
            L.DomUtil.create('img', this.options.className + ' leaflet-image-layer ' + (this._zoomAnimated ? 'leaflet-zoom-animated' : ''));

        img.onselectstart = L.Util.falseFn;
        img.onmousemove = L.Util.falseFn;

        img.onload = L.bind(this.fire, this, 'load');

        if (this.options.crossOrigin) {
            img.crossOrigin = '';
        }

        img.src = this._url;
        img.alt = this.options.alt;
    }
});
