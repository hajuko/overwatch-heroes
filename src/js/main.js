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
