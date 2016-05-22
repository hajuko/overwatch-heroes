var asd = [
    {
        name: "Eddard Stark",
        pictures: {
            main: "src/img/characters/eddard_stark.jpg"
        },
        mainCharacter : true,
        id: 1,
        coordinates: [100, 100],
        description: "Lorem Ispum Dolor",
        start: {
            season: 1,
            episode: 1
        }
    },
    {
        name: "Maester Aemon",
        pictures: {
            main: "src/img/characters/maester_aemon.jpg"
        },
        id: 2,
        coordinates: [500, 400],
        description: "Lorem Ispum Dolor",
        start: {
            season: 2,
            episode: 5
        }
    },
    {
        name: "Allister Thorne",
        pictures: {
            main: "src/img/characters/allister_thorne.jpg"
        },
        mainCharacter : true,
        id: 3,
        coordinates: [200, 1000],
        description: "Lorem Ispum Dolor",
        start: {
            season: 2,
            episode: 5
        }
    },
    {
        name: "Aero Hotah",
        pictures: {
            main: "src/img/characters/areo_hotah.jpg"
        },
        mainCharacter : true,
        id: 4,
        coordinates: [1800, 1200],
        description: "Lorem Ispum Dolor",
        start: {
            season: 5,
            episode: 2
        }
    },
    {
        name: "Anguy",
        pictures: {
            main: "src/img/characters/anguy.jpg"
        },
        id: 5,
        coordinates: [1200, 500],
        description: "Lorem Ispum Dolor",
        start: {
            season: 2,
            episode: 10
        }
    }
];

var got = {};

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

got.Character = function(data, map) {
    var top = map.scaledCoordinates([data.coordinates[0] + 200, data.coordinates[1] + 200]);
    var bounds =  L.latLngBounds(map.scaledCoordinates(data.coordinates), top);
    var outerBounds = L.latLngBounds(
        map.scaledCoordinates([data.coordinates[0] - 50, data.coordinates[1]]),
        top
    );
    var textPostion = map.scaledCoordinates([data.coordinates[0] - 25, data.coordinates[1]  + 100]);
    var baseFonzSize = 26;
    var that = this;

    fontsize = baseFonzSize * map.scaleFactor;

    this.name = data.name;
    this.pictures = data.pictures;
    this.start = data.start;
    this.text = new L.Text(this.name, textPostion, fontsize);

    this.image = L.imageOverlay(
        this.pictures.main,
        bounds,
        { className: 'character' }
    );

    this.frame = L.rectangle(
        outerBounds,
        {
            fillOpacity: 0.1,
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

got.EpisodeFilter = function(options) {
    var season = parseInt(options.season);
    var episode = parseInt(options.episode);
    // true if it should match exactly the selected season + episode instead of greate equals.
    var match = options.match || false;

    console.log(match);

    function exactFilter(character) {
        return season == character.start.season && episode == character.start.episode;
    }

    function greaterFilter(character) {
        var characterSeason = character.start.season;
        var characterEpisode = character.start.episode;

        var isGreater = season >= characterSeason;

        if (season == characterSeason) {
            isGreater = episode >= characterEpisode;
        }

        return isGreater;
    }

    this.apply = function(array) {
        return array.filter(function(character) {
            if (match) {
                return exactFilter(character);
            } else {
                return greaterFilter(character);
            }
        });
    }
};

got.Map = function(settings, rawCharacters) {
    var map;
    var tileLayer;
    var characterLayer = new L.layerGroup();
    var zoomReference = 4;
    var scaleFactor = 1 / Math.pow(2, zoomReference);
    var that = this;

    var templates = {
        episodePicker: $('#t-episode-picker').html()
    };

    addEpisodePicker();

    var $episodeSelection = $('#episode-selection');
    var $seasonSelection = $('#season-selection');

    init();
    var characters = createCharacters(rawCharacters);
    var currentCharacters = characters;
    //selectEpisodeAndSeason();
    updateCharacters([]);

    function init() {
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
                maxZoom: 5,
                preferCanvas: true
            }
        );

        //map.addLayer(tileLayer);

        var bounds = L.latLngBounds(
            scaledCoordinates([0, 0]),
            scaledCoordinates([4000, 4000])
        );

        var border = L.rectangle(bounds, {fillOpacity: 0});

        border.addTo(map);
        map.addLayer(characterLayer);

        map.fitBounds(
            bounds,
            {
                animate: false
            }
        );

        $episodeSelection.on('change', selectEpisodeAndSeason);
        $seasonSelection.on('change', selectEpisodeAndSeason);

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
        var episodeFilter = new got.EpisodeFilter({
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

        characters.forEach(function(rawCharacter, i) {
            addImageUrls(rawCharacter.pictures);
            var character = new got.Character(rawCharacter, that);

            chars.push(character);
        });

        return chars;
    }

    function addImageUrls(pictures) {
        Object.keys(pictures).forEach(function(key) {
            pictures[key] = settings.imagePath + pictures[key];

        });

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
        character.frame.addTo(layer);
        character.text.addTo(layer);
    }

    function showCharacterInfo(character) {
        $('#info-box').html(character.name);
        console.log(character);
    }

    function addEpisodePicker() {
        $('#episode-picker').html(
            _.template(templates.episodePicker)()
        );
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
    };

    function getCurrentCharacters() {
        return currentCharacters;
    }
};

$(function() {
    var settings = {
        characterSize: 100,
        imagePath: 'src/img/characters/'
    };

    $.ajax({
        dataType: "json",
        url: 'src/data/character_raw.json',
        success: function(result) {
            new got.Map(settings, result);
        }
    });
});
