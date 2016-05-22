$(function() {
    var settings = {
        characterSize: 100,
        imagePath: 'src/data/img/'
    };

    $.ajax({
        dataType: "json",
        url: 'src/data/heroes.json',
        success: function(result) {
            new overwatchCharacters.Map(settings, result);
        }
    });
});
