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
        //map.showCharacterInfo(that);
    });

    this.drawText = function() {
        that.text._drawText();
    }
};
