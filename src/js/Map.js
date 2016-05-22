overwatchCharacters.Map = function(settings, rawCharacters) {
    var map;
    var tileLayer;
    var characterLayer = new L.layerGroup();
    var zoomReference = 4;
    var scaleFactor = 1 / Math.pow(2, zoomReference);
    var that = this;

    var templates = {
        episodePicker: $('#t-episode-picker').html()
    };

    //addEpisodePicker();

    init();
    var characters = createCharacters(rawCharacters);
    console.log(characters.length);
    var currentCharacters = characters;
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
        $('#info-box').html(character.name);
        console.log(character);
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
