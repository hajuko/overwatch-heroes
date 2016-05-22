var overwatchCharacters = {};

L.Text = L.Layer.extend({
    //includes: L.Layer.Events,

    initialize: function (_text, _coordinates, _size, font) {
        this.font = font || 'Arial';
        this.text = _text;
        this.coordinates = _coordinates;
        this.size = _size;
    },

    onAdd: function (map) {
        this._map = map;
        this._ctx = this._map._renderer._ctx;
        this._drawText();

        map
            .on('moveend', this._drawText, this)
            .on('viewreset', function() {
                console.log('zoomstart');
            }, this)
    },

    onRemove: function (map) {
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
        var size = this.size * Math.pow(2, this._map.getZoom());

        if (this.text !== '') {
            this._ctx.fillStyle = this.color || '#D0D0DC';
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

overwatchCharacters.Character = function(data, map) {
    var top = map.scaledCoordinates([data.coordinates[0] + 310, data.coordinates[1] + 180]);
    var bounds =  L.latLngBounds(map.scaledCoordinates(data.coordinates), top);
    var textBounds = L.latLngBounds(
        map.scaledCoordinates([data.coordinates[0], data.coordinates[1]]),
        map.scaledCoordinates([data.coordinates[0] + 50, data.coordinates[1] + 180])
    );
    var textPostion = map.scaledCoordinates([data.coordinates[0] + 25, data.coordinates[1]  + 90]);
    var baseFonzSize = 26;
    var that = this;

    fontsize = baseFonzSize * map.scaleFactor;

    this.abilities = data.abilities;
    this.name = data.name;
    this.picture = data.picture;
    this.text = new L.Text(this.name, textPostion, fontsize);

    this.image = L.imageOverlay(
        this.picture,
        bounds,
        { className: 'character' }
    );

    this.textBackground = L.rectangle(
        textBounds,
        {
            fillOpacity: 0.9,
            fillColor: '#28354F',
            stroke: false
        }
    );

    this.frame = L.rectangle(
        bounds,
        {
            fillOpacity: 0,
            fillColor: '#000',
            stroke: false
        }
    );

    this.frame.on('click', function() {
        map.showCharacterInfo(that);
    });

    this.drawText = function() {
        that.text._drawText();
    }
};

overwatchCharacters.Map = function(settings, rawCharacters) {
    var map;
    var tileLayer;
    var characterLayer = new L.layerGroup();
    var zoomReference = 4;
    var scaleFactor = 1 / Math.pow(2, zoomReference);
    var that = this;
    var heroInfo;

    var templates = {
        episodePicker: $('#t-episode-picker').html()
    };

    //addEpisodePicker();

    init();
    var characters = createCharacters(rawCharacters);
    var currentCharacters = characters;
    updateCharacters([]);

    function init() {
        heroInfo = $('#hero-info');
        that.selectCharacter = selectCharacter;
        that.showCharacterInfo = showCharacterInfo;
        that.scaledCoordinates = scaledCoordinates;
        that.scaleFactor = scaleFactor;
        tileLayer = L.tileLayer(
            //'src/data/tiles/{z}/{x}/{y}.png',
            '',
            {
                noWrap: true,
                updateWhenIdle: false
            }
        );

        map = new L.map(
            'leaflet-map',
            {
                crs: L.CRS.Simple,
                center: [0, 0],
                attributionControl: false,
                inertia: false,
                zoom: 0,
                maxZoom: 4,
                preferCanvas: true
            }
        );

        //map.addLayer(tileLayer);

        var bounds = L.latLngBounds(
            scaledCoordinates([0, 0]),
            scaledCoordinates([1330, 2060])
        );

        var border = L.rectangle(bounds, {fillOpacity: 0, color: '#28354F', opacity: 0.9, weight: 1});

        border.addTo(map);
        map.addLayer(characterLayer);

        map.fitBounds(
            bounds,
            {
                animate: false
            }
        );

        //$episodeSelection.on('change', selectEpisodeAndSeason);
        //$seasonSelection.on('change', selectEpisodeAndSeason);

        $('#search .typeahead').typeahead(
            {
                hint: true,
                highlight: true,
                minLength: 1
            },
            {
                display: 'name',
                source: findMatches
            }
        );

        $('.typeahead').bind('typeahead:select', function(event, character) {
            selectCharacter(character);
        });
    }

    function selectEpisodeAndSeason() {
        var episodeFilter = new overwatchCharacters.EpisodeFilter({
            season: $seasonSelection.val(),
            episode: $episodeSelection.val()
        });

        clearCharacters();
        updateCharacters([episodeFilter]);
    }

    function scaledCoordinates(coordinates) {
        return [coordinates[0] * scaleFactor, coordinates[1] * scaleFactor];
    }

    function createCharacters(characters) {
        var chars = [];
        var coordinates = createCoordinates();

        characters.forEach(function(rawCharacter, i) {
            rawCharacter.coordinates = coordinates[i];
            rawCharacter.picture = settings.imagePath + rawCharacter.picture;
            var character = new overwatchCharacters.Character(rawCharacter, that);

            chars.push(character);
        });

        return chars;
    }

    function clearCharacters() {
        map.removeLayer(characterLayer);
        characterLayer = L.layerGroup();
    }

    function updateCharacters(filters) {
        filters = filters || [];
        var filteredCharacters = characters;

        filters.forEach(function(filter) {
            filteredCharacters = filter.apply(filteredCharacters);
        });

        filteredCharacters.forEach(function(character) {
            addCharacter(character, characterLayer);
        });

        currentCharacters = filteredCharacters;

        characterLayer.addTo(map);
    }

    function addCharacter(character, layer) {
        character.image.addTo(layer);
        character.textBackground.addTo(layer);
        character.frame.addTo(layer);
        character.text.addTo(layer);
    }

    function showCharacterInfo(character) {
        var infoTemplate = $('#t-hero-info').html();
        var abilityTemplateFn = _.template($('#t-ability').html());
        heroInfo.html(_.template(infoTemplate)({hero: character, renderAbility: abilityTemplateFn}));
        console.log('show info');

        var closeButton = $('#hero-info-close');
        closeButton.on('click', function() {
            hideCharacterInfo();
        });

        heroInfo.show();
    }

    function hideCharacterInfo() {
        $('#hero-info').hide();
    }

    function selectCharacter(character) {
        showCharacterInfo(character);
        map.fitBounds(character.frame._bounds, {maxZoom: 4});
    }

    function findMatches(q, cb) {
        var matches = [];
        // regex used to determine if a string contains the substring `q`
        var substringRegex = new RegExp(q, 'i');

        // iterate through the pool of strings and for any string that
        // contains the substring `q`, add it to the `matches` array
        $.each(currentCharacters, function(i, currentCharacter) {
            if (substringRegex.test(currentCharacter.name)) {
                matches.push(currentCharacter);
            }
        });

        cb(matches);
    }

    function getCurrentCharacters() {
        return currentCharacters;
    }

    function createCoordinates() {
        var results = [];
        var x = 280;
        var y = 410;
        for (var i = 1; i <= 7; i++) {
            for (var j = 1; j <= 7; j++) {
                results.push([i * y - 310, j * x - 180]);
            }
        }

        return results;
    }
};

$(function() {
    var settings = {
        characterSize: 100,
        imagePath: 'img/'
    };

    $.ajax({
        dataType: "json",
        url: 'data/heroes.json',
        success: function(result) {
            new overwatchCharacters.Map(settings, result);
        }
    });
});
